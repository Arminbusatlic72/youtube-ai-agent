import { redirect } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
interface ChatPageProps {
  params: {
    chatid: Id<"chats">;
  };
}
async function ChatPage({ params }: ChatPageProps) {
  const { chatid } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  return <div>PageId : {chatid}</div>;
}

export default ChatPage;
