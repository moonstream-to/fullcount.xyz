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
import { LeaderboardPosition, OwnedToken, Session } from "../../types";

import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import TokenABIImported from "../../web3/abi/BLBABI.json";
import { getLocalStorageInviteCodeKey, setLocalStorageItem } from "../../utils/localStorage";
import {
  fetchOwnedBLBTokens,
  joinSessionBLB,
  mintBLBToken,
  startSessionBLB,
  unstakeBLBToken,
} from "../../tokenInterfaces/BLBTokenAPI";
import {
  fetchFullcountPlayerTokens,
  joinSessionFullcountPlayer,
  mintFullcountPlayerToken,
  startSessionFullcountPlayer,
  unstakeFullcountPlayer,
} from "../../tokenInterfaces/FullcountPlayerAPI";
import useUser from "../../contexts/UserContext";
import axios from "axios";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];

const assets = FULLCOUNT_ASSETS_PATH;

const BATTERS_LEADERBOARD_ID = "7a9dd040-bbde-48b3-8b02-dcd8aeae1c5e";
const PITCHERS_LEADERBOARD_ID = "f12c61a5-93b4-486a-881e-c159e20b72bc";

const OwnedTokens = ({ forJoin = false }: { forJoin?: boolean }) => {
  const web3ctx = useContext(Web3Context);
  const {
    tokenAddress,
    contractAddress,
    sessions,
    selectedToken,
    updateContext,
    invitedTo,
    inviteCode,
  } = useGameContext();
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const tokenContract = new web3ctx.web3.eth.Contract(TokenABI);
  tokenContract.options.address = tokenAddress;
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI);
  gameContract.options.address = contractAddress;
  const { user } = useUser();

  const mintToken = useMutation(
    async ({ name, imageIndex, source }: { name: string; imageIndex: number; source: string }) => {
      console.log(imageIndex);
      switch (source) {
        case "BLBContract":
          return mintBLBToken({ web3ctx, name, imageIndex });
        case "FullcountPlayerAPI":
          return mintFullcountPlayerToken({ name, imageIndex });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${source}`));
      }
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
    ["owned_tokens", web3ctx.account, user],
    async () => {
      console.log("FETCHING TOKENS");

      async function fetchLeaderboardData(leaderboardId: string) {
        try {
          const res = await axios.get(
            `https://engineapi.moonstream.to/leaderboard/?leaderboard_id=${leaderboardId}&limit=100&offset=0`,
          );
          return res.data.map((t: { address: string }) => {
            const [address, id] = t.address.split("_");
            return { ...t, address, id };
          });
        } catch (e) {
          console.log(e);
          return [];
        }
      }

      const [topBatters, topPitchers, BLBTokens, fullcountPlayerTokens] = await Promise.all([
        fetchLeaderboardData(BATTERS_LEADERBOARD_ID),
        fetchLeaderboardData(PITCHERS_LEADERBOARD_ID),
        fetchOwnedBLBTokens({ web3ctx }).catch((e: any): OwnedToken[] => {
          console.log(e);
          return [];
        }),
        user
          ? fetchFullcountPlayerTokens({ web3ctx }).catch((e: any): OwnedToken[] => {
              console.log(e);
              return [];
            })
          : Promise.resolve([]),
      ]);

      const sortingFn = (
        a: { highestRank: number | undefined },
        b: { highestRank: number | undefined },
      ) => {
        if (a.highestRank === undefined && b.highestRank === undefined) {
          return 0;
        } else if (a.highestRank === undefined) {
          return 1;
        } else if (b.highestRank === undefined) {
          return -1;
        } else {
          return a.highestRank - b.highestRank;
        }
      };

      const ownedTokens = ([] as OwnedToken[])
        .concat(BLBTokens, fullcountPlayerTokens)
        .map((t) => {
          const pitcherPosition: LeaderboardPosition = topPitchers.find(
            (p: { address: string; id: string }) => p.address === t.address && p.id === t.id,
          );
          const batterPosition: LeaderboardPosition = topBatters.find(
            (p: { address: string; id: string }) => p.address === t.address && p.id === t.id,
          );
          let highestRank = undefined;

          if (pitcherPosition && batterPosition) {
            highestRank = Math.min(pitcherPosition.rank, batterPosition.rank);
          } else if (pitcherPosition) {
            highestRank = pitcherPosition.rank;
          } else if (batterPosition) {
            highestRank = batterPosition.rank;
          }
          return { ...t, pitcherPosition, batterPosition, highestRank };
        })
        .sort(sortingFn);
      updateContext({ ownedTokens: [...ownedTokens] });
      return ownedTokens;
    },
    {
      ...queryCacheProps,
      refetchInterval: 10000,
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
        queryClient.setQueryData(
          ["owned_tokens", web3ctx.account, user],
          (oldData: OwnedToken[] | undefined) => {
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
          },
        );
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
        queryClient.setQueryData(
          ["owned_tokens", web3ctx.account, user],
          (oldData: OwnedToken[] | undefined) => {
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
          },
        );
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
        queryClient.setQueryData(
          ["owned_tokens", web3ctx.account, user],
          (oldData: OwnedToken[] | undefined) => {
            const newToken = { ...variables, isStaked: false, stakedSessionID: 0 };
            if (!oldData) {
              return [newToken];
            }
            return oldData.map((t: OwnedToken) =>
              t.address === variables.address && t.id === variables.id ? newToken : t,
            );
          },
        );
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

            {selectedToken.tokenProgress !== 3 && selectedToken.tokenProgress !== 4 ? (
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
            ) : (
              <button
                className={globalStyles.button}
                onClick={() => {
                  updateContext({
                    selectedSession: sessions?.find(
                      (s) => s.sessionID === Number(selectedToken?.stakedSessionID),
                    ),
                  });
                }}
              >
                go
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
                    <Flex position={"relative"}>
                      {token.highestRank && (
                        <>
                          <div className={styles.rankBackground} />
                          <div className={styles.rank}>
                            <div className={styles.rankText}> {token.highestRank}</div>
                          </div>
                        </>
                      )}
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
                    </Flex>
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
        onSave={(name, imageIndex, source) => {
          onClose();
          mintToken.mutate({ name, imageIndex, source });
        }}
      />
    </>
  );
};

export default OwnedTokens;
