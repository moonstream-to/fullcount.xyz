import axios from "axios";
import { useQuery } from "react-query";
import { Flex, Image, Text, useMediaQuery } from "@chakra-ui/react";

import MainStat from "../playing/MainStat";
import MainStatMobile from "../playing/MainStatMobile";
import HeatMap from "../playing/HeatMap";
import { PitchLocation, SwingLocation, Token } from "../../types";

const TokenView = ({
  token,
  width,
  isPitcher,
}: {
  token?: Token;
  width: string;
  isPitcher: boolean;
}) => {
  const pitcherStats = useQuery(
    ["pitcher_stat", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      return stat.data;
    },
    {
      enabled: !!token && isPitcher,
    },
  );

  const batterStats = useQuery(
    ["batter_stat", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      return stat.data;
    },
    {
      enabled: !!token && !isPitcher,
    },
  );

  const pitchDistributions = useQuery(
    ["pitch_distribution", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/pitch_distribution";
      const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      const counts = new Array(25).fill(0);
      res.data.pitch_distribution.forEach(
        (l: PitchLocation) => (counts[l.pitch_vertical * 5 + l.pitch_horizontal] = l.count),
      );
      const total = counts.reduce((acc, value) => acc + value);
      const rates = counts.map((value) => value / total);
      return { rates, counts };
    },
    {
      enabled: !!token && isPitcher,
    },
  );

  const swingDistributions = useQuery(
    ["swing_distribution", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/swing_distribution";
      const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      const counts = new Array(25).fill(0);
      res.data.swing_distribution.forEach(
        (l: SwingLocation) => (counts[l.swing_vertical * 5 + l.swing_horizontal] = l.count),
      );
      const total = counts.reduce((acc, value) => acc + value);
      const rates = counts.map((value) => value / total);
      return { rates, counts };
    },
    {
      enabled: !!token && !isPitcher,
    },
  );

  const [isSmallView] = useMediaQuery("(max-width: 1023px)");

  if (!token) {
    return <></>;
  }

  return (
    <Flex direction={"column"} gap={"10px"}>
      <Flex direction={"column"} gap="10px" alignItems={"center"}>
        <Image
          src={token?.image}
          h={{ base: "150px", lg: width }}
          minW={{ base: "150px", lg: width }}
          alt={token?.name}
        />
        <Text fontSize={"14px"} fontWeight={"700"}>
          {token.name}
        </Text>
      </Flex>
      {isPitcher ? (
        <Flex direction={{ base: "row", lg: "column" }} gap={{ base: "10px", lg: "" }}>
          {pitcherStats.data && isSmallView && (
            <MainStatMobile stats={pitcherStats.data} isPitcher={true} />
          )}
          {pitcherStats.data && !isSmallView && (
            <MainStat stats={pitcherStats.data} isPitcher={true} />
          )}

          {pitchDistributions.data && (
            <HeatMap
              rates={pitchDistributions.data.rates}
              counts={pitchDistributions.data.counts}
              isPitcher
            />
          )}
        </Flex>
      ) : (
        <Flex direction={{ base: "row", lg: "column" }} gap={{ base: "10px", lg: "" }}>
          {batterStats.data && isSmallView && (
            <MainStatMobile stats={batterStats.data} isPitcher={false} />
          )}
          {batterStats.data && !isSmallView && (
            <MainStat stats={batterStats.data} isPitcher={false} />
          )}

          {swingDistributions.data && (
            <HeatMap
              rates={swingDistributions.data.rates}
              counts={swingDistributions.data.counts}
              isPitcher={false}
            />
          )}
        </Flex>
      )}
    </Flex>
  );
};
export default TokenView;
