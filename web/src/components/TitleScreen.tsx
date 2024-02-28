import { useContext, useEffect } from "react";
import { useQueryClient } from "react-query";

import ConnectingView from "./ConnectingView";
import Web3Context from "../contexts/Web3Context/context";
import TitleScreenLayout from "./layout/TitleScreenLayout";
import PlayingLayout from "./layout/PlayingLayout";
import Playing from "./Playing";
import { useGameContext } from "../contexts/GameContext";

const TitleScreen = () => {
  const web3ctx = useContext(Web3Context);

  const { chainId } = useGameContext();

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3ctx.chainId, web3ctx.account]);

  return (
    <>
      <>
        <PlayingLayout>
          <Playing />
        </PlayingLayout>
      </>
    </>
  );
};

export default TitleScreen;
