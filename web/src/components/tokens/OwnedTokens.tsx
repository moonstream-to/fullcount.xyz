import { useQuery, useMutation, useQueryClient } from "react-query";
import { MoonstreamWeb3ProviderInterface } from "../../types/Moonstream";
import styles from "./OwnedTokens.module.css";
import { Flex, Image, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import Web3Context from "../../contexts/Web3Context/context";
import React, { useContext } from "react";
import { useGameContext } from "../../contexts/GameContext";
import useMoonToast from "../../hooks/useMoonToast";
import CreateNewCharacter from "./CreateNewCharacter";
import queryCacheProps from "../../hooks/hookCommon";
import CharacterCard from "./CharacterCard";
import { decodeBase64Json } from "../../utils/decoders";
import { Session, Token } from "../../types";
import globalStyles from "./OwnedTokens.module.css";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../../web3/abi/BLBABI.json");
const assets = FULLCOUNT_ASSETS_PATH;

const OwnedTokens = ({ forJoin = false }: { forJoin?: boolean }) => {
  const web3ctx = useContext(Web3Context);
  const {
    isTokenSelected,
    sessions,
    tokenAddress,
    contractAddress,
    selectedToken,
    updateContext,
    invitedTo,
  } = useGameContext();
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  tokenContract.options.address = tokenAddress;
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const mintToken = useMutation(
    async ({ name, imageIndex }: { name: string; imageIndex: number }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      return tokenContract.methods.mint(name, imageIndex).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Minting failed." + e?.message, "error");
      },
    },
  );

  const ownedTokens = useQuery<Token[]>(
    ["owned_tokens", web3ctx.account, web3ctx.chainId],
    async () => {
      console.log("ownedTokens");

      const balanceOf = await tokenContract.methods.balanceOf(web3ctx.account).call();
      const tokens = [];
      for (let i = 0; i < balanceOf; i++) {
        const tokenId = await tokenContract.methods.tokenOfOwnerByIndex(web3ctx.account, i).call();
        const tokenMetadata = decodeBase64Json(
          await tokenContract.methods.tokenURI(tokenId).call(),
        );
        tokens.push({
          id: tokenId,
          name: tokenMetadata.name.split(` - ${tokenId}`)[0],
          image: tokenMetadata.image,
          address: tokenContract.options.address,
        });
      }
      // const notStakedTokens = tokens.filter((t) => !isTokenStaked(t));
      // console.log(isTokenSelected);
      // if (!isTokenSelected && tokens.length > 0) {
      //   console.log("setting token");
      //   const randomIndex = Math.floor(Math.random() * tokens.length);
      //   updateContext({ selectedToken: tokens[randomIndex] });
      // }
      return tokens;
    },
    {
      ...queryCacheProps,
    },
  );

  const startSession = useMutation(
    async (role: number) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      return gameContract.methods.startSession(tokenAddress, selectedToken?.id, role).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: async () => {
        console.log("refetching");
        await queryClient.refetchQueries("sessions");
        console.log("refetched");
        queryClient.invalidateQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Start failed" + e?.message, "error");
      },
    },
  );

  const joinSession = useMutation(
    async (sessionID: number) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      console.log(sessionID, tokenAddress, selectedToken);
      return gameContract.methods.joinSession(sessionID, tokenAddress, selectedToken?.id).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: async (data, variables) => {
        queryClient.setQueryData(["sessions"], (oldData: any) => {
          const newSessions = oldData.map((s: Session) => {
            if (s.sessionID !== variables) {
              return s;
            }
            if (!s.pair.batter) {
              return { ...s, pair: { ...s.pair, batter: selectedToken } };
            }
            if (!s.pair.pitcher) {
              return { ...s, pair: { ...s.pair, pitcher: { ...selectedToken } } };
            }
          });
          updateContext({
            sessions: newSessions,
            selectedSession: newSessions?.find((s: Session) => s.sessionID === variables),
          });
          return newSessions;
        });
        queryClient.invalidateQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Join failed" + e?.message, "error");
      },
    },
  );

  const tokenProgress = (token: Token) => {
    return sessions?.find(
      (session) => session.pair.pitcher?.id === token.id || session.pair.batter?.id === token.id,
    )?.progress;
  };
  const tokenSessionID = (token: Token) => {
    return sessions?.find(
      (session) => session.pair.pitcher?.id === token.id || session.pair.batter?.id === token.id,
    )?.sessionID;
  };

  const unstakeNFT = useMutation(
    async (token: Token) => {
      if (tokenProgress(token) === 2 && tokenSessionID(token)) {
        return gameContract.methods.abortSession(tokenSessionID(token)).send({
          from: web3ctx.account,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        });
      }
      if (tokenProgress(token) === 5 || tokenProgress(token) === 6) {
        return gameContract.methods.unstakeNFT(token.address, token.id).send({
          from: web3ctx.account,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        });
      }
    },
    {
      onSuccess: () => {
        // queryClient.invalidateQueries("sessions");
        queryClient.refetchQueries("sessions");
        queryClient.refetchQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Unstake failed." + e?.message, "error");
      },
    },
  );

  const isPitcherInvited = (token?: Token) =>
    !sessions?.find((s) => s.sessionID === invitedTo)?.pair.pitcher?.id;

  const isTokenStaked = (token: Token) => {
    console.log("Is token staked: ", sessions);
    return sessions?.find(
      (s) =>
        (s.pair.pitcher?.id === token.id &&
          s.pair.pitcher?.address === token.address &&
          !s.pitcherLeft) ||
        (s.pair.batter?.id === token.id &&
          s.pair.batter?.address === token.address &&
          !s.batterLeft),
    );
  };

  return (
    <>
      <Flex gap={"15px"}>
        {ownedTokens.data && ownedTokens.data.length < 1 && (
          <>
            <Flex
              w={"137px"}
              h={"224px"}
              className={styles.mintCard}
              onClick={onOpen}
              cursor={"pointer"}
            >
              {mintToken.isLoading ? (
                <Spinner />
              ) : (
                <Text>
                  Create character
                  <br /> to play
                </Text>
              )}
            </Flex>
          </>
        )}
        {selectedToken && !isTokenStaked(selectedToken) && !forJoin && (
          <Flex direction={"column"} minH={"229px"}>
            <CharacterCard token={selectedToken} isActive={false} placeSelf={"start"} />
            {forJoin && invitedTo ? (
              <button
                className={globalStyles.button}
                style={{ width: "139px" }}
                onClick={() => joinSession.mutate(invitedTo)}
              >
                {joinSession.isLoading ? (
                  <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                ) : (
                  <Image
                    src={`${assets}/${isPitcherInvited(selectedToken) ? "ball2.png" : "bat2.png"}`}
                    h={"24px"}
                    w={"24px"}
                    alt={"o"}
                  />
                )}
              </button>
            ) : (
              <>
                <Flex minW={"139px"}>
                  <button
                    className={globalStyles.button}
                    style={{ width: "70px" }}
                    onClick={() => startSession.mutate(0)}
                  >
                    {startSession.isLoading && startSession.variables === 0 ? (
                      <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                    ) : (
                      <Image src={`${assets}/ball2.png`} h={"24px"} w={"24px"} alt={"o"} />
                    )}
                  </button>
                  <button
                    className={globalStyles.button}
                    onClick={() => startSession.mutate(1)}
                    style={{ width: "69px" }}
                  >
                    {startSession.isLoading && startSession.variables === 1 ? (
                      <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                    ) : (
                      <Image src={`${assets}/bat2.png`} h={"24px"} w={"24px"} alt={"x"} />
                    )}
                  </button>
                </Flex>
              </>
            )}
          </Flex>
        )}
        {selectedToken && isTokenStaked(selectedToken) && (
          <Flex direction={"column"} minH={"229px"} mr={"-5px"}>
            <CharacterCard token={selectedToken} isActive={false} placeSelf={"start"} />
            {tokenProgress(selectedToken) !== 3 && tokenProgress(selectedToken) !== 4 && (
              <button
                className={globalStyles.button}
                onClick={() => unstakeNFT.mutate(selectedToken)}
              >
                {unstakeNFT.isLoading ? (
                  <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                ) : (
                  "unstake"
                )}
              </button>
            )}
          </Flex>
        )}
        <Flex className={styles.cards}>
          {ownedTokens.data &&
            ownedTokens.data
              .filter((t) => !forJoin || !isTokenStaked(t))
              .map((token: Token, idx: number) => (
                <Flex direction={"column"} key={idx}>
                  <CharacterCard
                    token={token}
                    isActive={false}
                    maxW={"70px"}
                    maxH={"85px"}
                    showName={false}
                    isClickable={true}
                    border={
                      selectedToken?.id === token.id ? "1px solid white" : "1px solid #4D4D4D"
                    }
                    flexShrink={"0"}
                  />
                  {forJoin && invitedTo && selectedToken?.id === token.id && (
                    <button
                      className={globalStyles.inviteButton}
                      style={{ width: "70px" }}
                      onClick={() => joinSession.mutate(invitedTo)}
                    >
                      {joinSession.isLoading ? (
                        <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                      ) : (
                        <Image
                          src={`${assets}/${
                            isPitcherInvited(selectedToken) ? "ball2.png" : "bat2.png"
                          }`}
                          h={"24px"}
                          w={"24px"}
                          alt={"o"}
                        />
                      )}
                    </button>
                  )}
                </Flex>
              ))}
          {ownedTokens.data && ownedTokens.data.filter((t) => !isTokenStaked(t)).length > 0 && (
            <Flex
              w={"70px"}
              h={"85px"}
              className={styles.mintCard}
              onClick={onOpen}
              cursor={"pointer"}
            >
              {mintToken.isLoading ? <Spinner /> : " + Create"}
            </Flex>
          )}
        </Flex>
      </Flex>

      <CreateNewCharacter
        isOpen={isOpen}
        onClose={onClose}
        onSave={(name, imageIndex) => {
          onClose();
          mintToken.mutate({ name, imageIndex });
        }}
      />
    </>
  );
};

export default OwnedTokens;
