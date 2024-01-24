import { useRouter } from "next/router";
import React, { Fragment, useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { Box, Flex, useDisclosure } from "@chakra-ui/react";

import { useGameContext } from "../../contexts/GameContext";
import Web3Context from "../../contexts/Web3Context/context";

import SessionView3 from "./SessionView3";
import FiltersView2 from "./FiltersView2";
import InviteView from "./InviteView";
import OwnedTokens from "../tokens/OwnedTokens";

import styles from "./SessionsView.module.css";
import { Session, Token } from "../../types";

import { getSessions } from "../../utils/fullcount";

const SessionsView = () => {
  const { updateContext, progressFilter, tokensCache } = useGameContext();
  const web3ctx = useContext(Web3Context);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (router.query.invitedBy && router.query.session) {
      const invitedBy = Array.isArray(router.query.invitedBy)
        ? router.query.invitedBy[0]
        : router.query.invitedBy;
      const inviteCode = Array.isArray(router.query.inviteCode)
        ? router.query.inviteCode[0]
        : router.query.inviteCode;
      const invitedTo = Number(
        Array.isArray(router.query.session) ? router.query.session[0] : router.query.session,
      );
      updateContext({ invitedBy, invitedTo, inviteCode });
      router.push("/", undefined, { shallow: true });
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.invite, router.query.session]);

  // const atBats = useQuery;

  const sessions = useQuery<{ sessions: Session[]; tokens: Token[] }>(
    ["sessions"],
    () => {
      return getSessions({ web3ctx, tokensCache });
    },
    {
      onSuccess: (data) => {
        updateContext({ sessions: data.sessions, tokensCache: data.tokens });
      },
      refetchInterval: 5 * 1000,
    },
  );

  return (
    <Flex className={styles.container}>
      <Flex gap={"20px"} alignItems={"start"}>
        <InviteView isOpen={isOpen} onClose={onClose} />
        <Flex gap={"30px"}>
          <OwnedTokens />
        </Flex>
      </Flex>

      <FiltersView2 />
      {sessions.data && (
        <Flex direction={"column"} gap={"10px"} w={"100%"}>
          {sessions.data.sessions.map((session, idx) => (
            <Fragment key={idx}>
              {progressFilter[session.progress] && (
                <>
                  <SessionView3 session={session} />
                  {idx + 1 < sessions.data.sessions.length && (
                    <Box w={"100%"} h={"0.5px"} bg={"#BFBFBF"} />
                  )}
                </>
              )}
            </Fragment>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default SessionsView;
