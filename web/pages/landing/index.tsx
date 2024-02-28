import Layout from "../../src/components/layout/layout";
import Landing from "../../src/components/landing/Landing";

const Home = () => {
  return (
    <Layout home={true} title="Fullcount">
      <Landing />
    </Layout>
  );
};

export default Home;
