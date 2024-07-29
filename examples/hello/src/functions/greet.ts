import { z } from "zod";
import { UsageOutput, openaiChat } from "./openai/chat";

const zodSchema = z.object({
  message: z.string().describe("The greeting message."),
});

type MetadataOutput = {
  output: z.infer<typeof zodSchema>;
  usage: UsageOutput;
};

export async function greet({
  name,
}: {
  name: string;
}): Promise<MetadataOutput> {
  const template = `Greet this person: ${name}. In 4 words or less.`;

  const openaiOutput = await openaiChat({
    zodSchema,
    template,
  });

  return {
    output: openaiOutput.response as MetadataOutput["output"],
    usage: openaiOutput.usage,
  };
}
