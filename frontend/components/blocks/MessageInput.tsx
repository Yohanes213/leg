import React, { memo, useState, useEffect, useRef } from 'react';

interface MessageInputProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  handleSendMessage: () => void;
  isDisabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = memo(function MessageInput({ currentMessage, setCurrentMessage, handleSendMessage, isDisabled }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);
  const maxRows = 2;
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const newMessage = currentMessage + '\n';
      setCurrentMessage(newMessage);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newMessage.length;
        }
      }, 0);
    }
  };

  useEffect(() => {
    const lineCount = currentMessage.split('\n').length;
    setRows(Math.min(maxRows, lineCount));
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(maxRows, lineCount) * 20 + 20}px`; // Adjust height based on rows
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [currentMessage]);

  return (
    <div className="flex w-full max-w-7xl">
      <textarea
        ref={textareaRef}
        value={currentMessage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here..."
        className="flex-1 rounded-l-lg border border-gray-300 hover:border-gray-300 p-2"
        disabled={isDisabled}
        style={{ height: '40px', resize: 'none', overflowY: 'auto' }} 
      />
      <button
        onClick={handleSendMessage}
        className="rounded-r-lg border border-l-0 border-gray-300 bg-gray-800 p-2 text-white hover:bg-b disabled:bg-gray-400"
        disabled={isDisabled}
      >
        Send
      </button>
    </div>
  );
});

export default MessageInput;