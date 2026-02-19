import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { useFormAttachments } from "../apis/AgentFormsapis";

interface FormAttachmentsProps {
  formId: number;
}

export default function FormAttachments({ formId }: FormAttachmentsProps) {
  const { data: attachmentsData, isLoading, error } = useFormAttachments(formId);

  // Debug logging
  console.log("[FormAttachments] formId:", formId);
  console.log("[FormAttachments] attachmentsData:", attachmentsData);
  console.log("[FormAttachments] isLoading:", isLoading);
  console.log("[FormAttachments] error:", error);

  const attachments = attachmentsData?.data || [];
  
  console.log("[FormAttachments] attachments array:", attachments);
  console.log("[FormAttachments] attachments length:", attachments.length);
  console.log("[FormAttachments] attachmentsData structure:", JSON.stringify(attachmentsData, null, 2));
  
  // Additional check: if attachmentsData exists but data is not an array, log it
  if (attachmentsData && !Array.isArray(attachmentsData.data)) {
    console.warn("[FormAttachments] attachmentsData.data is not an array:", attachmentsData.data);
  }

  const getFileIcon = (link: string) => {
    const extension = link.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      return <PdfIcon color="error" />;
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
      return <ImageIcon color="primary" />;
    }
    return <DescriptionIcon color="action" />;
  };

  const getFileName = (link: string) => {
    try {
      // Decode URL-encoded strings (e.g., %2F -> /)
      const decodedLink = decodeURIComponent(link);
      const urlParts = decodedLink.split("/");
      const fileName = urlParts[urlParts.length - 1];
      // Remove timestamp prefix if present (format: timestamp-filename)
      const parts = fileName.split("-");
      if (parts.length > 1 && /^\d+$/.test(parts[0])) {
        return parts.slice(1).join("-");
      }
      return fileName;
    } catch {
      return link;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error" variant="body2">
          Failed to load attachments
        </Typography>
      </Box>
    );
  }

  // Show "no attachments" only after data has loaded and there are truly no attachments
  if (!isLoading && !error && attachments.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          No attachments uploaded for this form.
        </Typography>
      </Box>
    );
  }
  
  // Don't render anything if still loading or if there's an error (error is handled above)
  if (isLoading || error) {
    return null;
  }

  // Ensure we have valid attachments before rendering
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Supporting Documents ({attachments.length})
      </Typography>
      <List>
        {attachments.map((attachment) => {
          // Validate attachment has required fields
          if (!attachment || !attachment.link) {
            console.warn("[FormAttachments] Invalid attachment:", attachment);
            return null;
          }

          // Decode URL-encoded link if needed
          let decodedLink: string;
          try {
            decodedLink = attachment.link ? decodeURIComponent(attachment.link) : attachment.link;
          } catch (e) {
            console.warn("[FormAttachments] Failed to decode link:", attachment.link, e);
            decodedLink = attachment.link;
          }
          
          const fileName = getFileName(decodedLink);
          
          return (
            <ListItem
              key={attachment.id || `attachment-${decodedLink}`}
              sx={{
                borderBottom: "1px solid #e0e0e0",
                "&:last-child": { borderBottom: "none" },
              }}
            >
              <ListItemIcon>{getFileIcon(decodedLink)}</ListItemIcon>
              <ListItemText
                primary={
                  <Link
                    href={decodedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {fileName}
                  </Link>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Uploaded: {attachment.created_at ? new Date(attachment.created_at).toLocaleDateString() : "Unknown date"}
                  </Typography>
                }
              />
              <ListItemIcon>
                <Link
                  href={decodedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  sx={{ color: "text.secondary" }}
                >
                  <DownloadIcon />
                </Link>
              </ListItemIcon>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
