import { ChatHistoryItem, ResponseMessage } from "@/types";
import React, { memo, useEffect, useRef } from "react";
import BotResponse from "./BotResponse";
import UserMessage from "./UserMessage";
import { useFeedbackChat } from "@/hooks/useFeedbackChat";
import { ChatState } from "@/hooks/useChatContext";

interface ChatWindowProps {
  chatHistory: ChatHistoryItem[];
  onNavigateToContext: (message: string) => void;
  chatState: ChatState;
}

const ChatWindow: React.FC<ChatWindowProps> = memo(function ChatWindow({
  chatHistory,
  onNavigateToContext,
  chatState,
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { ratingschat, setRatings, setListOfResponses } = useFeedbackChat();
const chatContainerRef = useRef<HTMLDivElement>(null);


useEffect(() => {

  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
}, [chatHistory]);

  useEffect(() => {
    const botResponses = chatHistory
      .filter((message) => !message.isUserMessage) 
      .map((message) => {
        if (message.type === 'chat') {
          return {
            id: message.id,
            type: message.type,
            content: message.content,
          };
        } 
        if (message.type === 'summarized_docs' ) {
          return {
            id: message.id,
            type: message.type,
            docsSummary: message.docs,
          };
        }
        if ( message.type === 'analysis_report') {
            return {
              id: message.id,
              type: message.type,
              docsAnalysis: message.docs,
            };
        } 
        else {
          return {
            id: message.messageId,
            type: 'unknown',
            content: 'Unknown message type',
          };
        }
      });
    setListOfResponses(botResponses);
    console.log("gggggggggggggggggggggg", chatHistory, botResponses);
  }, [chatHistory, setListOfResponses]);

  const handleRatingChange = (messageId: string, rating: string) => {
    setRatings((prevRatings: { [key: string]: string }) => ({
      ...prevRatings,
      [messageId]: rating,
    }));
  };

  return (
    <div  ref={chatContainerRef} className="mx-auto mb-4 h-[664px] w-full max-w-7xl overflow-y-auto rounded-lg border border-gray-300 bg-white">
      {chatHistory.map((message, index) => (
        <div
          key={message.messageId || `message-${index}`}
          className={`mb-4 ${
            message.isUserMessage
              ? "flex flex-col items-end"
              : "flex justify-start"
          }`}
        >
         {/*  Ensure the "Typing..." text appears beside the user message on the left */}

          <div
            className={`rounded-lg p-3 ${
              message.isUserMessage
                ? "max-w-[80%] min-w-[10%] bg-blue-100 text-blue-900 text-center"
                : "w-full bg-gray-100 text-gray-900"
            }`}
          >
            {message.isUserMessage ? (
              <div className="flex flex-row gap-4">
              {/* Typing indicator shown only if the user is the last message and the bot is receiving a response */}
              {/* {message.isUserMessage && index === chatHistory.length - 1 && chatState === ChatState.ReceivingResponse && (
                <div className="flex items-center justify-start mb-2 space-x-2">
                  <span className="text-black text-md animate-pulse">Typing</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-200"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-400"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-600"></div>
                  </div>
                </div>
              )} */}
            
              {/* User message */}
                <UserMessage message={message.message} />
            </div>
            
            
            ) : (
              <div className="flex flex-col">
                <BotResponse message={message as ResponseMessage} />
                <div className="flex space-x-2 mt-2">
                  {["Accurate", "Semi-accurate", "Inaccurate"].map((rating, idx) => (
                    <div
                      key={`rating-${message.id}-${rating}`}
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRatingChange(message.id, rating);
                      }}
                    >
                      <input
                        type="radio"
                        name={`rating-${message.id}`}
                        id={`rating-${message.id}-${rating}`}
                        checked={ratingschat[message.id] === rating}
                        onChange={() => handleRatingChange(message.id, rating)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`rating-${message.id}-${rating}`}
                        className="flex items-center"
                      >
                        <svg
                          className={`w-8 h-8 ${
                            ratingschat[message.id] === rating
                              ? "fill-gray-500 border-gray-500"
                              : "fill-white border-gray-500 stroke-gray-500"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 22 20"
                          aria-hidden="true"
                        >
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                        </svg>
                      </label>
                      <span>{rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default ChatWindow;

