"use client";

import { useState } from "react";
import { Example, examples } from "./examplesList";
import { triggerWorkflow } from "@/app/actions/Trigger";

const Examples = () => {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState({});

  const handleButtonClick = async (example: Example) => {
    setLoading(true);
    setOutput({});
    try {
      const result = await triggerWorkflow(example.workflowName, example.input);
      setOutput(result);
    } catch (error) {
      console.error("Error triggering workflow:", error);
      setOutput("Error triggering workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center sm:items-start">
      {examples.map((example, index) => (
        <div key={index} className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">{example.name}</h3>
          <p className="text-sm">{example.description}</p>
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            onClick={() => handleButtonClick(example)}
            disabled={loading}
          >
            {loading ? "Triggering..." : "Trigger Workflow"}
          </button>
        </div>
      ))}
      {output && (
        <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h4 className="text-lg font-bold">Output:</h4>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Examples;
