import Layout from "../../src/components/layout/layout";
import AtBatView from "../../src/components/atbat/AtBatView";

const Home = () => {
  return (
    <Layout home={true} title="Fullcount">
      <AtBatView />
    </Layout>
  );
};

export default Home;
