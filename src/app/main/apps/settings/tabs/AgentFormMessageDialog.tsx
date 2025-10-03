import React, { useState, useRef, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Badge from "@mui/material/Badge";
import SendIcon from "@mui/icons-material/Send";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import {
  useAgentFormMessages,
  sendAgentFormMessage,
  markReadAgentFormMessage,
} from "../apis/AgentFormsapis";
import { toast } from "sonner";

const AgentFormMessageDialog = (props: AgentFormMessageDialogProps) => {
  const { open, onClose, formData, loogedInUser } = props;
  const [messages, setMessages] = useState<
    {
      sender: string;
      text: string;
      time: string;
      read: boolean;
      type: string;
      id: number;
      extraData?: any;
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
    setUnread(unreadCount);
  }, [messages]);

  useEffect(() => {
    if (formMessages) {
      setMessages(
        formMessages.data
          .filter((row) => {
            let isMyMsg =
              row.sender_id === getUserId() || row.receiver_id === getUserId();
            let invalidMsg = row.sender_id === row.receiver_id;
            return isMyMsg && !invalidMsg;
          })
          .map((row) => ({
            sender: row.sender_id === getUserId() ? "You" : "Agent",
            text: JSON.parse(row.message).message,
            type: JSON.parse(row.message).type,
            time: row.created_at,
            read: row.read,
            id: row.id,
          }))
      );
    }
  }, [formMessages]);

  if (!open) {
    // Show nothing if not open
    return null;
  }

  // Send message handler
  const handleSend = () => {
    if (input.trim() === "") return;

    sendAgentFormMessage(
      formData?.id,
      input,
      getUserId(),
      formData?.updated_by,
      "text"
    )
      .then(({ data: response }) => {
        let newMessage = response.data;
        let msgObj = JSON.parse(newMessage.message);
        setMessages((prev) => [
          ...prev,
          {
            sender: "You",
            text: msgObj.message,
            time: newMessage.created_at,
            read: false,
            type: msgObj.type,
            id: newMessage.id,
          },
        ]);
        setInput("");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const handleMarkRead = (formId: number, msg: any) => {
    console.log({ formId, msg });
    markReadAgentFormMessage(formId, [msg.id])
      .then((res) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
        );
        console.log({ res });
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  console.log({ messages, formData, loogedInUser, open });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        className: "!rounded-xl",
        style: {
          width: 370,
          maxWidth: "95vw",
        },
      }}
    >
      {/* Header */}
      <div className="bg-blue-700 text-white flex items-center justify-between px-4 py-2.5">
        <div className="font-semibold text-base flex items-center">
          <ChatBubbleOutlineIcon className="mr-2" />
          Agent Form Chat |{" "}
          {formData?.updated_by || "Form ID: " + formData?.id || `N/A`}
        </div>
        <div className="flex items-center space-x-1">
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
      <DialogContent
        dividers
        sx={{
          padding: 0,
          background: "#f3f4f6",
          display: "flex",
          flexDirection: "column",
          minHeight: 350,
          maxHeight: 480,
        }}
      >
        <div
          className="flex-1 bg-gray-100 px-3 pt-3 pb-0 overflow-y-auto flex flex-col"
          style={{ minHeight: 300 }}
        >
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
                  } rounded-2xl px-8 py-4 max-w-[70%] text-sm break-words`}
                >
                  {msg.text}
                  <div className="text-[11px] text-gray-400 mt-1 text-right">
                    {msg.time ? (
                      <span>
                        {(() => {
                          const now = new Date();
                          const msgDate = new Date(msg.time);
                          const diff = Math.floor(
                            (now.getTime() - msgDate.getTime()) / 1000
                          );
                          if (isNaN(diff)) return msg.time;
                          if (diff < 60) return "just now";
                          if (diff < 3600)
                            return `${Math.floor(diff / 60)} min ago`;
                          if (diff < 86400)
                            return `${Math.floor(diff / 3600)} hr ago`;
                          if (diff < 604800)
                            return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
                          return msgDate.toLocaleDateString();
                        })()}
                      </span>
                    ) : null}
                  </div>
                </div>
                {/* Envelope icon for agent messages */}
                {msg.sender === "Agent" && !msg.read && (
                  <IconButton
                    size="small"
                    aria-label="Mark as read"
                    sx={{ ml: 1, color: "#1976d2" }}
                    onClick={() => {
                      handleMarkRead(formData?.id, msg);
                    }}
                  >
                    <MarkEmailReadIcon />
                  </IconButton>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "4px 16px",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <input
          type="text"
          className="flex-1 h-full bg-gray-100 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Type your message..."
          value={input}
          maxLength={500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          style={{ flex: 1 }}
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
      </DialogActions>
    </Dialog>
  );
};

interface AgentFormMessageDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  loogedInUser: any;
}

export default AgentFormMessageDialog;
