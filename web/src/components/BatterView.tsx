import { Flex, Text } from "@chakra-ui/react";
import globalStyles from "./GlobalStyles.module.css";
import styles from "./PlayView.module.css";
import GridComponent from "./GridComponent";
import { useContext, useState } from "react";
import {
  getRowCol,
  horizontalLocations,
  pitchSpeed,
  swingKind,
  verticalLocations,
} from "./PlayView";
import { signPitch, signSwing } from "./Signing";
import web3Context from "../contexts/Web3Context";
import Web3Context from "../contexts/Web3Context/context";
import { useGameContext } from "../contexts/GameContext";
import { useMutation, useQueryClient } from "react-query";
import useMoonToast from "../hooks/useMoonToast";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");

const BatterView = () => {
  const [kind, setKind] = useState(0);
  const [gridIndex, setGridIndex] = useState(12);
  const [nonce, setNonce] = useState(322);
  const web3ctx = useContext(Web3Context);
  const { selectedSession, contractAddress } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const handleCommit = async () => {
    const sign = await signSwing(
      web3ctx.account,
      window.ethereum,
      nonce,
      kind,
      getRowCol(gridIndex)[0],
      getRowCol(gridIndex)[1],
    );
    localStorage.setItem(`fullcount.xyz-${selectedSession?.sessionID}`, sign);
    commitSwing.mutate({ sign });
    console.log(sign, typeof sign);
  };

  const handleReveal = async () => {
    revealSwing.mutate({
      nonce,
      kind,
      vertical: getRowCol(gridIndex)[0],
      horizontal: getRowCol(gridIndex)[1],
    });
  };

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitSwing = useMutation(
    async ({ sign }: { sign: string }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return gameContract.methods.commitSwing(selectedSession?.sessionID, sign).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("isApproved");
        toast("SetApproval successful.", "success");
      },
      onError: (e: Error) => {
        toast("SetApproval failed." + e?.message, "error");
      },
    },
  );

  const revealSwing = useMutation(
    async ({
      nonce,
      kind,
      vertical,
      horizontal,
    }: {
      nonce: number;
      kind: number;
      vertical: number;
      horizontal: number;
    }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return gameContract.methods
        .revealSwing(selectedSession?.sessionID, nonce, kind, vertical, horizontal)
        .send({
          from: web3ctx.account,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("isApproved");
        toast("SetApproval successful.", "success");
      },
      onError: (e: Error) => {
        toast("SetApproval failed." + e?.message, "error");
      },
    },
  );

  return (
    <Flex direction={"column"} gap={"15px"}>
      <Flex justifyContent={"center"} gap={"20px"}>
        <Flex
          className={kind === 0 ? styles.activeChoice : styles.inactiveChoice}
          onClick={() => setKind(0)}
        >
          {swingKind[0]}
        </Flex>
        <Flex
          className={kind === 1 ? styles.activeChoice : styles.inactiveChoice}
          onClick={() => setKind(1)}
        >
          {swingKind[1]}
        </Flex>
        <Flex
          className={kind === 2 ? styles.activeChoice : styles.inactiveChoice}
          onClick={() => setKind(2)}
        >
          {swingKind[2]}
        </Flex>
      </Flex>
      <GridComponent selectedIndex={gridIndex} setSelectedIndex={setGridIndex} />
      <Text>{verticalLocations[getRowCol(gridIndex)[0] as keyof typeof horizontalLocations]}</Text>
      <Text>
        {horizontalLocations[getRowCol(gridIndex)[1] as keyof typeof horizontalLocations]}
      </Text>
      <Text> {swingKind[kind as keyof typeof swingKind]}</Text>
      <button className={globalStyles.button} onClick={handleCommit}>
        Commit
      </button>
      <button className={globalStyles.button} onClick={handleReveal}>
        Reveal
      </button>
    </Flex>
  );
};

export default BatterView;
