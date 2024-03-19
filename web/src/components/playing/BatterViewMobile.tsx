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
import { commitOrRevealSwingFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { OwnedToken } from "../../types";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const BatterViewMobile = ({
  sessionStatus,
  token,
}: {
  sessionStatus: SessionStatus;
  token: OwnedToken;
}) => {
  const [isCommitted, setIsCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(sessionStatus.didBatterReveal);
  const [isRevealFailed, setIsRevealFailed] = useState(false);

  const web3ctx = useContext(Web3Context);
  const { contractAddress } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitSwing = useMutation(
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
          return commitSwingBLBToken({ web3ctx, sessionID: sessionStatus.sessionID, sign });
        case "FullcountPlayerAPI":
          if (!commit) {
            return Promise.reject(new Error("FulcountPlayerAPI commit doesn't have commit data"));
          }
          return commitOrRevealSwingFullcountPlayer({ token, commit, isCommit: true });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${token.source}`));
      }
    },
    {
      onSuccess: () => {
        setIsCommitted(true);
        queryClient.refetchQueries("atBat");
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
      setIsRevealFailed(false);
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
          return commitOrRevealSwingFullcountPlayer({
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
        queryClient.refetchQueries("atBat");
      },
      onError: (e: Error) => {
        setIsRevealFailed(true);
        toast("Reveal failed: " + e?.message, "error");
      },
    },
  );
  useEffect(() => {
    setIsRevealed(sessionStatus.didBatterReveal);
    setIsCommitted(sessionStatus.didBatterCommit);
  }, [sessionStatus.didBatterCommit, sessionStatus.didBatterReveal]);

  return (
    <PlayerView
      token={token}
      sessionStatus={sessionStatus}
      isPitcher={false}
      commitMutation={commitSwing}
      revealMutation={revealSwing}
      isCommitted={isCommitted}
      isRevealed={isRevealed}
      isRevealFailed={isRevealFailed}
    />
  );
};

export default BatterViewMobile;
