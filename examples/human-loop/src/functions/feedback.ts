interface Input {
  feedback: string;
}

export async function feedback(input: Input): Promise<string> {
  return `Feedback received: ${input.feedback}`;
}
