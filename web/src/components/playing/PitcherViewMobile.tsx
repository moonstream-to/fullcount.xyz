import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import Web3Context from "../../contexts/Web3Context/context";
import { useGameContext } from "../../contexts/GameContext";
import useMoonToast from "../../hooks/useMoonToast";
import { SessionStatus } from "./PlayView";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";

import { sendTransactionWithEstimate } from "../../utils/sendTransactions";
import PlayerView from "./PlayerView";
import { commitPitchBLBToken, revealPitchBLBToken } from "../../tokenInterfaces/BLBTokenAPI";
import { commitOrRevealPitchFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { OwnedToken, Token } from "../../types";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const PitcherViewMobile = ({
  sessionStatus,
  token,
}: {
  sessionStatus: SessionStatus;
  token: OwnedToken;
}) => {
  const [isCommitted, setIsCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const web3ctx = useContext(Web3Context);
  const { contractAddress } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitPitch = useMutation(
    async ({
      sign,
      commit,
    }: {
      sign?: string;
      commit?: { nonce: string; vertical: number; horizontal: number; actionChoice: number };
    }) => {
      switch (token.source) {
        case "BLBContract":
          if (!sign) {
            return Promise.reject(new Error("BLB commit isn't signed"));
          }
          return commitPitchBLBToken({ web3ctx, sessionID: sessionStatus.sessionID, sign });
        case "FullcountPlayerAPI":
          if (!commit) {
            return Promise.reject(new Error("FulcountPlayerAPI commit doesn't have commit data"));
          }
          return commitOrRevealPitchFullcountPlayer({ token, commit, isCommit: true });
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

  const revealPitch = useMutation(
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
          return revealPitchBLBToken({
            web3ctx,
            sessionID: sessionStatus.sessionID,
            nonce,
            vertical,
            horizontal,
            actionChoice,
          });
        case "FullcountPlayerAPI":
          return commitOrRevealPitchFullcountPlayer({
            commit: { nonce, vertical, horizontal, actionChoice },
            isCommit: false,
            token,
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
    if (sessionStatus.didPitcherReveal) {
      setIsRevealed(true);
    }
    if (sessionStatus.didPitcherCommit) {
      setIsCommitted(true);
    }
  }, [sessionStatus]);

  return (
    <PlayerView
      sessionStatus={sessionStatus}
      isPitcher={true}
      commitMutation={commitPitch}
      revealMutation={revealPitch}
      isCommitted={isCommitted}
      isRevealed={isRevealed}
    />
  );
};

export default PitcherViewMobile;
