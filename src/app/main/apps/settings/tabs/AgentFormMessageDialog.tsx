import React, { useState, useRef, useEffect } from "react";
import {
  IconButton,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Typography,
  Box,
  Avatar,
  Chip,
  Fade,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Send as SendIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Person as PersonIcon,
  SupportAgent as AgentIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import {
  useAgentFormMessages,
  sendAgentFormMessage,
  markReadAgentFormMessage,
} from "../apis/AgentFormsapis";
import { toast } from "sonner";

// Styled components for better UI
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    minHeight: 500,
    maxHeight: "90vh",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: 500,
    },
  },
}));

const MessageBubble = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: "70%",
  padding: theme.spacing(1.5, 2),
  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.grey[100],
  color: isUser
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  wordWrap: "break-word",
  position: "relative",
  "&:hover": {
    boxShadow: theme.shadows[2],
  },
}));

const FileMessageCard = styled(Card)(({ theme }) => ({
  maxWidth: "70%",
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  opacity: 0.7,
  marginTop: theme.spacing(0.5),
  textAlign: "right",
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

// Component to render different message types
const RenderMessage = ({ msg, isUser }: { msg: any; isUser: boolean }) => {
  if (msg.type === "file") {
    return (
      <FileMessageCard>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "success.main" }}
            >
              File uploaded
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 2, wordBreak: "break-all" }}
          >
            {msg.text}
          </Typography>
          <CardActions sx={{ p: 0, gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => window.open(msg.text, "_blank")}
              sx={{ textTransform: "none" }}
            >
              View
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const link = document.createElement("a");
                link.href = msg.text;
                link.download = msg.text.split("/").pop() || "file";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              sx={{ textTransform: "none" }}
            >
              Download
            </Button>
          </CardActions>
        </CardContent>
      </FileMessageCard>
    );
  }

  // Default text message
  return (
    <MessageBubble isUser={isUser}>
      <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
        {msg.text}
      </Typography>
      <MessageTime>
        {new Date(msg.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </MessageTime>
    </MessageBubble>
  );
};

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
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: formMessages, isLoading } = useAgentFormMessages(formData?.id);
  const getUserId = () => loogedInUser?.tokens?.signInDetails?.loginId;
  const unreadCount = messages.filter(
    (row) => row.read == false && row.sender === "Agent"
  ).length;

  useEffect(() => {
    setUnread(unreadCount);
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
  const handleSend = async () => {
    if (input.trim() === "" || isSending) return;

    setIsSending(true);
    try {
      const { data: response } = await sendAgentFormMessage(
        formData?.id,
        input,
        getUserId(),
        formData?.updated_by,
        "text"
      );

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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
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

  // Helper function to format time
  const formatTime = (time: string) => {
    if (!time) return "";
    const now = new Date();
    const msgDate = new Date(time);
    const diff = Math.floor((now.getTime() - msgDate.getTime()) / 1000);

    if (isNaN(diff)) return time;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800)
      return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
    return msgDate.toLocaleDateString();
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ChatBubbleOutlineIcon />
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Agent Form Chat
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {formData?.updated_by || `Form ID: ${formData?.id}` || "N/A"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: "white" }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Form Info */}
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Chip
          label={`Form: ${formData?.name || "N/A"}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Messages Area */}
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 400,
          maxHeight: 500,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <EmptyState>
              <ChatBubbleOutlineIcon
                sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}
              />
              <Typography variant="h6" gutterBottom>
                No messages yet
              </Typography>
              <Typography variant="body2">
                Start the conversation with the agent!
              </Typography>
            </EmptyState>
          ) : (
            messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent:
                    msg.sender === "You" ? "flex-end" : "flex-start",
                  gap: 1,
                  mb: 1,
                }}
              >
                {msg.sender === "Agent" && (
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                  >
                    <AgentIcon fontSize="small" />
                  </Avatar>
                )}

                <RenderMessage msg={msg} isUser={msg.sender === "You"} />

                {msg.sender === "You" && (
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}

                {/* Mark as read button for agent messages */}
                {msg.sender === "Agent" && !msg.read && (
                  <Tooltip title="Mark as read">
                    <IconButton
                      size="small"
                      onClick={() => handleMarkRead(formData?.id, msg)}
                      sx={{ color: "primary.main" }}
                    >
                      <MarkEmailReadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>

      {/* Input Area */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isSending}
          inputProps={{ maxLength: 500 }}
          variant="outlined"
          size="small"
          helperText={`${input.length}/500 characters`}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
            "& .MuiFormHelperText-root": {
              textAlign: "right",
              fontSize: "0.75rem",
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={input.trim() === "" || isSending}
          startIcon={isSending ? <CircularProgress size={16} /> : <SendIcon />}
          sx={{
            minWidth: 100,
            borderRadius: 2,
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

interface AgentFormMessageDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  loogedInUser: any;
}

export default AgentFormMessageDialog;
