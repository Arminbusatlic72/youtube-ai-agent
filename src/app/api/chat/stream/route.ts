import { getConvexClient } from "@/lib/convex";
// import { ChatRequestBody } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import {
  ChatRequestBody,
  StreamMessage,
  StreamMessageType,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER
} from "@/lib/types";

export const runtime = "edge";
function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = (await req.json()) as ChatRequestBody;
    const { messages, newMessage, chatId } = body;
    const convex = getConvexClient();

    // Create stream with larger queue strategy for better performance
    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        // "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no" // Disable buffering for nginx which is required for SSE to work properly
      }
    });
    // Handle the streaming response
    const startStream = async () => {
      try {
        //   stream will be implemented here

        // Send initial connection established message
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });

        // Send and save user message to Convex
        await convex.mutation(api.messages.send, {
          chatId,
          content: newMessage
        });
      } catch (error) {
        console.error("Error in chat API", error);
        return NextResponse.json(
          { error: "Failed to process chat request" } as const,
          { status: 500 }
        );
      }
    };
    // (async () => {
    //   try {
    //   } catch (error) {
    //     console.error("Error in chat API", error);
    //     return NextResponse.json(
    //       { error: "Failed to process chat request" } as const,
    //       { status: 500 }
    //     );
    //   }
    // })();
    startStream();
    return response;
  } catch (error) {
    console.error("Error in chat API", error);
    return NextResponse.json(
      { error: "Failed to process chat request" } as const,
      { status: 500 }
    );
  }
}
