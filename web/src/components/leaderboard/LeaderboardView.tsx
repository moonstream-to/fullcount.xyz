import styles from "./LeaderboardView.module.css";
import {
  FULLCOUNT_PLAYER_API,
  LEADERBOARD_HOME_RUNS,
  LEADERBOARD_ON_BASE_PERCENTAGE,
  LEADERBOARD_PITCHING_OUTS,
  LEADERBOARD_STRIKEOUTS,
  LEADERBOARD_TOTAL_AT_BATS,
} from "../../constants";
import { useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import OwnPositions from "./OwnPositions";
import useUser from "../../contexts/UserContext";
import { getHeaders } from "../../tokenInterfaces/FullcountPlayerAPI";
import Leaderboard from "./Leaderboard";

const leaderboards = [
  { title: "Home runs", id: LEADERBOARD_HOME_RUNS },
  { title: "Strikeouts", id: LEADERBOARD_STRIKEOUTS },
  { title: "Outs", id: LEADERBOARD_PITCHING_OUTS },
  { title: "On-base %", id: LEADERBOARD_ON_BASE_PERCENTAGE },
  { title: "Appearances", id: LEADERBOARD_TOTAL_AT_BATS },
];

const LeaderboardView = () => {
  const [selectedId, setSelectedId] = useState(leaderboards[0].id);
  const { user } = useUser();

  const fetchLeaderboardInfo = async (id: string) => {
    return axios.get(`https://engineapi.moonstream.to/leaderboard/info?leaderboard_id=${id}`);
  };

  const leaderboardInfo = useQuery(
    ["fetch_leaderboard_info", selectedId],
    async () => {
      const data = await fetchLeaderboardInfo(selectedId).then((res) => {
        return res.data;
      });
      console.log(data);
      return data;
    },
    {
      enabled: !!selectedId,
    },
  );

  const ownedTokens = useQuery(["owned_token_ids", user], async () => {
    const headers = getHeaders();
    const res = await axios.get(`${FULLCOUNT_PLAYER_API}/nfts`, {
      params: {
        limit: 15,
        offset: 0,
      }, //TODO context vars
      headers,
    });
    const tokens = res.data.nfts.map((nft: { erc721_address: string; token_id: string }) => ({
      id: nft.token_id,
      address: nft.erc721_address,
    }));
    return tokens;
  });

  return (
    <div className={styles.container}>
      <div className={styles.selector}>
        <div className={styles.buttons}>
          {leaderboards.map((l) => (
            <div
              key={l.id}
              onClick={() => setSelectedId(l.id)}
              className={l.id === selectedId ? styles.buttonSelected : styles.buttonUnselected}
            >
              {l.title}
            </div>
          ))}
        </div>
        <div className={styles.subtitle}>{leaderboardInfo.data?.title ?? ""}</div>
        <OwnPositions tokens={ownedTokens.data} leaderboardId={selectedId} />
        <Leaderboard leaderboardId={selectedId} />
      </div>
    </div>
  );
};

export default LeaderboardView;
