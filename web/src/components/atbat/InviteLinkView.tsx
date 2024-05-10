import styles from "./InviteLinkView.module.css";
import { AtBatStatus } from "../../types";
import { Image, useClipboard } from "@chakra-ui/react";
import QuestionMarkIcon from "../icons/QuestionMarkIcon";
import BallIconWhite from "../icons/BallIconWhite";
import BatIconWhite from "../icons/BatIconWhite";
import LinkIcon from "../icons/LinkIcon";
import { getLocalStorageInviteCodeKey, getLocalStorageItem } from "../../utils/localStorage";
import { GAME_CONTRACT } from "../../constants";

const InviteLinkView = ({ atBat }: { atBat: AtBatStatus }) => {
  const inviteCodeKey = getLocalStorageInviteCodeKey(
    GAME_CONTRACT,
    String(atBat.pitches[0].sessionID),
  );
  const inviteCode = getLocalStorageItem(inviteCodeKey);
  const inviteCodeParam = inviteCode ? `&invite_code=${inviteCode}` : "";
  const role = atBat.pitcher ? 1 : atBat.batter ? 0 : undefined;
  const roleParam = role !== undefined ? `&role=${role}` : "";
  const link = `${window.location.protocol}//${
    window.location.host
  }/?invite_from=${encodeURIComponent(
    atBat.pitcher ? atBat.pitcher.name : atBat.batter ? atBat.batter.name : "",
  )}&id=${atBat.pitches[0].sessionID}${roleParam}${inviteCodeParam}`;
  const { onCopy, hasCopied } = useClipboard(link);

  return (
    <div className={styles.container}>
      <div className={styles.tokens}>
        {atBat.pitcher ? (
          <div className={styles.player}>
            <Image alt={atBat.pitcher.name} src={atBat.pitcher.image} />
            <BallIconWhite className={styles.ball} />
          </div>
        ) : (
          <div className={styles.opponent}>
            <QuestionMarkIcon />
            <BallIconWhite className={styles.ball} />
          </div>
        )}
        <div className={styles.vs}>VS</div>
        {atBat.batter ? (
          <div className={styles.player}>
            <Image alt={atBat.batter.name} src={atBat.batter.image} />
            <BatIconWhite className={styles.bat} />
          </div>
        ) : (
          <div className={styles.opponent}>
            <QuestionMarkIcon />
            <BatIconWhite className={styles.bat} />
          </div>
        )}
      </div>
      <div className={styles.linkContainer}>
        <div className={styles.link} title={link}>
          {link}
        </div>
        <button
          type={"button"}
          className={hasCopied ? styles.copyButtonSuccess : styles.copyButton}
          onClick={onCopy}
        >
          <div>Copy</div>
          <LinkIcon />
        </button>
      </div>
    </div>
  );
};

export default InviteLinkView;
