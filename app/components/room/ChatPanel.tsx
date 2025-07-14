import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useWebSocket } from "@/app/hooks/useWebSocket";
import { RootState } from "@/app/store/store";
import { Button } from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { Send, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export const ChatPanel = ({ roomId }: { roomId: string }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { sendMessage, isConnected } = useWebSocket();
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages } = useSelector((state: RootState) => state.chat);

  const roomMessages = messages[roomId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      sendMessage(roomId, message.trim());
      setMessage("");
      setIsTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      // Send typing start event
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Send typing stop event
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Chat</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {roomMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.id === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.id === user?.id
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.id !== user?.id && (
                <p className="text-xs text-gray-500 mb-1">
                  {msg.sender.username}
                </p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.id === user?.id ? "text-primary-200" : "text-gray-500"
                }`}
              >
                {formatDistanceToNow(new Date(msg.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicators */}
        {/* {roomTypingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">
                {roomTypingUsers.join(", ")}{" "}
                {roomTypingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            </div>
          </div>
        )} */}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
