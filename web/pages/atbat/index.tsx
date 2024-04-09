import Layout from "../../src/components/layout/layout";
import AtBatView2 from "../../src/components/atbat/AtBatView2";

const AtBat = () => {
  return (
    <Layout home={true} title="Fullcount">
      <AtBatView2 />
    </Layout>
  );
};

export default AtBat;
