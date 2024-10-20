import fs from "fs"

import * as dotenv from 'dotenv';
dotenv.config();

export const loadSampleImage = async () => {
    const data = fs.readFileSync("./assets/0.png")
    return data
}

export interface IpfsResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
    isDuplicate?: boolean;
}

export const uploadToIPFS = async ({
    data,
    name = "",
    group = ""
}: {
    data: Blob,
    name?: string,
    group?: string,
}) => {
    const form = new FormData();
    form.append('file', data);

    if (name)
        form.append("name", name);

    if (group)
        form.append("group_id", group);

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json, text/plain, */*");
    myHeaders.append("accept-language", "en-US,en;q=0.6");
    myHeaders.append("authorization", `Bearer ${process.env.PINATA_JWT}`);
    myHeaders.append("cache-control", "no-cache");

    const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: form,
        redirect: "follow"
    };

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", requestOptions)

    if (!response.ok) {
        throw new Error(`Error: ${response.status}: ${response.statusText}`)
    }

    return await response.json() as IpfsResponse
}

export const uploadJSONToIPFS = async ({
    data,
    name = "",
    group = ""
}: {
    data: any,
    name?: string,
    group?: string,
}) => {
    const requestOptions: any = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`,
            'Content-Type': 'application/json'
        },
        body: `{"pinataMetadata":{"name":"metadata.json"},"pinataContent":${JSON.stringify(data)}}`
    };

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", requestOptions)

    if (!response.ok) {
        throw new Error(`Error: ${response.status}: ${response.statusText}`)
    }

    return await response.json() as IpfsResponse
}