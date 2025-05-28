import { Speech } from "lmnt-node";

export async function lmntClient() {
    if (!process.env.LMNT_API_KEY) {
        throw new Error("LMNT_API_KEY is missing");
    }
    const speech = new Speech(process.env.LMNT_API_KEY);
    return speech;
}
