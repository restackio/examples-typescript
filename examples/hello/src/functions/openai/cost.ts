import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";

// https://openai.com/pricing as of 13/05/24

interface ModelPrices {
  inputPrice: number;
  outputPrice: number;
}

type OpenAiModelName = ChatCompletionCreateParamsBase["model"];

//@ts-ignore
const modelPrices: Record<OpenAiModelName, ModelPrices> = {
  "gpt-4o-mini-2024-07-18": {
    inputPrice: 0.00000015,
    outputPrice: 0.0000006,
  },
};

export const openaiCost = ({
  model,
  tokensCountInput,
  tokensCountOutput,
}: {
  model: OpenAiModelName;
  tokensCountInput: number;
  tokensCountOutput: number;
}): number => {
  let cost = 0;
  if (model && modelPrices[model]) {
    const { inputPrice, outputPrice } = modelPrices[model];
    cost = tokensCountInput * inputPrice + tokensCountOutput * outputPrice;
  }

  return cost;
};
