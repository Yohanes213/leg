import React, { createContext, useContext, useState, ReactNode } from "react";


interface FilterQuery {
  value: string;
}
interface FilterFile{
  feature:string;
}
interface FeedbackContextType {
  isOpen: boolean;
  listOfArticles: { id?: string; article_name?: string; article_detail?: string }[];
  ratings: { [key: string]: string };
  selectedUser: string;
  onCancel: () => void;
  onRatingChange: (articleId: string, rating: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  setListOfArticles:(listofArticles:{ 
    content?: string | null;
    tags?: string; // JSON string, can be parsed into a Tag object
    metadata?: string; // JSON string, can be parsed into Metadata object
    description?: string | null;
    date_to?: string | null; // ISO 8601 date string or null
    category?: string; // JSON string, can be parsed into a Category object
    entry_to_force?: string; // ISO 8601 date string
    publication_date?: string; // ISO 8601 date string
    date?: string; // ISO 8601 date string
    hearing_date?: string; // ISO 8601 date string
  }[]) => void;
  setRatings:(ratings:any) => void;
  setSelectedUser:(selectedUser:string) => void;
  filterQuery: FilterQuery; 
  setfilterQuery: React.Dispatch<React.SetStateAction<FilterQuery>>;
  filterFiles:FilterFile;
  setfilterFiles:React.Dispatch<React.SetStateAction<FilterFile>>
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);
export const useFeedbackContext = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedbackContext must be used within a FeedbackProvider");
  }
  return context;
};

export const FeedbackContextProvider: React.FC<{children: ReactNode}> = ({children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [listOfArticles, setListOfArticles] = useState( []);
  const [ratings, setRatings] = useState( {});
  const [selectedUser, setSelectedUser] = useState("");
  const [filterQuery, setfilterQuery] = useState({value:""});
  const [filterFiles, setfilterFiles] = useState({ feature: ""});  


  const onCancel = () => {
    setIsOpen(false); 
  };

  const onRatingChange = (articleId: string, rating: string) => {
    setRatings((prevRatings) => ({ ...prevRatings, [articleId]: rating }));
  };

 
  return <FeedbackContext.Provider value={{filterFiles,setfilterFiles,listOfArticles,setListOfArticles,filterQuery, setfilterQuery, ratings, setRatings,selectedUser, setSelectedUser,isOpen,setIsOpen,onCancel,onRatingChange}}>{children}</FeedbackContext.Provider>;
};
