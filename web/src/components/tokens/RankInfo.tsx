import {
  Box,
  Flex,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
} from "@chakra-ui/react";

import styles from "./OwnedTokens.module.css";
import { OwnedToken, Token, TokenId } from "../../types";
import React, { useContext } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { BATTERS_LEADERBOARD_ID, PITCHERS_LEADERBOARD_ID } from "../../constants";
import { fetchTokens, getTokensData } from "../../tokenInterfaces/BLBTokenAPI";
import Web3Context from "../../contexts/Web3Context/context";

const RankInfo = ({ token }: { token: OwnedToken }) => {
  const web3ctx = useContext(Web3Context);

  const leaderboardRecords = useQuery(["leaderboard_window", token.address, token.id], async () => {
    const pitchers = await axios({
      method: "GET",
      url: `https://engineapi.moonstream.to/leaderboard/position/?leaderboard_id=${PITCHERS_LEADERBOARD_ID}&address=${token.address}_${token.id}&normalize_addresses=False&window_size=2`,
    })
      .then((res) =>
        res.data.map((t: { address: string; score: number; rank: number }) => {
          const [address, id] = t.address.split("_");
          return { address, id, score: t.score, rank: t.rank };
        }),
      )
      .catch((e) => {
        console.log(e);
        return [];
      });
    const batters = await axios({
      method: "GET",
      url: `https://engineapi.moonstream.to/leaderboard/position/?leaderboard_id=${BATTERS_LEADERBOARD_ID}&address=${token.address}_${token.id}&normalize_addresses=False&window_size=2`,
    })
      .then((res) =>
        res.data.map((t: { address: string; score: number; rank: number }) => {
          const [address, id] = t.address.split("_");
          return { address, id, score: t.score, rank: t.rank };
        }),
      )
      .catch((e) => {
        console.log(e);
        return [];
      });

    const tokens = await getTokensData({
      web3ctx,
      tokens: [...pitchers, ...batters],
      tokensSource: "BLBContract",
    });
    console.log({ batters, pitchers, tokens });
    return { batters, pitchers, tokens };
  });

  const LeaderboardPosition = ({
    token,
    position,
  }: {
    token: Token | undefined;
    position: { rank: number; score: number };
  }) => {
    return (
      <Flex w={"fit-content"} alignItems={"center"} gap={"10px"}>
        <Text minW={"30px"}>{position.rank}.</Text>
        {token && (
          <>
            <Image h={"40px"} w={"40px"} alt={""} src={token.image} border="1px solid #4D4D4D" />
            <Flex direction={"column"} fontSize={"14px"}>
              <Text>{token.name}</Text>
              <Text>{`owner ${token.staker?.slice(0, 6)}...${token.staker?.slice(-4)}`}</Text>
            </Flex>
          </>
        )}
        <Text>{position.score}</Text>
      </Flex>
    );
  };

  return (
    <Popover placement={"right-start"}>
      <PopoverTrigger>
        <button>
          <div className={styles.rankBackground} />
          <div className={styles.rank}>
            <div className={styles.rankText}> {token.highestRank}</div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        id="pop-content"
        border="1px solid #ccc"
        _focusVisible={{ border: "none", outline: "none" }}
        position="absolute"
        left="0px"
        top={"150px"}
        bg={"#1A1D22"}
        p={"20px"}
        w={"700px"}
      >
        <div className={styles.leaderboardsContainer}>
          <div className={styles.leaderboardRows}>
            <Text>Batters</Text>
            {leaderboardRecords.data &&
              leaderboardRecords.data.batters.map(
                (
                  position: { address: string; id: string; rank: number; score: number },
                  idx: number,
                ) => (
                  <LeaderboardPosition
                    key={idx}
                    token={leaderboardRecords.data.tokens.find(
                      (t) => t.address === position.address && t.id === position.id,
                    )}
                    position={position}
                  />
                ),
              )}
            {/*{leaderboardRecords.data && leaderboardRecords.data.pitchers.map((position: {address: string, rank: string, score: string}) => )}*/}
          </div>
          <div className={styles.leaderboardRows}>
            <Text>Pitchers</Text>

            {leaderboardRecords.data &&
              leaderboardRecords.data.pitchers.map(
                (
                  position: { address: string; id: string; rank: number; score: number },
                  idx: number,
                ) => (
                  <LeaderboardPosition
                    key={idx}
                    token={leaderboardRecords.data.tokens.find(
                      (t) => t.address === position.address && t.id === position.id,
                    )}
                    position={position}
                  />
                ),
              )}
            {/*{leaderboardRecords.data && leaderboardRecords.data.pitchers.map((position: {address: string, rank: string, score: string}) => )}*/}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RankInfo;
