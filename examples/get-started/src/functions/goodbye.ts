interface Input {
  name: string;
}

interface Output {
  message: string;
}

export async function goodbye(input: Input): Promise<Output> {
  return { message: `Goodbye, ${input.name}!` };
}
