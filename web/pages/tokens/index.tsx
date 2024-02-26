import Layout from "../../src/components/layout/layout";
import PlayingLayout from "../../src/components/layout/PlayingLayout";
import TokenTransfers from "../../src/components/tokens/TokenTransfers";
import { Flex, Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../src/constants";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  return (
    <Layout home={true} title="Fullcount - your tokens">
      <PlayingLayout>
        <Flex alignItems={"center"} direction={"column"}>
          <Image
            alt="exit"
            src={`${FULLCOUNT_ASSETS_PATH}/icons/exit.svg`}
            h={"20px"}
            w={"20px"}
            cursor={"pointer"}
            marginLeft={"auto"}
            onClick={() => router.push("/", undefined, { shallow: true })}
          />
          <TokenTransfers />
        </Flex>
      </PlayingLayout>
    </Layout>
  );
};

export default Home;
