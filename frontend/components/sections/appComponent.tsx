"use client";

import ChatComponent from "@/components/sections/ChatComponent";
import ProductComponent from "@/components/sections/ProductComponent";
import ContextsComponent from "@/components/sections/ContextsComponent";
import TestComponent from "@/components/sections/TestComponent";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppState, useAppContext } from "@/hooks/useAppContext";
import React, { useCallback, useState } from "react";
import Header from "./Header";
import { toast } from "react-toastify";
import { useChatContext } from "@/hooks/useChatContext";

interface AppComponentProps {
  selectedUser: string;
  onUserSelect: (user: string) => void;
}





  

const AppComponent: React.FC <AppComponentProps> = ({ selectedUser, onUserSelect }) => {
  const { state, data, actions } = useAppContext();
  const [activeTab, setActiveTab] = useState("chat"); 
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [file, setFile] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const { data: chatData  } = useChatContext();
    const { sessionId } = chatData;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFile(Array.from(selectedFiles));
    }
  };



  const handleFileUpload = async () => {
    const roomId = sessionId;
  
    if (file.length === 0) {
      toast.error("No files selected");
      return;
    }
  
    const duplicateFiles = file.filter((f) =>
      uploadedFiles.some((uploadedFile) => uploadedFile.name === f.name)
    );
  
    if (duplicateFiles.length > 0) {
      toast.info("Some files have already been uploaded.");
      return;
    }
  
    const formData = new FormData();
    file.forEach((f) => {
      formData.append("files", f); 
    });
  
    console.log("ooooooooooooo", formData)
    try {
      const response = await fetch(`http://74.241.130.204:3032/upload-file/${roomId}`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("File upload failed");
      }
  
      const data = await response.json();
      console.log("Upload successful, server response:", data);
  
      const newUploadedFiles = data.files.map((file) => ({
        name: file.filename,
        url: file.file_URL,
      }));
  
      setUploadedFiles((prevFiles) => [...prevFiles, ...newUploadedFiles]);
  
      toast.success("Files uploaded successfully");
      setFile([]);  
    } catch (error) {
      toast.error("An error occurred while uploading the file");
      console.error(error);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    toast.success("File removed");
  };

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      switch (value) {
        case "chat":
          actions.select.chat();
          break;
        case "test":
          actions.select.test();
          break;
        case "products":
          actions.select.manageProducts();
          break;
        case "contexts":
            actions.select.contextViews();
            break;
      }
    },
    [actions]
  );

  console.log("Rendering AppComponent", state.appState);

  const navigateToContexts = useCallback((message: string) => {
    setActiveTab("contexts");  
    actions.select.contextViews();
    if (message) {
      setSearchMessage(message); 
    } 
  }, [actions]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <Header 
        selectedUser={selectedUser}
        onUserSelect={onUserSelect}
        state={state.appState}
        data={data}
        actions={actions}
      />
      <TabsContent value="chat">
        {state.appState === AppState.Chatting && (
          <ChatComponent onNavigateToContext={(message) => navigateToContexts(message)} selectedUser={selectedUser} uploadedFiles={uploadedFiles} handleFileUpload={handleFileUpload} handleFileChange={handleFileChange} file={file} handleRemoveFile={handleRemoveFile}/>
        )}
      </TabsContent>      <TabsContent value="test">{state.appState === AppState.Testing && <TestComponent />}</TabsContent>
      <TabsContent value="products">{state.appState === AppState.Managing && <ProductComponent />}</TabsContent>
      {/* <TabsContent value="contexts">{state.appState === AppState.ContextFetch && <ContextComponent selectedUser={selectedUser}/>}</TabsContent> */}
      <TabsContent value="contexts">
        {state.appState === AppState.ContextFetch && (
          <ContextsComponent data={data}/>
        )}
      </TabsContent>

    </Tabs>
  );
};

export default React.memo(AppComponent);
