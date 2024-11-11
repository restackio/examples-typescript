export type TokensCount = {
  input: number;
  output: number;
};

export type Price = {
  input: number;
  output: number;
};
export const openaiCost = ({
  tokensCount,
  price,
}: {
  tokensCount: TokensCount;
  price: Price;
}): number => {
  let cost = 0;
  const { input: inputTokens, output: outputTokens } = tokensCount;
  const { input: inputPrice, output: outputPrice } = price;

  cost = inputTokens * inputPrice + outputTokens * outputPrice;

  return cost;
};
