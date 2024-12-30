"use client";

import AppComponent from "@/components/sections/appComponent";
import { useState } from "react";
import { FeedbackContextProvider } from "@/hooks/useFeedbackContext";
import { FeedbackChatProvider } from "@/hooks/useFeedbackChat";
import { BrowserRouter as Router } from "react-router-dom"; 

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<string>("");

  return (
    <Router>
      <FeedbackContextProvider>
        <FeedbackChatProvider>
        <main className="flex min-h-screen flex-col items-center justify-between">
          <AppComponent selectedUser={selectedUser} onUserSelect={setSelectedUser} />
        </main>
        </FeedbackChatProvider>
      </FeedbackContextProvider>
    </Router> 
  );
}
