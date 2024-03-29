import cors from "cors";
import express, { Application, Request, Response } from "express";
import { narrateThrowBySessionID } from "./narrate";
import {
  getAllStats,
  getPlayerStats,
  getAllPitcherDistributions,
  getPitcherDistribution,
  getAllBatterDistributions,
  getBatterDistribution,
} from "./stats";

const app: Application = express();
app.use(cors());

// Number of hits in Pete Rose's career
const PORT: number = 4256;

app.get("/ping", (_: Request, res: Response) => {
  const ping = { status: "ok" };
  return res.status(200).json(ping);
});

app.get("/stats/", async (req: Request, res: Response) => {
  let stats: object | string = await getAllStats();
  if (typeof stats == "string") {
    return res.status(500).send(stats);
  } else {
    return res.status(200).json(stats);
  }
});

app.get(
  "/stats/:nftAddress/:nftTokenId",
  async (req: Request, res: Response) => {
    let stats: object | string = await getPlayerStats(
      req.params.nftAddress,
      req.params.nftTokenId
    );
    if (typeof stats == "string") {
      return res.status(500).send(stats);
    } else {
      return res.status(200).json(stats);
    }
  }
);

app.get("/pitch_distribution/", async (req: Request, res: Response) => {
  let stats: object | string = await getAllPitcherDistributions();
  if (typeof stats == "string") {
    return res.status(500).send(stats);
  } else {
    return res.status(200).json(stats);
  }
});

app.get(
  "/pitch_distribution/:nftAddress/:nftTokenId",
  async (req: Request, res: Response) => {
    let stats: object | string = await getPitcherDistribution(
      req.params.nftAddress,
      req.params.nftTokenId
    );
    if (typeof stats == "string") {
      return res.status(500).send(stats);
    } else {
      return res.status(200).json(stats);
    }
  }
);

app.get("/swing_distribution/", async (req: Request, res: Response) => {
  let stats: object | string = await getAllBatterDistributions();
  if (typeof stats == "string") {
    return res.status(500).send(stats);
  } else {
    return res.status(200).json(stats);
  }
});

app.get(
  "/swing_distribution/:nftAddress/:nftTokenId",
  async (req: Request, res: Response) => {
    let stats: object | string = await getBatterDistribution(
      req.params.nftAddress,
      req.params.nftTokenId
    );
    if (typeof stats == "string") {
      return res.status(500).send(stats);
    } else {
      return res.status(200).json(stats);
    }
  }
);

app.get("/throws/:sessionId/narrate", async (req: Request, res: Response) => {
  let narration = "";
  try {
    narration = await narrateThrowBySessionID(req.params.sessionId);
  } catch (e) {
    console.error(
      `Error satisfying narration request: /throws/${
        req.params.sessionId
      }/narrate -- ${new Date().toISOString()} -- ${e}`
    );
    return res.sendStatus(500);
  }
  return res.status(200).json({ narration });
});

app.listen(PORT, (): void => {
  console.log("SERVER IS UP ON PORT:", PORT);
});
