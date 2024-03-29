import Layout from "../../src/components/layout/layout";
import PracticeSelect from "../../src/components/practice/PracticeSelect";

const Home = () => {
  return (
    <Layout home={true} title="Fullcount">
      <PracticeSelect />
    </Layout>
  );
};

export default Home;
