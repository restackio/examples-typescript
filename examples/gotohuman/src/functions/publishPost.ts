interface Input {
  post: string;
}

export async function publishPost({ post }: Input): Promise<string> {
  // TODO: Publish the post here
  return `Published: ${post.slice(0,20)}`;
}
