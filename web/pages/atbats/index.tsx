import Layout from "../../src/components/layout/layout";
import PracticeSelect from "../../src/components/practice/PracticeSelect";
import AtBatView from "../../src/components/atbat/AtBatView";

const Home = () => {
  return (
    <Layout home={true} title="Fullcount">
      <AtBatView />
    </Layout>
  );
};

export default Home;
