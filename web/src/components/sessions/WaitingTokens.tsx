import { OwnedToken, Session } from "../../types";
import styles from "./WaitingTokens.module.css";
import { Flex, Image, Text, useDisclosure } from "@chakra-ui/react";
import React, { useContext } from "react";
import { useMutation, useQueryClient } from "react-query";
import { joinSessionBLB } from "../../tokenInterfaces/BLBTokenAPI";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import Web3Context from "../../contexts/Web3Context/context";
import useUser from "../../contexts/UserContext";
import { useGameContext } from "../../contexts/GameContext";
import useMoonToast from "../../hooks/useMoonToast";
import SelectToken from "./SelectToken";

const WaitingTokens = ({ sessions }: { sessions: Session[] }) => {
  const queryClient = useQueryClient();
  const web3ctx = useContext(Web3Context);
  const user = useUser();
  const { updateContext, selectedToken } = useGameContext();
  const toast = useMoonToast();
  const {
    isOpen: isSelectTokenOpen,
    onOpen: onSelectTokenOpen,
    onClose: onSelectTokenClose,
  } = useDisclosure();

  const joinSession = useMutation(
    async ({ sessionID, token }: { sessionID: number; token: OwnedToken }) => {
      switch (token.source) {
        case "BLBContract":
          return joinSessionBLB({ web3ctx, token, sessionID, inviteCode: undefined });
        case "FullcountPlayerAPI":
          return joinSessionFullcountPlayer({ token, sessionID, inviteCode: undefined });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${token.source}`));
      }
    },
    {
      onSuccess: (_, variables) => {
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

  const handleClick = (session: Session) => {
    if (!selectedToken) {
      updateContext({ invitedTo: session.sessionID });
      onSelectTokenOpen();
      return;
    }
    if (selectedToken?.stakedSessionID) {
      updateContext({ invitedTo: session.sessionID, selectedToken: undefined });
      onSelectTokenOpen();
      return;
    }
    joinSession.mutate({ sessionID: session.sessionID, token: selectedToken });
  };

  return (
    <div className={styles.container}>
      <SelectToken isOpen={isSelectTokenOpen} onClose={onSelectTokenClose} />

      {sessions.map((s) => {
        const token = s.pair.pitcher ?? s.pair.batter;
        if (!token) {
          return <></>;
        }
        return (
          <div className={styles.token} key={s.sessionID} onClick={() => handleClick(s)}>
            <Image h={"40px"} w={"40px"} alt={""} src={token.image} border="1px solid #4D4D4D" />
            <Text>{token.name}</Text>
          </div>
        );
      })}
    </div>
  );
};

export default WaitingTokens;
