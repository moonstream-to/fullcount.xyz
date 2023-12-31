import axios, { AxiosResponse } from "axios";

const MOONSTREAM_QUERY_API = "https://api.moonstream.to/queries"

function playerFilter(data: any, nftAddress: string, nftTokenId: string): object {
    const nftConcat = nftAddress + "_" + nftTokenId;
    const playerStats = data.find((stats: any) => {
        return stats.address == nftConcat;
    });
    return playerStats || {};
};

export async function getAllStats(): Promise<object | string> {
    const statsQueryUrl = `${MOONSTREAM_QUERY_API}/fullcount_player_stats/update_data`;
    const apiKey = process.env.MOONSTREAM_PUBLIC_QUERIES_DATA_ACCESS_TOKEN;
    const authHeader =  { Authorization: `Bearer ${apiKey}` };

    return await axios.post(
        statsQueryUrl,
        {
            parmas: {},
            blockchain: "wyrm"
        },
        {
            headers: authHeader
        })
        .then(async (apiRes: AxiosResponse) => {
            const s3Url = apiRes.data.url;
            return await axios.get(s3Url)
                .then((s3Response: AxiosResponse) => {
                    return s3Response.data.data;
                })
                .catch((error: Error) => {
                    return error.message;
                });
        })
        .catch((error: Error) => {
            return error.message;
        });
};

export async function getPlayerStats(nftAddress: string, nftTokenId: string): Promise<any> {
    const
     allDataResponse: string | any = await getAllStats();
    if (typeof allDataResponse == "string") {
        return allDataResponse;
    } else {
        return playerFilter(allDataResponse, nftAddress, nftTokenId);
    }
};

export async function getAllPitcherDistributions(): Promise<object | string> {
    const statsQueryUrl = `${MOONSTREAM_QUERY_API}/fullcount_pitch_distribution/update_data`;
    const apiKey = process.env.MOONSTREAM_PUBLIC_QUERIES_DATA_ACCESS_TOKEN;
    const authHeader =  { Authorization: `Bearer ${apiKey}` };

    return await axios.post(
        statsQueryUrl,
        {
            parmas: {},
            blockchain: "wyrm"
        },
        {
            headers: authHeader
        })
        .then(async (apiRes: AxiosResponse) => {
            const s3Url = apiRes.data.url;
            return await axios.get(s3Url)
                .then((s3Response: AxiosResponse) => {
                    return s3Response.data.data;
                })
                .catch((error: Error) => {
                    return error.message;
                });
        })
        .catch((error: Error) => {
            return error.message;
        });
};

export async function getPitcherDistribution(nftAddress: string, nftTokenId: string): Promise<any> {
    const
     allDataResponse: string | any = await getAllPitcherDistributions();
    if (typeof allDataResponse == "string") {
        return allDataResponse;
    } else {
        return playerFilter(allDataResponse, nftAddress, nftTokenId);
    }
};

export async function getAllBatterDistributions(): Promise<object | string> {
    const statsQueryUrl = `${MOONSTREAM_QUERY_API}/fullcount_swing_distribution/update_data`;
    const apiKey = process.env.MOONSTREAM_PUBLIC_QUERIES_DATA_ACCESS_TOKEN;
    const authHeader =  { Authorization: `Bearer ${apiKey}` };

    return await axios.post(
        statsQueryUrl,
        {
            parmas: {},
            blockchain: "wyrm"
        },
        {
            headers: authHeader
        })
        .then(async (apiRes: AxiosResponse) => {
            const s3Url = apiRes.data.url;
            return await axios.get(s3Url)
                .then((s3Response: AxiosResponse) => {
                    return s3Response.data.data;
                })
                .catch((error: Error) => {
                    return error.message;
                });
        })
        .catch((error: Error) => {
            return error.message;
        });
};

export async function getBatterDistribution(nftAddress: string, nftTokenId: string): Promise<any> {
    const
     allDataResponse: string | any = await getAllBatterDistributions();
    if (typeof allDataResponse == "string") {
        return allDataResponse;
    } else {
        return playerFilter(allDataResponse, nftAddress, nftTokenId);
    }
};