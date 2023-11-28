import axios, { AxiosResponse } from "axios";

export async function getPlayerStats(nftAddress: string, nftTokenId: string): Promise<any> {
    const allDataResponse: string | any = await getAllStats();
    if (typeof allDataResponse == "string") {
        return allDataResponse;
    } else {
        const nftConcat = nftAddress + "_" + nftTokenId;
        const playerStats = allDataResponse.find((stats: any) => {
            return stats.address == nftConcat;
        });
        return playerStats || {};
    }
};

export async function getAllStats(): Promise<object | string> {
    const statsQueryUrl = "https://api.moonstream.to/queries/fullcount_player_stats/update_data";
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