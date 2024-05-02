import Layout from "../../src/components/layout/layout";
import AtBatReplay from "../../src/components/atbat/AtBatReplay";

const Replays = () => {
  return (
    <Layout home={true} title="Fullcount">
      <AtBatReplay />
    </Layout>
  );
};

export default Replays;
