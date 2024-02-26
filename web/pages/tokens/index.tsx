import Layout from "../../src/components/layout/layout";
import PlayingLayout from "../../src/components/layout/PlayingLayout";
import TokenTransfers from "../../src/components/tokens/TokenTransfers";
import { Flex } from "@chakra-ui/react";

const Home = () => {
  return (
    <Layout home={true} title="Fullcount - your tokens">
      <PlayingLayout>
        <Flex justifyContent={"center"}>
          <TokenTransfers />
        </Flex>
      </PlayingLayout>
    </Layout>
  );
};

export default Home;
