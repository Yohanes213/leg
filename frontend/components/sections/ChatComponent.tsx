"use client";

import { ChatState, useChatContext } from "@/hooks/useChatContext";
import { MessageCircle, PlusIcon } from "lucide-react";
import React, { memo, useCallback, useEffect, useState } from "react";
import ChatWindow from "../blocks/ChatWindow";
import MessageInput from "../blocks/MessageInput";
import { toast } from "react-toastify";
import ChatHeader from "../blocks/ChatHeader";
import AccuracyFeedbackForm from "../forms/ChatFeedbackForm";
import { useFeedbackChat } from "@/hooks/useFeedbackChat";

interface ChatComponentProps{
  onNavigateToContext: (message:string) => void 
  selectedUser: string;
  uploadedFiles: { name: string; url: string }[]
  handleFileUpload: () => Promise<void>;  
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file:File[]
  handleRemoveFile: (index: number) => void;
}
const ChatComponent: React.FC<ChatComponentProps> = ({ onNavigateToContext, selectedUser, uploadedFiles, handleFileUpload, handleFileChange , file, handleRemoveFile}) => {
  console.log("ChatComponent .........................");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const { state, data, actions } = useChatContext();
  
  const handleSendMessage = useCallback(() => {
    console.log("Sending message .............");
    actions.sendMessage(currentMessage);
    setCurrentMessage("");
  }, [actions, currentMessage]);

  const [isOpenLawyer, setIsOpenLawyer] = useState(true);
  const [isOpenAI, setIsOpenAI] = useState(true);
  const { listOfResponses, ratingschat, setRatings, onRatingChangechat } = useFeedbackChat();


  const toggleLawyerDropdown = () => {
    setIsOpenLawyer((prev) => !prev);
    if (isOpenLawyer) {
      setFile([]); 
    }
  };

  

  const toggleAIDropdown = () => {
    setIsOpenAI((prev) => !prev);
  };
  
    const [isOpen1, setIsOpen1] = useState(false);

    const clearChat = () => {
      actions.clearChat();
      setRatings({}) 
    };
    
    const openDialog1 = () => setIsOpen1(true);
  

    const closeDialog1 = () => {
      setIsOpen1(false);
    };
  

  useEffect(() => {
    console.log("Chat History:", data.chatHistory);
    const lastMessage = data.chatHistory[data.chatHistory.length - 1];
    if (lastMessage) {
      console.log("Last message object:", lastMessage);
    }
  }, [data.chatHistory]);

  const aiDocumentPaths = data.chatHistory
  .filter((message) => message.document_path) 
  .map((message) => message.document_path) 
  .join("\n");

  const getFileNameFromPath = (filePath: string) => {
    const fileName = filePath.split('/').pop(); 
    return fileName || "";
  };

  return (
    <div className="flex flex-row gap-2">
      <div className="gap-6 ml-4 mt-2 items-center">
        
        <div className="text-xl font-semibold mt-2 mb-4">Documents</div>
        <div>
          <div className="mt-2 flex items-center justify-between">
            <span className="mr-2 text-x font-semibold mb-2">Uploaded by Lawyer</span>
            <button
              onClick={toggleLawyerDropdown}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Toggle dropdown"
            >
              {isOpenLawyer ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 "
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 ml-12"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </div>

          {isOpenLawyer && (
            <div>
              <div className="flex items-center justify-center w-full mt-4">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-6 h-6 mb-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="m-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">files here</p>
                  </div>
                  
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                </label>
              </div>

              {file.length > 0 && (
  <div className="mt-4">
    <div className="mt-2">
      {file.map((file, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm" style={{
                        maxWidth: '200px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: 'inline-block',
                      }} >{file.name}</span>
        </div>
      ))}
    </div>
    <button
      onClick={handleFileUpload}
      className="text-xs px-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
    >
      Upload All
    </button>
  </div>
)}
            </div>
          )}
        </div>

        {isOpenLawyer && (
          <div className="mt-2">
            <ul className="mt-2">
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file, index) => (
                  <li key={index} className="text-x mt-1 flex justify-between items-center">
                    <a
                      href={file.url}  
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline"
                      style={{
                        maxWidth: '200px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: 'inline-block',
                      }}
                    >
                      {file.name}  
                    </a>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))
              ) : (
                <p></p>
              )}
            </ul>
          </div>
        )}

        <div className="mt-4">
        <div className="mt-2 flex items-center justify-between">
            <span className="mr-2 text-x font-semibold mb-2">Uploaded by AI</span>
            <button
              onClick={toggleAIDropdown}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Toggle dropdown"
            >
              {isOpenAI ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 ml-12"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </div>
          {isOpenAI && (
          <div className="mt-2">
            <ul className="mt-2">
              {aiDocumentPaths ? (
              aiDocumentPaths.split("\n").map((docPath, index) => (
                <div key={index} className="flex items-center mb-2">
                  <a
                    href={docPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                    style={{
                      maxWidth: '200px', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: 'inline-block',
                    }}
                    title={getFileNameFromPath(docPath)}  
                  >
                    {getFileNameFromPath(docPath)}  
                  </a>
                </div>
              ))
            ) : (
              <p></p>
            )}
            </ul>
          </div>
        )}
          
      
        </div>
        
        <div className="mt-4 flex items-center w-[250px]">
        {ratingschat && Object.keys(ratingschat).length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 text-black-600 rounded shadow max-w-lg mx-auto">
            <p className="text-center font-medium">
              Please make sure to submit your chat response rating!{" "}
              <span
                onClick={openDialog1}
                className="text-blue-600 underline font-semibold cursor-pointer hover:text-blue-800"
              >
                Here
              </span>{" "}
              
            </p>
          </div>
        )}


        {isOpen1 && (
          <AccuracyFeedbackForm
            isOpen={isOpen1}
            onCancel={closeDialog1}
            listOfResponses={listOfResponses}
            ratingschat={ratingschat}
            onRatingChangechat={onRatingChangechat}
            selectedUser={selectedUser}
            model={data.model}
          />
        )}

        </div>

      </div>

      <div className="flex h-full flex-col items-center bg-background w-5/6">
        <ChatHeader ratingschat={ratingschat} clearChat={clearChat}/>
        <ChatWindow
          chatHistory={data.chatHistory}
          onNavigateToContext={ onNavigateToContext } 
          chatState={state.chatState}
        />
        <MessageInput
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleSendMessage={handleSendMessage}
          isDisabled={state.chatState !== ChatState.Typing}
        />
      </div>
    </div>
  );
};


export default memo(ChatComponent);
