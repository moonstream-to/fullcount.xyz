import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { SessionStatus } from "../playing/PlayView";
import { BatterReveal, OwnedToken } from "../../types";
import PlayerView2 from "../playing/PlayerView2";
import { delay } from "../../tokenInterfaces/FullcountPlayerAPI";

const BatterViewMobile2 = ({
  sessionStatus,
  token,
  addSwing,
}: {
  sessionStatus: SessionStatus;
  token: OwnedToken;
  addSwing: (arg0: BatterReveal) => void;
}) => {
  const [isCommitted, setIsCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(sessionStatus.didBatterReveal);

  const commitSwing = useMutation(
    async ({
      sign,
      commit,
    }: {
      sign?: string;
      commit?: { nonce: string; vertical: number; horizontal: number; actionChoice: number };
    }) => {
      await delay(4000);
      if (commit) {
        addSwing({
          nonce: commit.nonce,
          vertical: String(commit.vertical),
          horizontal: String(commit.horizontal),
          kind: String(commit.actionChoice),
        });
      }
    },
    {
      onSuccess: () => {
        setIsCommitted(true);
      },
      onError: (e: Error) => {
        console.log("Commit failed." + e?.message);
      },
    },
  );

  useEffect(() => {
    setIsRevealed(sessionStatus.didBatterReveal);
    setIsCommitted(sessionStatus.didBatterCommit);
  }, [sessionStatus]);

  return (
    <PlayerView2
      sessionStatus={sessionStatus}
      isPitcher={false}
      commitMutation={commitSwing}
      isCommitted={isCommitted}
      isRevealed={isRevealed}
    />
  );
};

export default BatterViewMobile2;
