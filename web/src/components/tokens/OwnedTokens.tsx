import { useQuery, useMutation, useQueryClient } from "react-query";
import styles from "./OwnedTokens.module.css";
import { Flex, Image, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import Web3Context from "../../contexts/Web3Context/context";
import React, { useContext, useEffect } from "react";
import { useGameContext } from "../../contexts/GameContext";
import useMoonToast from "../../hooks/useMoonToast";
import CreateNewCharacter from "./CreateNewCharacter";
import queryCacheProps from "../../hooks/hookCommon";
import CharacterCard from "./CharacterCard";
import { decodeBase64Json } from "../../utils/decoders";
import { OwnedToken, Session, Token } from "../../types";
import globalStyles from "./OwnedTokens.module.css";

import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];
import TokenABIImported from "../../web3/abi/BLBABI.json";
const TokenABI = TokenABIImported as unknown as AbiItem[];

const assets = FULLCOUNT_ASSETS_PATH;

const OwnedTokens = ({ forJoin = false }: { forJoin?: boolean }) => {
  const web3ctx = useContext(Web3Context);
  const {
    tokensCache,
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

  const tokenContract = new web3ctx.web3.eth.Contract(TokenABI);
  tokenContract.options.address = tokenAddress;
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI);
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
        queryClient.invalidateQueries("owned_tokens"); //TODO data update
      },
      onError: (e: Error) => {
        console.log(e);
        toast("Minting failed.", "error");
      },
    },
  );

  const ownedTokens = useQuery<OwnedToken[]>(
    ["owned_tokens"],
    async () => {
      console.log("ownedTokens");

      const balanceOf = await tokenContract.methods.balanceOf(web3ctx.account).call();
      const tokens: OwnedToken[] = [];
      for (let i = 0; i < balanceOf; i++) {
        const tokenId = await tokenContract.methods.tokenOfOwnerByIndex(web3ctx.account, i).call();
        const stakedSessionID = Number(
          await gameContract.methods.StakedSession(tokenContract.options.address, tokenId).call(),
        );
        const isStaked = stakedSessionID !== 0;
        const tokenFromCache = tokensCache.find(
          (t) => t.id === tokenId && t.address === tokenContract.options.address,
        );
        if (!tokenFromCache) {
          const URI = await tokenContract.methods.tokenURI(tokenId).call();
          let tokenMetadata = { name: "", image: "" };
          try {
            tokenMetadata = decodeBase64Json(URI);
            tokens.push({
              id: tokenId,
              name: tokenMetadata.name.split(` - ${tokenId}`)[0],
              image: tokenMetadata.image,
              address: tokenContract.options.address,
              staker: web3ctx.account,
              isStaked,
              stakedSessionID,
            });
          } catch (e) {
            console.log(e);
          }
        } else {
          tokens.push({ ...tokenFromCache, isStaked, stakedSessionID });
        }
      }
      return tokens;
    },
    {
      ...queryCacheProps,
      refetchInterval: 50000,
    },
  );

  const startSession = useMutation(
    async ({ role, token }: { role: number; token: Token }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      return gameContract.methods.startSession(token.address, token.id, role).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: async (data, variables) => {
        queryClient.setQueryData(["sessions"], (oldData: Session[] | undefined) => {
          const newSession: Session = {
            batterLeftSession: false,
            pitcherLeftSession: false,
            progress: 2,
            sessionID: Number(data.events.SessionStarted.returnValues.sessionID),
            pair: {
              batter: variables.role === 0 ? undefined : variables.token,
              pitcher: variables.role === 1 ? undefined : variables.token,
            },
            phaseStartTimestamp: 0,
            secondsPerPhase: 0,
            outcome: 0,
            didPitcherCommit: false,
            didBatterCommit: false,
            didPitcherReveal: false,
            didBatterReveal: false,
          };
          updateContext({
            sessions: oldData ? [...oldData, newSession] : [newSession],
            selectedSession: newSession,
          });
          return oldData ? [...oldData, newSession] : [newSession];
        });
        queryClient.setQueryData(["owned_tokens"], (oldData: OwnedToken[] | undefined) => {
          if (!oldData) {
            console.log(variables, oldData);
            console.log("Token created session but ownedTokens undefined");
            return [];
          }
          return oldData.map((t) => {
            const newToken = {
              ...t,
              isStaked: true,
              stakedSessionID: Number(data.events.SessionStarted.returnValues.sessionID),
            };
            if (selectedToken === t) {
              updateContext({ selectedToken: newToken });
            }
            return t.address === variables.token.address && t.id === variables.token.id
              ? newToken
              : t;
          });
        });
      },
      onError: (e: Error) => {
        toast("Start failed" + e?.message, "error");
      },
    },
  );

  const joinSession = useMutation(
    async ({ sessionID, token }: { sessionID: number; token: Token }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      return gameContract.methods.joinSession(sessionID, token.address, token.id).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: async (data, variables) => {
        queryClient.setQueryData(["sessions"], (oldData: Session[] | undefined) => {
          if (!oldData) {
            return [];
          }
          const newSessions = oldData.map((s: Session) => {
            if (s.sessionID !== variables.sessionID) {
              return s;
            }
            if (!s.pair.pitcher) {
              return { ...s, progress: 3, pair: { ...s.pair, pitcher: { ...variables.token } } };
            }
            if (!s.pair.batter) {
              return { ...s, progress: 3, pair: { ...s.pair, batter: { ...variables.token } } };
            }
            return s;
          });
          updateContext({
            sessions: newSessions,
            selectedSession: newSessions?.find((s: Session) => s.sessionID === variables.sessionID),
          });

          return newSessions ?? [];
        });
        queryClient.setQueryData(["owned_tokens"], (oldData: OwnedToken[] | undefined) => {
          if (!oldData) {
            console.log("Token joined but ownedTokens undefined");
            return [];
          }
          return oldData.map((t: OwnedToken) =>
            t.address === variables.token.address && t.id === variables.token.id
              ? { ...t, isStaked: true, stakedSessionID: variables.sessionID }
              : t,
          );
        });
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

  const unstakeNFT = useMutation(
    async (token: OwnedToken) => {
      console.log(tokenProgress(token) === 2, token);
      if (tokenProgress(token) === 2 && token.isStaked) {
        console.log("qq");
        return gameContract.methods.abortSession(token.stakedSessionID).send({
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
      onSuccess: (_, variables) => {
        queryClient.setQueryData(["sessions"], (oldData: Session[] | undefined) => {
          const newSessions =
            oldData?.map((s) => {
              if (
                s.pair.pitcher?.address === variables.address &&
                s.pair.pitcher.id === variables.id &&
                !s.pitcherLeftSession
              ) {
                return { ...s, pitcherLeftSession: true };
              }
              if (
                s.pair.batter?.address === variables.address &&
                s.pair.batter.id === variables.id &&
                !s.batterLeftSession
              ) {
                return { ...s, batterLeftSession: true };
              }
              return s;
            }) ?? [];
          updateContext({
            sessions: newSessions,
          });
          return newSessions;
        });
        queryClient.setQueryData(["owned_tokens"], (oldData: OwnedToken[] | undefined) => {
          console.log(oldData, variables);
          const newToken = { ...variables, isStaked: false, stakedSessionID: 0 };
          if (!oldData) {
            console.log("Token unstaked but ownedTokens undefined");
            return [newToken];
          }
          const newData = oldData.map((t: OwnedToken) =>
            t.address === variables.address && t.id === variables.id ? newToken : t,
          );
          if (selectedToken === variables) {
            console.log(newToken);
            updateContext({ selectedToken: newToken });
          }
          return newData;
        });
      },
      onError: (e: Error) => {
        console.log(e);
        toast("Unstake failed", "error");
      },
    },
  );

  const isPitcherInvited = () =>
    !sessions?.find((s) => s.sessionID === invitedTo)?.pair.pitcher?.id;

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
        {selectedToken && !selectedToken?.isStaked && !forJoin && (
          <Flex direction={"column"} minH={"229px"}>
            <CharacterCard token={selectedToken} isActive={false} placeSelf={"start"} />
            {forJoin && invitedTo ? (
              <button
                className={globalStyles.button}
                style={{ width: "139px" }}
                onClick={() => joinSession.mutate({ sessionID: invitedTo, token: selectedToken })}
              >
                {joinSession.isLoading ? (
                  <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                ) : (
                  <Image
                    src={`${assets}/${isPitcherInvited() ? "ball2.png" : "bat2.png"}`}
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
                    onClick={() => startSession.mutate({ role: 0, token: selectedToken })}
                  >
                    {startSession.isLoading && startSession.variables?.role === 0 ? (
                      <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                    ) : (
                      <Image src={`${assets}/ball2.png`} h={"24px"} w={"24px"} alt={"o"} />
                    )}
                  </button>
                  <button
                    className={globalStyles.button}
                    onClick={() => startSession.mutate({ role: 1, token: selectedToken })}
                    style={{ width: "69px" }}
                  >
                    {startSession.isLoading && startSession.variables?.role === 1 ? (
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
        {selectedToken && selectedToken.isStaked && (
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
              .filter((t) => !forJoin || !t.isStaked)
              .map((token: Token, idx: number) => (
                <Flex direction={"column"} key={idx}>
                  <CharacterCard
                    token={token}
                    isActive={false}
                    w={"70px"}
                    h={"85px"}
                    showName={false}
                    isClickable={true}
                    border={
                      selectedToken?.id === token.id ? "1px solid white" : "1px solid #4D4D4D"
                    }
                  />
                  {forJoin && invitedTo && selectedToken?.id === token.id && (
                    <button
                      className={globalStyles.inviteButton}
                      style={{ width: "70px" }}
                      onClick={() =>
                        joinSession.mutate({ sessionID: invitedTo, token: selectedToken })
                      }
                    >
                      {joinSession.isLoading ? (
                        <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                      ) : (
                        <Image
                          src={`${assets}/${isPitcherInvited() ? "ball2.png" : "bat2.png"}`}
                          h={"24px"}
                          w={"24px"}
                          alt={"o"}
                        />
                      )}
                    </button>
                  )}
                </Flex>
              ))}
          {ownedTokens.data && ownedTokens.data.length > 0 && (
            <Flex
              w={"70px"}
              h={"85px"}
              className={styles.mintCard}
              onClick={onOpen}
              cursor={"pointer"}
              flexShrink={"0"}
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
