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
const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const PitcherViewMobile = ({ sessionStatus }: { sessionStatus: SessionStatus }) => {
  const [isCommitted, setIsCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const web3ctx = useContext(Web3Context);
  const { contractAddress } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitPitch = useMutation(
    async ({ sign }: { sign: string }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return sendTransactionWithEstimate(
        web3ctx.account,
        gameContract.methods.commitPitch(sessionStatus.sessionID, sign),
      );
    },
    {
      onSuccess: () => {
        setIsCommitted(true);
        queryClient.refetchQueries("sessions");
        queryClient.refetchQueries("session");
        // setIsCommitted(true);
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
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return sendTransactionWithEstimate(
        web3ctx.account,
        gameContract.methods.revealPitch(
          sessionStatus.sessionID,
          nonce,
          actionChoice,
          vertical,
          horizontal,
        ),
      );
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
