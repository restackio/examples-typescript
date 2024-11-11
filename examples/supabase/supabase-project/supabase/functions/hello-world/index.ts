import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { name } = await req.json()

  try {
    const response = await fetch('http://host.docker.internal:8000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowName: "helloWorkflow",
        workflowId: `${Date.now()}-helloWorkflow`,
        input: { name }
      }),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({
        message: `Hello ${name}!`,
        workflow: result
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Failed to execute workflow: ${error}`
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      },
    )
  }
})