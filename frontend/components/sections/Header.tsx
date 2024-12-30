import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppContextActions, AppContextData, AppState } from "@/hooks/useAppContext";
import { BotIcon, DownloadIcon, ImportIcon } from "lucide-react";
import React, { memo, useEffect, useState } from "react";
import SettingsDropdown from "./SettingsDropdown";
import { Button } from "../ui/button";
import FeedbackForm from "../forms/ContextFeedBackForm";
import AccuracyFeedbackForm from "../forms/ChatFeedbackForm";

import { FeedbackContextProvider, useFeedbackContext } from "@/hooks/useFeedbackContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFeedbackChat } from "@/hooks/useFeedbackChat";

interface HeaderProps {
  selectedUser: string;
  onUserSelect: (user: string) => void;
  state: AppState;
  data: AppContextData;
  actions: AppContextActions;
}

const Header: React.FC<HeaderProps> = memo(function Header({ selectedUser, onUserSelect, state, data, actions }) {

  const { listOfArticles, ratings, filterFiles, filterQuery, onRatingChange } = useFeedbackContext();
  const { listOfResponses, ratingschat, onRatingChangechat } = useFeedbackChat();
  const feedbackContext = useFeedbackContext();
  const [currentUser, setCurrentUser] = useState<string>(selectedUser);
  const [userList, setUserList] = useState<string[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);
  
  const openDialog1 = () => setIsOpen1(true);
  const closeDialog1 = () => setIsOpen1(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://74.241.130.204:1111/names"); 
        const data = await response.json();

        if (response.ok) {
          setUserList(data.names); 
        } else {
          throw new Error(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleDropdown = () => setDropdownVisible((prev) => !prev);

  const handleUserSelect = (user: string) => {
    setCurrentUser(user);
    onUserSelect(user);
    setDropdownVisible(false); 
  };

  return (
    <div className="flex w-full flex-row justify-between border-b bg-slate-100 px-20 py-3">
      <Logo />
      <Navigation />
      <div className="flex items-center gap-1">
        <SettingsDropdown data={data} actions={actions} />
      </div>
      <div className="flex flex-row gap-2">
        <div className="flex items-center">

          <Button
            variant="ghost"
            className="ml-2"
            onClick={openDialog} 
          >
            <span className="text-x">Feedback</span>
          </Button>

          {isOpen && (
            <FeedbackForm 
              isOpen={isOpen} 
              onCancel={closeDialog} 
              listOfArticles={listOfArticles}
              ratings={ratings}
              filterQuery={filterQuery}
              onRatingChange={onRatingChange}
              selectedUser={selectedUser}
              filterFile={filterFiles}
              model={data.model}
            />
          )}
        </div>

        <div className="flex flex-col">
          <Select value={currentUser} onValueChange={handleUserSelect}>
            <SelectTrigger className="w-36 text-black bg-white hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-left dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              <SelectValue placeholder="Select User" className="text-sm">
                {currentUser || "Select User"}
              </SelectValue>
            </SelectTrigger>

            <SelectContent className="w-36">
              {userList.map((user, index) => (
                <SelectItem key={index} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});

const Logo: React.FC = memo(function Logo() {
  return (
    <div className="flex items-center gap-2">
      <BotIcon className="h-6 w-6" />
      <span className="font-bold">Legal Assist</span>
    </div>
  );
});

const Navigation: React.FC = memo(function Navigation() {
  return (
    <TabsList className="grid w-[25%] grid-cols-3">
      <TabsTrigger value="chat">Chat</TabsTrigger>
      <TabsTrigger value="products">Templates</TabsTrigger>
      <TabsTrigger value="contexts">Context</TabsTrigger>
    </TabsList>
  );
});

export default Header;
