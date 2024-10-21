import { welcome, goodbye } from "./functions/functions";
import { client } from "./client";


async function services() {

    const workflowsPath = require.resolve("./workflows/workflow");

    client.startService({
        workflowsPath,
        functions: { welcome, goodbye }
    });

};

services();

