import { useMutation, useQuery, useQueryClient } from "react-query";
import styles from "./OwnedTokens.module.css";
import globalStyles from "./OwnedTokens.module.css";
import {
  Flex,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SlideFade,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Web3Context from "../../contexts/Web3Context/context";
import React, { useContext, useEffect } from "react";
import { useGameContext } from "../../contexts/GameContext";
import useMoonToast from "../../hooks/useMoonToast";
import CreateNewCharacter from "./CreateNewCharacter";
import queryCacheProps from "../../hooks/hookCommon";
import CharacterCard from "./CharacterCard";
import { OwnedToken, Session } from "../../types";

import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import TokenABIImported from "../../web3/abi/BLBABI.json";
import { sendTransactionWithEstimate } from "../../utils/sendTransactions";
import { getLocalStorageInviteCodeKey, setLocalStorageItem } from "../../utils/localStorage";
import {
  fetchOwnedBLBTokens,
  joinSessionBLB,
  startSessionBLB,
  unstakeBLBToken,
} from "../../tokenInterfaces/BLBTokenAPI";
import {
  fetchFullcountPlayerTokens,
  joinSessionFullcountPlayer,
  startSessionFullcountPlayer,
  unstakeFullcountPlayer,
} from "../../tokenInterfaces/FullcountPlayerAPI";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];

const assets = FULLCOUNT_ASSETS_PATH;

const OwnedTokens = ({ forJoin = false }: { forJoin?: boolean }) => {
  const web3ctx = useContext(Web3Context);
  const { tokenAddress, contractAddress, selectedToken, updateContext, invitedTo, inviteCode } =
    useGameContext();
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
      return sendTransactionWithEstimate(
        web3ctx.account,
        tokenContract.methods.mint(name, imageIndex),
      );
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
      console.log("FETCHING TOKENS");
      const BLBTokens = await fetchOwnedBLBTokens({ web3ctx });
      const fullcountPlayerTokens = await fetchFullcountPlayerTokens({ web3ctx });
      return BLBTokens.concat(fullcountPlayerTokens);
    },
    {
      ...queryCacheProps,
      refetchInterval: 500000,
    },
  );

  const startSession = useMutation(
    async ({
      role,
      token,
      requireSignature,
    }: {
      role: number;
      token: OwnedToken;
      requireSignature: boolean;
    }): Promise<{ sessionID: string; sign: string | undefined }> => {
      switch (token.source) {
        case "BLBContract":
          return startSessionBLB({ web3ctx, token, role, requireSignature });
        case "FullcountPlayerAPI":
          return startSessionFullcountPlayer({ token, roleNumber: role, requireSignature });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${token.source}`));
      }
    },
    {
      onSuccess: async (data: { sessionID: string; sign: string | undefined }, variables) => {
        if (data.sign) {
          const inviteCodeKey = getLocalStorageInviteCodeKey(contractAddress, data.sessionID);
          setLocalStorageItem(inviteCodeKey, data.sign);
        }
        queryClient.setQueryData(["sessions"], (oldData: Session[] | undefined) => {
          const newSession: Session = {
            requiresSignature: variables.requireSignature,
            batterLeftSession: false,
            pitcherLeftSession: false,
            progress: 2,
            sessionID: Number(data.sessionID),
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
            return [];
          }
          return oldData.map((t) => {
            if (t.address === variables.token.address && t.id === variables.token.id) {
              return {
                ...t,
                isStaked: true,
                stakedSessionID: Number(data.sessionID),
                tokenProgress: 2,
              };
            }
            return t;
          });
        });
      },
      onError: (e: Error) => {
        toast("Start failed" + e?.message, "error");
      },
    },
  );

  const joinSession = useMutation(
    async ({
      sessionID,
      token,
      inviteCode,
    }: {
      sessionID: number;
      token: OwnedToken;
      inviteCode: string;
    }): Promise<unknown> => {
      switch (token.source) {
        case "BLBContract":
          return joinSessionBLB({ web3ctx, token, sessionID, inviteCode });
        case "FullcountPlayerAPI":
          return joinSessionFullcountPlayer({ token, sessionID, inviteCode });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${token.source}`));
      }
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
            return [];
          }
          return oldData.map((t) => {
            if (t.address === variables.token.address && t.id === variables.token.id) {
              return {
                ...t,
                isStaked: true,
                stakedSessionID: variables.sessionID,
                tokenProgress: 3,
              };
            }
            return t;
          });
        });
      },
      onError: (e: Error) => {
        toast("Join failed" + e?.message, "error");
      },
    },
  );

  const unstakeNFT = useMutation(
    async (token: OwnedToken) => {
      switch (token.source) {
        case "BLBContract":
          return unstakeBLBToken({ web3ctx, token });
        case "FullcountPlayerAPI":
          return unstakeFullcountPlayer({ token });
        default:
          return Promise.reject(
            new Error(`Unknown or unsupported token source for unstaking: ${token.source}`),
          );
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
          const newToken = { ...variables, isStaked: false, stakedSessionID: 0 };
          if (!oldData) {
            return [newToken];
          }
          return oldData.map((t: OwnedToken) =>
            t.address === variables.address && t.id === variables.id ? newToken : t,
          );
        });
      },
      onError: (e: Error) => {
        console.log(e);
        toast("Unstake failed", "error");
      },
    },
  );

  useEffect(() => {
    if (!selectedToken || !ownedTokens.data) return;
    const newSelectedToken = ownedTokens.data.find(
      (t) => t.address === selectedToken.address && t.id === selectedToken.id,
    );
    updateContext({ selectedToken: newSelectedToken });
  }, [ownedTokens.data]);

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

            <Flex minW={"139px"}>
              <Popover placement="top">
                <PopoverTrigger>
                  <button className={globalStyles.button} style={{ width: "70px" }}>
                    <Image src={`${assets}/ball2.png`} h={"24px"} w={"24px"} alt={"o"} />
                  </button>
                </PopoverTrigger>
                <SlideFade in={true} offsetY="200px">
                  <PopoverContent bg={"#252525"} border={"1px solid #4d4d4d"}>
                    <Flex bg={"#GGG"} p={"30px"} direction={"column"} gap={"10px"}>
                      <button
                        className={globalStyles.createSessionButton}
                        onClick={() =>
                          startSession.mutate({
                            role: 0,
                            token: selectedToken,
                            requireSignature: false,
                          })
                        }
                      >
                        {startSession.isLoading &&
                        startSession.variables?.role === 0 &&
                        !startSession.variables?.requireSignature ? (
                          <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                        ) : (
                          "Open challenge"
                        )}
                      </button>
                      <button
                        className={globalStyles.createSessionButton}
                        onClick={() =>
                          startSession.mutate({
                            role: 0,
                            token: selectedToken,
                            requireSignature: true,
                          })
                        }
                      >
                        {startSession.isLoading &&
                        startSession.variables?.role === 0 &&
                        startSession.variables?.requireSignature ? (
                          <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                        ) : (
                          "By invite link only"
                        )}
                      </button>
                    </Flex>
                  </PopoverContent>
                </SlideFade>
              </Popover>
              <Popover placement="top">
                <PopoverTrigger>
                  <button className={globalStyles.button} style={{ width: "69px" }}>
                    <Image src={`${assets}/bat2.png`} h={"24px"} w={"24px"} alt={"o"} />
                  </button>
                </PopoverTrigger>
                <SlideFade in={true} offsetY="200px">
                  <PopoverContent bg={"#252525"} border={"1px solid #4d4d4d"}>
                    <Flex bg={"#GGG"} p={"30px"} direction={"column"} gap={"10px"}>
                      <button
                        className={globalStyles.createSessionButton}
                        onClick={() =>
                          startSession.mutate({
                            role: 1,
                            token: selectedToken,
                            requireSignature: false,
                          })
                        }
                      >
                        {startSession.isLoading &&
                        startSession.variables?.role === 1 &&
                        !startSession.variables?.requireSignature ? (
                          <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                        ) : (
                          "Open challenge"
                        )}
                      </button>
                      <button
                        className={globalStyles.createSessionButton}
                        onClick={() =>
                          startSession.mutate({
                            role: 1,
                            token: selectedToken,
                            requireSignature: true,
                          })
                        }
                      >
                        {startSession.isLoading &&
                        startSession.variables?.role === 1 &&
                        startSession.variables?.requireSignature ? (
                          <Spinner pt="6px" pb="7px" h={"16px"} w={"16px"} />
                        ) : (
                          "By invite link only"
                        )}
                      </button>
                    </Flex>
                  </PopoverContent>
                </SlideFade>
              </Popover>
            </Flex>
          </Flex>
        )}
        {selectedToken && selectedToken.isStaked && (
          <Flex direction={"column"} minH={"229px"} minW={"139px"}>
            <CharacterCard token={selectedToken} isActive={false} placeSelf={"start"} />
            {selectedToken.tokenProgress !== 3 && selectedToken.tokenProgress !== 4 && (
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
              .map((token: OwnedToken, idx: number) => (
                <React.Fragment key={idx}>
                  {joinSession.isLoading && joinSession.variables?.token.id === token.id ? (
                    <Flex h={"75px"} w={"75px"} alignItems={"center"} justifyContent={"center"}>
                      <Spinner />
                    </Flex>
                  ) : (
                    <Image
                      src={token.image}
                      alt={""}
                      cursor={"pointer"}
                      h={"75px"}
                      w={"75px"}
                      onClick={() => {
                        updateContext({ selectedToken: token });
                        if (forJoin && invitedTo) {
                          joinSession.mutate({
                            sessionID: invitedTo,
                            token,
                            inviteCode,
                          });
                        }
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
          {ownedTokens.data && ownedTokens.data.length > 0 && (
            <Flex
              w={"75px"}
              h={"75px"}
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
