import { useGameContext } from "../../contexts/GameContext";
import styles from "./TokenTransfers.module.css";
import { OwnedToken, TokenSource } from "../../types";
import { Image } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import useUser from "../../contexts/UserContext";
import { signTransferAuthorization } from "../../utils/signTokenTransfer";
import Web3Context from "../../contexts/Web3Context/context";
import { Query, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { FULLCOUNT_PLAYER_API } from "../../constants";

const Token = ({
  token,
  isSelected,
  onClick,
  source,
}: {
  token: OwnedToken;
  isSelected: boolean;
  onClick: () => void;
  source: TokenSource;
}) => {
  return (
    <div className={styles.token}>
      {source === "FullcountPlayerAPI" && <ArrowLeftIcon onClick={onClick} />}
      <div className={styles.tokenName}>{token.name}</div>
      <Image src={token.image} h={"50px"} w={"50px"} alt={""} />
      {source === "BLBContract" && <ArrowRightIcon onClick={onClick} />}
    </div>
  );
};

const TokenTransfers = () => {
  const { ownedTokens, updateContext } = useGameContext();
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const { user } = useUser();
  const web3ctx = useContext(Web3Context);
  const queryClient = useQueryClient();

  const transferToFCP = async (token: OwnedToken) => {
    const playerId = user.user_id;
    const deadline = 1711371604;
    const authorization = await signTransferAuthorization(
      web3ctx.account,
      window.ethereum,
      token.address,
      token.id,
      deadline,
      playerId,
    );
    const data = {
      tokenAddress: token.address,
      tokenId: token.id,
      deadline,
      playerId,
      authorization,
    };
    transferToFCPMutation.mutate(data);
  };

  interface PostRequestData {
    tokenAddress: string;
    tokenId: string;
    deadline: number;
    playerId: string;
    authorization: string;
  }

  const transferToFCPMutation = useMutation(
    (requestData: PostRequestData) =>
      axios.post(
        `${FULLCOUNT_PLAYER_API}/nfts`,
        {
          erc721_address: requestData.tokenAddress,
          token_id: requestData.tokenId,
          deadline: requestData.deadline,
          player_id: requestData.playerId,
          authorization: requestData.authorization,
        },
        {
          headers: getHeaders(),
        },
      ),
    {
      onError: (e: any) => {
        console.error("Error transferring authorization:", e);
      },
      onSuccess: (_, variables) => {
        updateContext({
          ownedTokens: ownedTokens.map((token: OwnedToken) => {
            if (variables.tokenId === token.id) {
              return { ...token, source: "FullcountPlayerAPI" };
            }
            return token;
          }),
        });
      },
    },
  );

  interface DeleteRequestData {
    nfts: {
      address: string;
      id: string;
    }[];
    account: string;
    user: any;
  }

  const getHeaders = () => {
    const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
    return {
      Authorization: `bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };
  };

  const surrenderMutation = useMutation(
    (requestData: DeleteRequestData) =>
      axios.delete(`${FULLCOUNT_PLAYER_API}/nfts`, {
        headers: getHeaders(),
        data: {
          to: requestData.account,
          nfts: requestData.nfts.map((nft) => ({ erc721_address: nft.address, token_id: nft.id })),
        },
      }),
    {
      onSuccess: (data, variables) => {
        updateContext({
          ownedTokens: ownedTokens.map((token: OwnedToken) => {
            if (variables.nfts.some((nft) => nft.id === token.id)) {
              return { ...token, source: "BLBContract" };
            }
            return token;
          }),
        });
      },
    },
  );

  const transferFromFCP = async (nfts: OwnedToken[]) => {
    const data = {
      account: web3ctx.account,
      nfts,
      user,
    };

    try {
      await surrenderMutation.mutateAsync(data);
      console.log("NFT deleted successfully");
    } catch (error) {
      console.error("Error deleting NFT:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tokensContainer}>
        <div className={styles.header}>BLB Tokens</div>
        {ownedTokens
          .filter((t) => t.source === "BLBContract")
          .map((t) => (
            <Token
              key={t.id}
              token={t}
              isSelected={t.id === selectedTokenId}
              onClick={() => transferToFCP(t)}
              source={"BLBContract"}
            />
          ))}
      </div>
      <div className={styles.tokensContainer}>
        <div className={styles.header}>FullcountPlayer Tokens</div>
        {ownedTokens
          .filter((t) => t.source === "FullcountPlayerAPI")
          .map((t) => (
            <Token
              key={t.id}
              token={t}
              isSelected={t.id === selectedTokenId}
              onClick={() => transferFromFCP([t])}
              source={"FullcountPlayerAPI"}
            />
          ))}
      </div>
    </div>
  );
};

export default TokenTransfers;
