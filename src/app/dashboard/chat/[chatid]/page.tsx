import { Id } from "../../../../../convex/_generated/dataModel";

interface ChatPageProps {
  params: Promise<{
    chatId: Id<"chats">;
  }>;
}

async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  console.log("Here I console.log params:", chatId); // Should log the chatId from the URL

  return <div>PageId : {chatId}</div>;
}

export default ChatPage;
