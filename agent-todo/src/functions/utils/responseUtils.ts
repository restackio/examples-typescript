import { log } from "@restackio/ai/function";
import { ResponseSchema, StructuredResponse } from "../types";

export const parseAndValidateResponse = (messageContent: string): StructuredResponse => {
    try {
        const parsedData = JSON.parse(messageContent);
        const result = ResponseSchema.safeParse(parsedData);

        if (result.success) {
            log.debug("JSON response parsed successfully", { structuredData: result.data });
            return result.data;
        } else {
            log.warn("Unexpected format from JSON mode", {
                content: messageContent,
                errors: result.error.errors
            });
            return { type: "text", content: messageContent };
        }
    } catch (error) {
        log.error("Failed to parse JSON response despite JSON mode", { error });
        return { type: "text", content: messageContent || "Error processing response" };
    }
};