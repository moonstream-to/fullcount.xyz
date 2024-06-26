import { useInfiniteQuery } from "react-query";
import React, { useEffect, useRef } from "react";
import { fetchLeaderboardData, LeaderboardEntry } from "./leaderboards";
import { useGameContext } from "../../contexts/GameContext";
import styles from "./Leaderboard.module.css";
import { Spinner } from "@chakra-ui/react";
import LeaderboardItem from "./LeaderboardItem";
import LeaderboardHeader from "./LeaderboardHeader";

function Leaderboard({ leaderboardId }: { leaderboardId: string }) {
  const entriesPerPage = 15;
  const listRef = useRef<HTMLDivElement>(null); // Reference to the div that scrolls
  const { tokensCache } = useGameContext();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery(
    ["leaderboard", leaderboardId],
    ({ pageParam = 0 }) =>
      fetchLeaderboardData(leaderboardId, entriesPerPage, pageParam, tokensCache),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length < entriesPerPage) return undefined; // Check if there are more pages
        return pages.length * entriesPerPage; // Calculate the offset for the next page
      },
    },
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) {
        return;
      }
      const current: HTMLDivElement = listRef.current;

      const { scrollTop, scrollHeight, clientHeight } = current;
      if (scrollTop + clientHeight >= scrollHeight - 30) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    const currentList = listRef.current;
    if (currentList) {
      currentList.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentList) {
        currentList.removeEventListener("scroll", handleScroll);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === "loading") return <Spinner color={"#8B8B8B"} />;
  if (status === "error") return <p>Error :(</p>;

  return (
    <div className={styles.container}>
      <LeaderboardHeader />
      <div className={styles.divider} />
      <div ref={listRef} className={styles.dataContainer}>
        {data?.pages.map((page, i) => (
          <div className={styles.pageContainer} key={i}>
            {page.map((entry: LeaderboardEntry) => (
              <LeaderboardItem entry={entry} key={entry.address + entry.id} />
            ))}
          </div>
        ))}
        {isFetchingNextPage && (
          <p style={{ fontSize: "11px", textAlign: "center" }}>Loading more...</p>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
