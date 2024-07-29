import { ZodObject } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const zodPrompt = async ({
  zodSchema,
}: {
  zodSchema: ZodObject<any>;
}): Promise<string> => {
  return `You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to.

${JSON.stringify(zodToJsonSchema(zodSchema))}
`;
};
