import { deepCamelCase, transformKeys } from "@/lib/caseConversion";
import { z } from "zod";
import { ProductSchema } from "./productTypes";

// Enums
export const MODEL_VALUES = ["gpt-4o", "gpt-4o-mini", "deepseek"] as const;
export const ModelSchema = z.enum(MODEL_VALUES).default("gpt-4o");
export type Model = z.infer<typeof ModelSchema>;

export const ARCHITECTURE_VALUES = ["semantic-router", "llm-router", "hybrid-router", "dynamic-agent"] as const;
export const ArchitectureSchema = z.enum(ARCHITECTURE_VALUES);
export type Architecture = z.infer<typeof ArchitectureSchema>;

export const HISTORY_MANAGEMENT_VALUES = ["keep-none", "keep-last-5", "keep-all"] as const;
export const HistoryManagementSchema = z.enum(HISTORY_MANAGEMENT_VALUES);
export type HistoryManagement = z.infer<typeof HistoryManagementSchema>;

// Base Message Schema
const BaseMessageSchema = z.object({
  messageId: z.string(),
  timestamp: z.date(),
  isComplete: z.boolean(),
  model: ModelSchema,
  architectureChoice: ArchitectureSchema,
  historyManagementChoice: HistoryManagementSchema,
});

// Request Message Schema
export const RequestMessageSchema = BaseMessageSchema.extend({
  isUserMessage: z.literal(true),
  message: z.string(),
});

export type RequestMessage = z.infer<typeof RequestMessageSchema>;

const ResponseContentSchema = z.object({
  type: z.string(),
  message: z.string(),
  products: z.array(ProductSchema).optional(),
  reasoning: z.string().optional(),
  followUpQuestion: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ChatResponseSchema = z.object({
  type: z.literal("chat"),
  content: z.string(),
  document_path: z.string().optional(),
  document_paths: z.string().optional(),
  function_call: z.string(),
  recipient: z.string(),
  sender: z.string(),
  agent: z.string().optional(),
  skills: z.string().optional(),
  regenerate: z.string().optional(),
  id: z.string().optional(),
});

const SummaryResponseSchema = z.object({
  type: z.literal("summarized_docs"),
  docs: z.array(
    z.object({
      filename: z.string().optional(),
      content: z.string().optional(),
    })
  ),
  id:z.string().optional()
});

const AnalysisResponseSchema = z.object({
  type: z.literal("analysis_report"),
  id:z.string().optional(),
  docs: z.array(
    z.object({
      timeline: z.array(
        z.object({       
            date: z.string().optional(), 
            event: z.string().optional(),
            actors: z.array(z.string()).optional(),
        })
      ),
      result: z.array(z.string()).optional(),
    })
  ),
});

export const ResponseMessageSchema = z.union([AnalysisResponseSchema,ChatResponseSchema, SummaryResponseSchema]);

// const ResponseMessageSchema = z.object({
//   type: z.literal("chat"),
//   content: z.string(),
//   documentPath: z.string().optional(),
//   documentPaths: z.string().optional(),
//   functionCall: z.string().optional(),
//   recipient: z.string(),
//   sender: z.string(),
//   agent: z.string().optional(),
//   skills: z.string().optional(),
//   regenerate: z.string().optional(),
//   summeraized_docs: z.array(
//     z.object({
//       filename: z.string(),
//       content: z.string(),
//     })
//   ).optional(),
// });


export type ResponseMessage = z.infer<typeof ResponseMessageSchema>;

// Chat History

export const ChatHistoryItemSchema = z.union([RequestMessageSchema, ResponseMessageSchema]);
export type ChatHistoryItem = z.infer<typeof ChatHistoryItemSchema>;
export type ChatHistory = ChatHistoryItem[];

// Request Data (for API calls)
export const RequestDataSchema = z.object({
  type: z.string(),
  sessionId: z.string(),
  messageId: z.string(),
  message: z.string(),
  timestamp: z.string().optional(),
  model: ModelSchema,
  architectureChoice: ArchitectureSchema,
  historyManagementChoice: HistoryManagementSchema,
});

export type RequestData = z.infer<typeof RequestDataSchema>;


export const ConnectSchema = z.object({
  sessionId: z.string(),
  model: z.string(),
});

export type ConnectData=z.infer<typeof ConnectSchema>
// Utility functions
export const requestDataFromJson = (json: unknown): RequestData => {
  const camelCaseData = transformKeys(json as Record<string, any>, "snakeToCamel");
  return RequestDataSchema.parse(camelCaseData);
};

export const requestDataToJson = (data: RequestData): unknown => {
  return transformKeys(data, "camelToSnake");
};

// export const responseMessageFromJson = (json: unknown): ResponseMessage => {
//   try {
//     let camelCaseData = transformKeys(json as Record<string, any>, "snakeToCamel");

//     // Parse the message field if it's a string
//     if (typeof camelCaseData.message === "string") {
//       try {
//         camelCaseData.message = JSON.parse(camelCaseData.message);
//       } catch (error) {
//         console.error("Error parsing message JSON:", error);
//         throw new Error("Invalid message format");
//       }
//     }

//     // Apply deep camelCase conversion to the message object
//     camelCaseData.message = deepCamelCase(camelCaseData.message);

//     // Map 'response' field to 'message' in the message object if 'message' is undefined
//     if (camelCaseData.message && typeof camelCaseData.message === "object" && camelCaseData.message.message === undefined && camelCaseData.message.response !== undefined) {
//       camelCaseData.message.message = camelCaseData.message.response;
//       delete camelCaseData.message.response;
//     }

//     // Convert the 'id' field to 'messageId' if it exists
//     if ("id" in camelCaseData && !("messageId" in camelCaseData)) {
//       camelCaseData.messageId = camelCaseData.id;
//       delete camelCaseData.id;
//     }

//     // Set isUserMessage to false if it's not present
//     if (camelCaseData.isUserMessage === undefined) {
//       camelCaseData.isUserMessage = false;
//     }

//     console.log("Transformed to camelCase:", camelCaseData);

//     return ResponseMessageSchema.parse(camelCaseData);
//   } catch (error) {
//     console.error("Error parsing response data:", error);
//     if (error instanceof z.ZodError) {
//       console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
//     }
//     throw new Error("Invalid response data");
//   }
// };
export const responseMessageFromJson = (json: unknown): ResponseMessage => {
  try {
    // Transform keys to camelCase
    let camelCaseData = transformKeys(json as Record<string, any>, "snakeToCamel");

    // Ensure 'content' remains a string
    if (typeof camelCaseData.content !== "string") {
      console.error("Error: Content must be a string");
      throw new Error("Invalid content format");
    }

    // Convert 'id' to 'messageId' if not already converted
    if ("id" in camelCaseData && !("messageId" in camelCaseData)) {
      camelCaseData.messageId = camelCaseData.id;
      delete camelCaseData.id;
    }

    // Set isUserMessage to false if it's not explicitly present
    if (camelCaseData.isUserMessage === undefined) {
      camelCaseData.isUserMessage = false;
    }

    console.log("Transformed to camelCase:", camelCaseData);

    // Validate and return the transformed object
    return ResponseMessageSchema.parse(camelCaseData);
  } catch (error) {
    console.error("Error parsing response data:", error);
    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
    }
    throw new Error("Invalid response data");
  }
};

export const responseMessageToJson = (data: ResponseMessage): unknown => {
  return transformKeys(data, "camelToSnake");
};
