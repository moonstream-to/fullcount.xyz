import { useContext, useEffect, useState } from "react";
import SecondStep from "./SecondStep";
import Web3Context from "../contexts/Web3Context/context";
import TitleScreenLayout from "./layout/TitleScreenLayout";
import PlayingLayout from "./layout/PlayingLayout";
import Playing from "./Playing";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "react-query";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import queryCacheProps from "../hooks/hookCommon";
import { useGameContext } from "../contexts/GameContext";
import OwnedTokens from "./OwnedTokens";
// eslint-disable-next-line @typescript-eslint/no-var-requires

const TitleScreen = () => {
  const [step, setStep] = useState(1);
  const web3ctx = useContext(Web3Context);

  const router = useRouter();

  const { sessionId, contractAddress, selectedToken, updateContext, chainId } = useGameContext();

  useEffect(() => {
    if (typeof router.query.session_id === "string") {
      updateContext({ sessionId: Number(router.query.session_id) });
    }
  }, [router.query.session_id]);

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3ctx.chainId, web3ctx.account]);

  return (
    <>
      {web3ctx.buttonText !== "Connected" || web3ctx.chainId !== chainId ? (
        <TitleScreenLayout>
          <SecondStep nextStep={() => setStep(3)} />
        </TitleScreenLayout>
      ) : (
        <>
          {selectedToken ? (
            <PlayingLayout>
              <Playing />
            </PlayingLayout>
          ) : (
            <>
              <TitleScreenLayout>
                <OwnedTokens />
              </TitleScreenLayout>
            </>
          )}
        </>
      )}
    </>
  );
};

export default TitleScreen;
1;
