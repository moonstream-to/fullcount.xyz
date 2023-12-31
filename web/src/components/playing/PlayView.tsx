import { useGameContext } from "../../contexts/GameContext";
import PitcherView from "./PitcherView";
import { Flex, Image, useMediaQuery } from "@chakra-ui/react";
import Timer from "./Timer";
import { useQuery } from "react-query";
import { useContext, useEffect, useState } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import { Token } from "../../types";
import Outcome from "./Outcome";
import BatterView2 from "./BatterView2";
import InviteLink from "./InviteLink";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { FULLCOUNT_ASSETS_PATH, ZERO_ADDRESS } from "../../constants";
import { getTokenMetadata } from "../../utils/decoders";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../../web3/abi/BLBABI.json");
import TokenView from "../tokens/TokenView";
import Narrate from "./Narrate";
import PitcherViewMobile from "./PitcherViewMobile";
import BatterViewMobile from "./BatterViewMobile";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];

export function getRowCol(index: number): [number, number] {
  const size = 5; // Size of the grid (5x5)
  const row = Math.floor(index / size);
  const col = index % size;
  return [row, col]; // 0-based index for row and column
}

export interface SessionStatus {
  progress: number;
  didPitcherCommit: boolean;
  didBatterCommit: boolean;
  didPitcherReveal: boolean;
  didBatterReveal: boolean;
  outcome: number;
}

export const horizontalLocations = {
  0: "Inside Ball",
  1: "Inside Strike",
  2: "Middle",
  3: "Outside Strike",
  4: "Outside Ball",
};

export const verticalLocations = {
  0: "High Ball",
  1: "High Strike",
  2: "Middle",
  3: "Low Strike",
  4: "Low Ball",
};

export const pitchSpeed = {
  0: "Fast",
  1: "Slow",
};

export const swingKind = {
  0: "Contact",
  1: "Power",
  2: "Take",
};

const PlayView = ({ selectedToken }: { selectedToken: Token }) => {
  const [isSmallView] = useMediaQuery("(max-width: 1023px)");

  const { selectedSession, updateContext, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  const isPitcher = (token?: Token) => selectedSession?.pair.pitcher?.id === token?.id;
  const [opponent, setOpponent] = useState<Token | undefined>(undefined);
  const [gameOver, setGameOver] = useState(false);

  const [pitcher, setPitcher] = useState<Token | undefined>(undefined);
  const [batter, setBatter] = useState<Token | undefined>(undefined);

  const sessionStatus = useQuery(
    ["session", selectedSession],
    async () => {
      if (!selectedSession) return undefined;
      const progress = Number(
        await gameContract.methods.sessionProgress(selectedSession.sessionID).call(),
      );
      const session = await gameContract.methods.getSession(selectedSession.sessionID).call();
      if (progress < 2 || progress > 4) {
        setGameOver(true);
      }
      const pitcherAddress = session.pitcherNFT.nftAddress;
      const pitcherTokenID = session.pitcherNFT.tokenID;
      const batterAddress = session.batterNFT.nftAddress;
      const batterTokenID = session.batterNFT.tokenID;
      const otherToken =
        batterAddress === selectedToken.address && batterTokenID === selectedToken.id
          ? { address: pitcherAddress, id: pitcherTokenID }
          : { address: batterAddress, id: batterTokenID };

      if (otherToken.address !== ZERO_ADDRESS && !(otherToken.address === opponent?.address)) {
        tokenContract.options.address = otherToken.address;
        const URI = await tokenContract.methods.tokenURI(otherToken.id).call();
        const staker = await tokenContract.methods.ownerOf(otherToken.id).call();
        const tokenMetadata = await getTokenMetadata(URI);

        setOpponent({
          ...otherToken,
          staker,
          image: tokenMetadata.image,
          name: tokenMetadata.name.split(` - ${otherToken.id}`)[0],
        });
      }

      const {
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        outcome,
        phaseStartTimestamp,
        pitcherReveal,
        batterReveal,
        pitcherLeftSession,
        batterLeftSession,
      } = session;

      const secondsPerPhase = Number(await gameContract.methods.SecondsPerPhase().call());

      let isExpired = progress === 6;
      if (progress === 3 || progress === 4) {
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        const endTime = Number(phaseStartTimestamp) + (secondsPerPhase ?? 0);
        const remainingTime = endTime - currentTime;
        if (remainingTime < 1) {
          isExpired = true;
        }
      }
      const speed: 0 | 1 = Number(pitcherReveal[1]) === 0 ? 0 : 1;
      const kind: 0 | 1 | 2 =
        Number(batterReveal[1]) === 0 ? 0 : Number(batterReveal[1]) === 1 ? 1 : 2;

      return {
        sessionID: selectedSession?.sessionID,
        progress,
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        pitcherLeftSession,
        batterLeftSession,
        outcome,
        phaseStartTimestamp: Number(phaseStartTimestamp),
        secondsPerPhase: Number(secondsPerPhase),
        isExpired,
        pitcherReveal: {
          speed,
          vertical: Number(pitcherReveal[2]),
          horizontal: Number(pitcherReveal[3]),
        },
        batterReveal: {
          kind,
          vertical: Number(batterReveal[2]),
          horizontal: Number(batterReveal[3]),
        },
      };
    },
    {
      refetchInterval: () => (gameOver ? false : 3000),
    },
  );

  useEffect(() => {
    setPitcher(isPitcher(selectedToken) ? selectedToken : opponent);
    setBatter(isPitcher(selectedToken) ? opponent : selectedToken);
  }, [selectedToken, opponent]);

  return (
    <Flex direction={"column"} gap={"20px"} minW={"100%"}>
      {isSmallView && (
        <Flex w={"100%"} justifyContent={"end"}>
          <Image
            alt="exit"
            src={`${FULLCOUNT_ASSETS_PATH}/icons/exit.svg`}
            h={"20px"}
            w={"20px"}
            cursor={"pointer"}
            onClick={() => updateContext({ selectedSession: undefined, watchingToken: undefined })}
          />
        </Flex>
      )}
      <Flex justifyContent={"space-between"} minW={"100%"} alignItems={"center"}>
        {!isSmallView && <Flex w={"20px"} h={"10px"} />}

        {(sessionStatus.data?.progress === 3 ||
          sessionStatus.data?.progress === 4 ||
          sessionStatus.data?.progress === 2 ||
          sessionStatus.data?.progress === 5) && (
          <Timer
            start={Number(sessionStatus.data?.phaseStartTimestamp)}
            delay={sessionStatus.data?.progress === 5 ? 0 : sessionStatus.data?.secondsPerPhase}
            isActive={
              sessionStatus.data?.progress === 3 ||
              sessionStatus.data?.progress === 4 ||
              sessionStatus.data?.progress === 5
            }
          />
        )}
        {!isSmallView && (
          <Flex w={"20px"} justifyContent={"end"}>
            <Image
              alt="exit"
              src={`${FULLCOUNT_ASSETS_PATH}/icons/exit.svg`}
              h={"20px"}
              w={"20px"}
              cursor={"pointer"}
              onClick={() =>
                updateContext({ selectedSession: undefined, watchingToken: undefined })
              }
            />
          </Flex>
        )}
      </Flex>

      {isSmallView && (
        <Flex alignItems={"center"} justifyContent={"space-between"} gap={"10px"}>
          <TokenView
            token={pitcher}
            width={isPitcher(selectedToken) ? "300px" : "100px"}
            isPitcher={true}
          />
          vs
          <TokenView
            token={batter}
            width={!isPitcher(selectedToken) ? "300px" : "100px"}
            isPitcher={false}
          />
        </Flex>
      )}
      {sessionStatus.data && sessionStatus.data.progress > 2 && sessionStatus.data.progress < 6 && (
        <Flex w={{ base: "320px", lg: "1000px" }} placeSelf={"center"} minH={"108px"}>
          <Narrate
            sessionID={selectedSession?.sessionID ?? 0}
            speed={1}
            isComplete={sessionStatus.data.progress === 5}
          />
        </Flex>
      )}
      <Flex alignItems={"center"} justifyContent={"space-between"} gap={"10px"} w={"100%"}>
        {!isSmallView && (
          <TokenView
            token={pitcher}
            width={isPitcher(selectedToken) ? "300px" : "150px"}
            isPitcher={true}
          />
        )}
        {sessionStatus.data?.progress === 2 && selectedSession && selectedToken && (
          <InviteLink session={selectedSession} token={selectedToken} />
        )}
        {(sessionStatus.data?.progress === 3 || sessionStatus.data?.progress === 4) &&
          !sessionStatus.data?.isExpired && (
            <>
              {isPitcher(selectedToken) && sessionStatus.data && (
                <>
                  {isSmallView ? (
                    <PitcherViewMobile sessionStatus={sessionStatus.data} />
                  ) : (
                    <PitcherView sessionStatus={sessionStatus.data} />
                  )}
                </>
              )}
              {!isPitcher(selectedToken) && sessionStatus.data && (
                <>
                  {isSmallView ? (
                    <BatterViewMobile sessionStatus={sessionStatus.data} />
                  ) : (
                    <BatterView2 sessionStatus={sessionStatus.data} />
                  )}
                </>
              )}
            </>
          )}
        {sessionStatus.data &&
          sessionStatus.data.progress === 5 &&
          sessionStatus.data.didBatterReveal &&
          sessionStatus.data.didPitcherReveal && (
            <Outcome
              outcome={sessionStatus.data?.outcome}
              isExpired={!!sessionStatus.data?.isExpired}
              pitch={sessionStatus.data.pitcherReveal}
              swing={sessionStatus.data.batterReveal}
              session={{
                ...sessionStatus.data,
                requiresSignature: false,
                pair: isPitcher(selectedToken)
                  ? { pitcher: selectedToken, batter: opponent }
                  : { pitcher: opponent, batter: selectedToken },
              }}
            />
          )}
        {!isSmallView && (
          <TokenView
            token={batter}
            width={!isPitcher(selectedToken) ? "300px" : "150px"}
            isPitcher={false}
          />
        )}
      </Flex>
    </Flex>
  );
};
export default PlayView;
