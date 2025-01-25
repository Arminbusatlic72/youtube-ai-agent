// import { redirect } from "next/navigation";
// import { Id } from "../../../../../convex/_generated/dataModel";
// import { auth } from "@clerk/nextjs/server";

// import ChatInterface from "@/app/components/ChatInterface";
// interface ChatPageProps {
//   params: {
//     chatid: Id<"chats">;
//   };
// }
// async function ChatPage({ params }: ChatPageProps) {
//   const { chatid } = await params;
//   const { userId } = await auth();
//   if (!userId) {
//     redirect("/");
//   }
//   return (
//     <div className="flex-1 overflow-hidden">
//       <ChatInterface chatId={chatid} initialMessages={initialMessage}/>
//     </div>
//   );
// }

// export default ChatPage;

import ChatInterface from "../../../components/ChatInterface";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

interface ChatPageProps {
  params: {
    chatId: Id<"chats">;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatid } = await params;
  console.log(chatid);
  // Get user authentication
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  try {
    // Get Convex client and fetch chat and messages
    const convex = getConvexClient();

    // Check if chat exists & user is authorized to view it
    const chat = await convex.query(api.chats.getChat, {
      id: chatid,
      userId
    });

    if (!chat) {
      console.log(
        "⚠️ Chat not found or unauthorized, redirecting to dashboard"
      );
      redirect("/dashboard");
    }

    // Get messages
    // const initialMessages = await convex.query(api.messages.list, { chatid });

    return (
      <div className="flex-1 overflow-hidden">
        <ChatInterface chatId={chatid} />
      </div>
    );
  } catch (error) {
    console.error("🔥 Error loading chat:", error);
    redirect("/dashboard");
  }
}
