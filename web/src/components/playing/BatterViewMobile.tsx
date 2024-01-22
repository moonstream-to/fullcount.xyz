import { useContext } from "react";
import { useMutation, useQueryClient } from "react-query";

import { useGameContext } from "../../contexts/GameContext";
import Web3Context from "../../contexts/Web3Context/context";
import useMoonToast from "../../hooks/useMoonToast";
import { SessionStatus } from "./PlayView";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { sendTransactionWithEstimate } from "../../utils/sendTransactions";
import PlayerView from "./PlayerView";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const BatterViewMobile = ({ sessionStatus }: { sessionStatus: SessionStatus }) => {
  const web3ctx = useContext(Web3Context);
  const { contractAddress } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitSwing = useMutation(
    async ({ sign }: { sign: string }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return sendTransactionWithEstimate(
        web3ctx.account,
        gameContract.methods.commitSwing(sessionStatus.sessionID, sign),
      );
    },
    {
      onSuccess: () => {
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
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      return sendTransactionWithEstimate(
        web3ctx.account,
        gameContract.methods.revealSwing(
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
        queryClient.invalidateQueries("sessions");
        queryClient.refetchQueries("session");
      },
      onError: (e: Error) => {
        toast("Reveal failed." + e?.message, "error");
      },
    },
  );

  return (
    <PlayerView
      sessionStatus={sessionStatus}
      isPitcher={false}
      commitMutation={commitSwing}
      revealMutation={revealSwing}
    />
  );
};

export default BatterViewMobile;
