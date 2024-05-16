import { useMutation, useQuery } from "react-query";
import { Spinner } from "@chakra-ui/react";

import styles from "./RematchButton.module.css";
import { AtBatStatus, Token } from "../../types";
import { getCharacterSessions, isCampaignToken } from "../campaign/teams";
import { JoinSessionParams } from "../../hooks/useJoinSession";
import { playSound } from "../../utils/notifications";
import { sendReport } from "../../utils/humbug";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { mutationOptions } from "../../hooks/FCPlayerAPIOptions";
import useMoonToast from "../../hooks/useMoonToast";

const RematchButton = ({
  atBat,
  selectedToken,
  onSuccess,
}: {
  atBat: AtBatStatus;
  selectedToken: Token;
  onSuccess: (sessionID: number) => void;
}) => {
  const toast = useMoonToast();
  const joinSession = useMutation(
    async ({ sessionID, token, inviteCode }: JoinSessionParams): Promise<unknown> => {
      return joinSessionFullcountPlayer({ token, sessionID, inviteCode });
    },
    {
      ...mutationOptions,
      onSuccess: (_, variables) => {
        onSuccess(variables.sessionID);
      },
      onError: (e: Error) => {
        toast("Rematch request failed" + e?.message, "error");
        sendReport("Error toast", { error: e }, ["type:error_toast"]);
      },
    },
  );

  const availableBots = useQuery(
    ["availableBots", atBat.pitcher, atBat.batter],
    () => {
      if (atBat.batter && isCampaignToken(atBat.batter?.address, atBat.batter.id)) {
        return getCharacterSessions(atBat.batter);
      }
      if (atBat.pitcher && isCampaignToken(atBat.pitcher.address, atBat.pitcher.id)) {
        return getCharacterSessions(atBat.pitcher);
      }
      return undefined;
    },
    {
      refetchInterval: 3000,
    },
  );

  const handleClick = () => {
    playSound("click");
    sendReport("Rematch", {}, ["type:click", "click:rematch"]);
    if (availableBots.data && availableBots.data[0]) {
      joinSession.mutate({
        token: selectedToken,
        sessionID: availableBots.data[0],
        inviteCode: "",
      });
    }
  };

  return (
    <>
      {availableBots.data && availableBots.data.length > 0 && (
        <button className={styles.container} onClick={handleClick} disabled={joinSession.isLoading}>
          {joinSession.isLoading ? <Spinner h={4} w={4} /> : "REMATCH"}
        </button>
      )}
    </>
  );
};

export default RematchButton;
