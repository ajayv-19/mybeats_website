import React, { useState, useRef, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Badge from "@mui/material/Badge";
import SendIcon from "@mui/icons-material/Send";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import {
  useAgentFormMessages,
  sendAgentFormMessage,
} from "../apis/AgentFormsapis";
import { toast } from "sonner";

// const StyledPaper = styled(Paper)(({ theme }) => ({
//   borderRadius: theme.shape.borderRadius * 2,
//   overflow: "hidden",
//   display: "flex",
//   flexDirection: "column",
//   height: 480,
// }));

const AgentFormChatBox = (props: AgentFormChatBoxProps) => {
  const { open, onClose, formData, loogedInUser } = props;
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<
    {
      sender: string;
      text: string;
      time: string;
      read: boolean;
      type: string;
    }[]
  >([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: formMessages } = useAgentFormMessages(formData?.id);
  const getUserId = () => loogedInUser?.tokens?.signInDetails?.loginId;
  const unreadCount = messages.filter(
    (row) => row.read == false && row.sender === "Agent"
  ).length;

  useEffect(() => {
    console.log({ unreadCount, messages });
    setUnread(unreadCount);
  }, [messages]);

  useEffect(() => {
    if (formMessages) {
      setMessages(
        formMessages.data.map((row) => ({
          sender: row.sender_id === getUserId() ? "You" : "Agent",
          text: JSON.parse(row.message).message,
          type: JSON.parse(row.message).type,
          time: row.created_at,
          read: row.read,
        }))
      );
    }
  }, [formMessages]);

  console.log({ formMessages });

  // Scroll to bottom when messages change
  //   useEffect(() => {
  //     if (!minimized && open && messagesEndRef.current) {
  //       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //     }
  //   }, [messages, minimized, open]);

  //   // Reset unread when opening or restoring
  //   useEffect(() => {
  //     if (open && !minimized) setUnread(0);
  //   }, [open, minimized]);

  if (!open) {
    // Show nothing if not open
    return null;
  }

  // Minimized chat bubble
  if (minimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        onClick={() => {
          setMinimized(false);
          setUnread(0);
        }}
      >
        <Badge
          badgeContent={unread}
          color="error"
          invisible={unread === 0}
          overlap="circular"
        >
          <Paper
            elevation={6}
            className="rounded-full w-[60px] h-[60px] flex items-center justify-center bg-blue-700 text-white shadow-lg"
          >
            <ChatBubbleOutlineIcon fontSize="large" />
          </Paper>
        </Badge>
      </div>
    );
  }

  // Send message handler
  const handleSend = () => {
    if (input.trim() === "") return;

    console.log("loogedInUser", loogedInUser, formData);
    sendAgentFormMessage(
      formData?.id,
      input,
      getUserId(),
      formData?.updated_by,
      "text"
    )
      .then((res) => {
        console.log({ res });
        setMessages([
          ...messages,
          {
            sender: "You",
            text: input,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: false,
            type: "text",
          },
        ]);
        setInput("");
      })
      .catch((err) => {
        console.log({ err });
        toast.error(err.response.data.message);
      });
  };

  console.log({ messages });

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{
        width: 370,
        maxWidth: "95vw",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}
    >
      <Paper elevation={8} className="!rounded-xl">
        {/* Header */}
        <div className="bg-blue-700 text-white flex items-center justify-between px-4 py-2.5">
          <div className="font-semibold text-base flex items-center">
            <ChatBubbleOutlineIcon className="mr-2" />
            Agent Form Chat |{" "}
            {formData?.updated_by || "Form ID: " + formData?.id || `N/A`}
          </div>
          <div className="text-gray-500 text-xs">{unread} unread messages</div>
          <div className="flex items-center space-x-1">
            <IconButton
              size="small"
              onClick={() => setMinimized(true)}
              sx={{ color: "#fff" }}
              aria-label="Minimize"
              className="hover:bg-blue-800"
            >
              <MinimizeIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onClose()}
              sx={{ color: "#fff" }}
              aria-label="Close"
              className="hover:bg-blue-800"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        {/* Chat Body */}
        <div className="flex-1 bg-gray-100 px-3 pt-3 pb-0 overflow-y-auto flex flex-col">
          <div className="mb-2 text-gray-500 text-xs">
            <b>Form:</b> {formData?.name || "N/A"}
          </div>
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center mt-10">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "You" ? "flex-row-reverse" : "flex-row"} items-end mb-2`}
              >
                <div
                  className={`${
                    msg.sender === "You"
                      ? "bg-blue-700 text-white ml-0 mr-2"
                      : "bg-gray-200 text-gray-900 ml-2 mr-0"
                  } rounded-2xl px-4 py-2 max-w-[70%] text-sm break-words`}
                >
                  {msg.text}
                  <div className="text-[11px] text-gray-400 mt-1 text-right">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-gray-100 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Type your message..."
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={input.trim() === ""}
            sx={{
              minWidth: 0,
              px: 2,
              py: 1,
              fontSize: "0.95rem",
              borderRadius: "0.5rem",
              textTransform: "none",
            }}
            className="!shadow-none"
          >
            Send
          </Button>
        </div>
      </Paper>
    </div>
  );
};

interface AgentFormChatBoxProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  loogedInUser: any;
}

export default AgentFormChatBox;
