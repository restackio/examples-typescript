import { log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";

export async function voicesWorkflow() {

    // Step 1: Fetch all voices
    const voices = await step<typeof functions>({
        taskQueue: "lmnt",
    }).lmntFetchVoices({ owner: "system" });

    // Step 2: Create a voice
    // const createdVoice = await step<typeof functions>({
    //     taskQueue: "lmnt",
    // }).lmntCreateVoice({ name: "John", enhance: true , filenames: ["en.mp3", "fr.mp3"]});

    // Step 3: Fetch the voice
    const fetchedVoice = await step<typeof functions>({
        taskQueue: "lmnt",
    }).lmntFetchVoice("amy");

    // Step 4: Update the voice
    const updatedVoice = await step<typeof functions>({
        taskQueue: "lmnt",
    }).lmntUpdateVoice({ voice: fetchedVoice.id, options: { starred: false } });

    // Step 5: Delete the voice
    // const deletedVoice = await step<typeof functions>({
    //     taskQueue: "lmnt",
    // }).lmntDeleteVoice('custom');

    return {
        voices,
        //createdVoice,
        fetchedVoice,
        updatedVoice,
        // deletedVoice
    };
}