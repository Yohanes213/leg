import { MessageCircle, PlusIcon } from "lucide-react";
import { memo } from "react";

interface ChatHeaderProps{
  ratingschat:{ [key: string]: string };
  clearChat: () => void;
}
const ChatHeader: React.FC<ChatHeaderProps> = memo(function ChatHeader({ratingschat,clearChat }) {

  return (
        <header className="grid grid-cols-3 items-center py-3 sm:px-6 w-full">
          <div></div>
          <div className="flex justify-center col-span-1">
            <MessageCircle className="h-6 w-6 text-card-foreground" />
            <h1 className="text-lg font-semibold text-card-foreground">Chatbot</h1>
          </div>
          <div className="flex justify-end  col-span-1">
            <button
              onClick={clearChat}
              className="flex items-center mr-12 px-5 py-2 bg-gray-800 text-white  text-sm font-medium hover:bg-black-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-white-600 focus:ring-opacity-50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Chat
            </button>
          </div>
        </header>


  );
});

export default ChatHeader