"use client";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ChatRequestBody } from "@/lib/types";
interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

export default function ChatInterface({
  chatId,
  initialMessages
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Function to scroll up when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") return output;
    return JSON.stringify(output, null, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;
    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setIsLoading(true);

    // Optimistic message (client timestamp)
    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now()
    } as Doc<"messages">;
    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      const requestBody: ChatRequestBody = {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content
        })),
        newMessage: trimmedInput,
        chatId
      };
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("No response body available");

      // Example: After receiving the real message from the server
      // (Replace this with your actual logic for receiving the message)
      const serverMessage: Doc<"messages"> = await response.json(); // This should include server `createdAt`

      // Replace optimistic message with server message
      setMessages((prev) =>
        prev
          .filter((msg) => msg._id !== optimisticUserMessage._id)
          .concat(serverMessage)
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticUserMessage._id)
      );
      setStreamedResponse("error");
    } finally {
      setIsLoading(false);
    }
  };
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const trimmedInput = input.trim();
  //   if (!trimmedInput || isLoading) return;
  //   // Reset UI state for new message
  //   setInput("");
  //   setStreamedResponse("");
  //   setCurrentTool(null);
  //   setIsLoading(true);

  //   // Add user's message immediately for better UX
  //   const optimisticUserMessage: Doc<"messages"> = {
  //     _id: `temp_${Date.now()}`,
  //     chatId,
  //     content: trimmedInput,
  //     role: "user",
  //     createdAt: Date.now()
  //   } as Doc<"messages">;
  //   setMessages((prev) => [...prev, optimisticUserMessage]);

  //   // Track complete response for saving to database
  //   let fullResponse = "";

  //   try {
  //     // Prepare chat history and new message for API
  //     const requestBody: ChatRequestBody = {
  //       messages: messages.map((msg) => ({
  //         role: msg.role,
  //         content: msg.content
  //       })),
  //       newMessage: trimmedInput,
  //       chatId
  //     };
  //     // Initialize SSE connection
  //     const response = await fetch("/api/chat/stream", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(requestBody)
  //     });

  //     if (!response.ok) throw new Error(await response.text());
  //     if (!response.body) throw new Error("No response body available");

  //     // Handle the stream Main part
  //   } catch (error) {
  //     // Handle any errors during streaming
  //     console.error("Error sending message:", error);
  //     // Remove the optimistic user message if there was an error
  //     setMessages((prev) =>
  //       prev.filter((msg) => msg._id !== optimisticUserMessage._id)
  //     );
  //     setStreamedResponse("error");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      <section className="flex-1 overflow-y-auto bg-gray-50 p-2 md:p-0">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {/* {messages} */}
          {messages.map((message) => (
            <div key={message._id}>{message.content}</div>
          ))}
          {/* {last message} */}
          <div ref={messagesEndRef} />
        </div>
      </section>
      {/* Input form */}
      <footer className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Agent..."
              className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <ArrowRight />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
}
