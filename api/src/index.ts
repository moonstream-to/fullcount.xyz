import cors from "cors";
import express, { Application, Request, Response } from 'express';
import { AxiosResponse } from "axios";
import { getAllStats, getPlayerStats, getAllPitchLocatinoDistributions, getPitcherLocationDistribution} from './stats';

const app: Application = express();
app.use(cors());

// Number of hits in Pete Rose's career
const PORT: number = 4256;

app.get("/status", (_: Request, res: Response) => {
    const status = { status: "ok" };
    return res.status(200).json(status);
});

app.get("/stats/", async (req: Request, res: Response) => {
    let stats: object | string = await getAllStats();
    if (typeof stats == "string") {
        return res.status(500).send(stats);
    } else {
        return res.status(200).json(stats);
    }
});

app.get("/stats/:nftAddress/:nftTokenId", async (req: Request, res: Response) => {
    let stats: object | string = await getPlayerStats(req.params.nftAddress, req.params.nftTokenId);
    if (typeof stats == "string") {
        return res.status(500).send(stats);
    } else {
        return res.status(200).json(stats);
    }
});

app.get("/pitch_location_distribution/", async (req: Request, res: Response) => {
    let stats: object | string = await getAllPitchLocatinoDistributions();
    if (typeof stats == "string") {
        return res.status(500).send(stats);
    } else {
        return res.status(200).json(stats);
    }
});

app.get("/pitch_location_distribution/:nftAddress/:nftTokenId", async (req: Request, res: Response) => {
    let stats: object | string = await getPitcherLocationDistribution(req.params.nftAddress, req.params.nftTokenId);
    if (typeof stats == "string") {
        return res.status(500).send(stats);
    } else {
        return res.status(200).json(stats);
    }
});

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});