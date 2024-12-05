interface Input {
  name: string;
}

interface Output {
  message: string;
}

export async function hello(input: Input): Promise<Output> {
  return { message: `Hello, ${input.name}!` };
}
