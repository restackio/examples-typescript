export async function aggregateStreamChunks(stream: ReadableStream) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const aggregated = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    aggregated.set(chunk, offset);
    offset += chunk.length;
  }

  const textContent = new TextDecoder().decode(aggregated);
  const jsonObjects = textContent
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  return jsonObjects;
}
