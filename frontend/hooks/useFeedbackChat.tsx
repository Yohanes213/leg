import React, { createContext, useContext, useState, ReactNode } from "react";

interface FeedbackChatType {
  isOpen: boolean;
  listOfResponses: { id?: string; message?: string }[];
  ratingschat: { [key: string]: string };
  selectedUser: string;
  onCancel: () => void;
  onRatingChangechat: (messageId: string, rating: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  setListOfResponses: (listOfResponses: { id?: string; message?: string }[]) => void;
  setRatings: (ratings: { [key: string]: string }) => void;
  setSelectedUser: (selectedUser: string) => void;
}

const FeedbackChat = createContext<FeedbackChatType | undefined>(undefined);


export const useFeedbackChat = () => {
  const context = useContext(FeedbackChat);
  if (!context) {
    throw new Error("useFeedbackChat must be used within a FeedbackChatProvider");
  }
  return context;
};

export const FeedbackChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [listOfResponses, setListOfResponses] = useState<{ id?: string; message?: string }[]>([]);
  const [ratingschat, setRatings] = useState<{ [key: string]: string }>({});
  const [selectedUser, setSelectedUser] = useState("");

  const onCancel = () => {
    setIsOpen(false);
  };

  const onRatingChangechat = (messageId: string, rating: string) => {
    setRatings((prevRatings) => ({ ...prevRatings, [messageId]: rating }));
  };

  return <FeedbackChat.Provider  value={{listOfResponses,setListOfResponses,ratingschat,setRatings, selectedUser,setSelectedUser,isOpen,setIsOpen,onCancel,onRatingChangechat}}>{children}</FeedbackChat.Provider>
  
};
