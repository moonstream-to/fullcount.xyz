import Layout from "../src/components/layout/layout";
import TitleScreen from "../src/components/TitleScreen";

const Home = () => {
  return (
    <Layout home={true} title="Fullcount">
      <TitleScreen />
    </Layout>
  );
};

export default Home;
