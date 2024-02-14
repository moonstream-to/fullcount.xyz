import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { useGameContext } from "../../contexts/GameContext";
import Web3Context from "../../contexts/Web3Context/context";
import useMoonToast from "../../hooks/useMoonToast";
import { SessionStatus } from "./PlayView";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import PlayerView from "./PlayerView";
import { commitSwingBLBToken, revealSwingBLBToken } from "../../tokenInterfaces/BLBTokenAPI";
import {
  commitSwingFullcountPlayer,
  revealSwingFullcountPlayer,
} from "../../tokenInterfaces/FullcountPlayerAPI";
import { Token } from "../../types";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const BatterViewMobile = ({
  sessionStatus,
  token,
}: {
  sessionStatus: SessionStatus;
  token: Token;
}) => {
  const [isCommitted, setIsCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const web3ctx = useContext(Web3Context);
  const { contractAddress } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitSwing = useMutation(
    async ({ sign }: { sign: string }) => {
      switch (token.source) {
        case "BLBContract":
          return commitSwingBLBToken({ web3ctx, sessionID: sessionStatus.sessionID, sign });
        case "FullcountPlayerAPI":
          return commitSwingFullcountPlayer({ sessionID: sessionStatus.sessionID, sign });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${token.source}`));
      }
    },
    {
      onSuccess: () => {
        setIsCommitted(true);
        queryClient.refetchQueries("sessions");
        queryClient.refetchQueries("session");
      },
      onError: (e: Error) => {
        toast("Commmit failed." + e?.message, "error");
      },
    },
  );

  const revealSwing = useMutation(
    async ({
      nonce,
      actionChoice,
      vertical,
      horizontal,
    }: {
      nonce: string;
      actionChoice: number;
      vertical: number;
      horizontal: number;
    }) => {
      switch (token.source) {
        case "BLBContract":
          return revealSwingBLBToken({
            web3ctx,
            sessionID: sessionStatus.sessionID,
            nonce,
            vertical,
            horizontal,
            actionChoice,
          });
        case "FullcountPlayerAPI":
          return revealSwingFullcountPlayer({
            sessionID: sessionStatus.sessionID,
            nonce,
            vertical,
            horizontal,
            actionChoice,
          });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${token.source}`));
      }
    },
    {
      onSuccess: () => {
        setIsRevealed(true);
        queryClient.invalidateQueries("sessions");
        queryClient.refetchQueries("session");
      },
      onError: (e: Error) => {
        toast("Reveal failed." + e?.message, "error");
      },
    },
  );
  useEffect(() => {
    if (sessionStatus.didBatterReveal) {
      setIsRevealed(true);
    }
    if (sessionStatus.didBatterCommit) {
      setIsCommitted(true);
    }
  }, [sessionStatus]);

  return (
    <PlayerView
      sessionStatus={sessionStatus}
      isPitcher={false}
      commitMutation={commitSwing}
      revealMutation={revealSwing}
      isCommitted={isCommitted}
      isRevealed={isRevealed}
    />
  );
};

export default BatterViewMobile;
