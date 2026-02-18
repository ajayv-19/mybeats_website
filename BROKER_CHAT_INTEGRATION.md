# Broker Chat/Message Integration Guide

## Overview

The carrier portal includes a messaging/chat feature that allows communication between carriers and agents regarding specific application forms. This document outlines how the broker website can integrate with this messaging system.

---

## Message System Architecture

- **Database Table:** `Agent_Messages`
- **Message Storage:** Messages are stored as JSON objects in the `message` column
- **Participants:** Messages have `sender_id` and `receiver_id` (email addresses)
- **Message Types:** Text messages or file uploads (documents)

---

## API Endpoints

### Base URL

Use the `carrierApiBase` parameter passed in the iframe URL (same as form data API).

### 1. Get Messages for a Form

**Endpoint:** `GET {carrierApiBase}/agentform/{formId}/getMessages`

**Description:** Retrieves all messages for a specific form.

**Parameters:**

- `formId` (path parameter): The form ID

**Response:**

```json
{
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": 123,
      "form_id": 530,
      "sender_id": "firebeatsapp@gmail.com",
      "receiver_id": "av3855@nyu.edu",
      "message": {
        "message": "Hello, I need your certificate",
        "type": "text"
      },
      "read": false,
      "created_at": "2026-02-18T14:27:15.990Z",
      "updated_at": "2026-02-18T14:27:15.990Z"
    },
    {
      "id": 124,
      "form_id": 530,
      "sender_id": "av3855@nyu.edu",
      "receiver_id": "firebeatsapp@gmail.com",
      "message": {
        "message": "https://brokerassets2.s3.us-east-1.amazonaws.com/uploads/1759473042837-certificate.pdf",
        "type": "file"
      },
      "read": true,
      "created_at": "2026-02-18T14:30:22.123Z",
      "updated_at": "2026-02-18T14:30:22.123Z"
    }
  ]
}
```

**Message Format:**

- The `message` field is a JSON object (not a string)
- For text messages: `{"message": "text content", "type": "text"}`
- For file uploads: `{"message": "https://...", "type": "file"}`

---

### 2. Send a Text Message

**Endpoint:** `POST {carrierApiBase}/agentform/{formId}/sendMessage`

**Description:** Sends a text message for a form.

**Request Body:**

```json
{
  "message": "Hello, I need your certificate",
  "type": "text",
  "sender_id": "agent@example.com",
  "receiver_id": "carrier@example.com"
}
```

**Parameters:**

- `formId` (path parameter): The form ID
- `message` (body): The message text content
- `type` (body): Message type - "text" for text messages
- `sender_id` (body): Email address of the sender
- `receiver_id` (body): Email address of the receiver

**Response:**

```json
{
  "message": "Message sent successfully",
  "data": {
    "id": 125,
    "form_id": 530,
    "sender_id": "agent@example.com",
    "receiver_id": "carrier@example.com",
    "message": {
      "message": "Hello, I need your certificate",
      "type": "text"
    },
    "read": false,
    "created_at": "2026-02-18T14:35:10.456Z",
    "updated_at": "2026-02-18T14:35:10.456Z"
  }
}
```

---

### 3. Upload a Document and Create Message

**Endpoint:** `POST {carrierApiBase}/agentform/{formId}/uploadDocument`

**Description:** Uploads a document file and creates a message with the file URL.

**Request Format:** `multipart/form-data`

**Form Fields:**

- `file`: The document file (PDF, Word, Excel, Images, Text files)
- `sender_id`: Email address of the sender
- `receiver_id`: Email address of the receiver

**File Requirements:**

- **Allowed Types:** PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Images (JPEG, PNG, GIF), Text files
- **Max Size:** 50 MB
- **Storage:** Files are uploaded to S3 bucket `brokerassets2` and stored at `uploads/{timestamp}-{filename}`

**Response:**

```json
{
  "message": "Document uploaded and message created successfully",
  "data": {
    "id": 126,
    "form_id": 530,
    "sender_id": "agent@example.com",
    "receiver_id": "carrier@example.com",
    "message": {
      "message": "https://brokerassets2.s3.us-east-1.amazonaws.com/uploads/1759473042837-certificate.pdf",
      "type": "file"
    },
    "read": false,
    "created_at": "2026-02-18T14:40:15.789Z",
    "updated_at": "2026-02-18T14:40:15.789Z",
    "fileUrl": "https://brokerassets2.s3.us-east-1.amazonaws.com/uploads/1759473042837-certificate.pdf",
    "fileName": "certificate.pdf"
  }
}
```

---

### 4. Mark Messages as Read

**Endpoint:** `POST {carrierApiBase}/agentform/{formId}/markAsRead`

**Description:** Marks one or more messages as read.

**Request Body:**

```json
{
  "msgIds": "123,124,125"
}
```

**Parameters:**

- `formId` (path parameter): The form ID
- `msgIds` (body): Comma-separated string of message IDs to mark as read

**Response:**

```json
{
  "message": "Messages marked as read successfully",
  "data": {
    "updated": 3
  }
}
```

---

## Implementation Requirements

### 1. Sender and Receiver Logic

- **Sender ID:** Use the logged-in user's email address
- **Receiver ID:** Use the carrier's email address (typically `formData.updated_by` or the form owner)
- Both IDs are stored as VARCHAR (email addresses), not integers

### 2. Message Display

- Filter messages where the current user is either `sender_id` or `receiver_id`
- Display messages in chronological order (oldest first)
- Show sender name based on whether `sender_id` matches current user:
  - If `sender_id === currentUser` → Show as "You"
  - Otherwise → Show as "Agent" or "Carrier"

### 3. Message Type Handling

- **Text Messages:** Display the message text directly
- **File Messages:**
  - Display as a clickable link or download button
  - Show file name if available
  - Open/download the file from the S3 URL

### 4. Message Parsing

The `message` field in the API response is a JSON object. Handle it as follows:

```javascript
// Example JavaScript/TypeScript
let msgObj;
if (typeof message.message === "string") {
  // If it's a string, parse it
  msgObj = JSON.parse(message.message);
} else if (typeof message.message === "object") {
  // If it's already an object, use it directly
  msgObj = message.message;
}

// Access message content
const messageText = msgObj.message; // "Hello" or "https://..."
const messageType = msgObj.type; // "text" or "file"
```

### 5. Real-time Updates (Optional)

- Poll the `getMessages` endpoint periodically (e.g., every 5-10 seconds) to check for new messages
- Or implement WebSocket/Server-Sent Events if real-time updates are required

---

## Example Implementation Flow

### Sending a Text Message:

1. User types message in input field
2. Call `POST /agentform/{formId}/sendMessage` with:
   - `message`: User's input text
   - `type`: "text"
   - `sender_id`: Current user's email
   - `receiver_id`: Recipient's email
3. On success, add message to local state and refresh message list
4. Display success notification

### Uploading a Document:

1. User selects a file
2. Create FormData with:
   - `file`: Selected file
   - `sender_id`: Current user's email
   - `receiver_id`: Recipient's email
3. Call `POST /agentform/{formId}/uploadDocument` with FormData
4. On success, add message to local state with file URL
5. Display file as clickable link/download button

### Displaying Messages:

1. On page load, call `GET /agentform/{formId}/getMessages`
2. Filter messages where user is sender or receiver
3. Parse each message's `message` field (JSON object)
4. Display text messages directly
5. Display file messages as links/buttons
6. Show read/unread status
7. Allow marking messages as read when viewed

---

## Authentication

- These endpoints require authentication when called from the carrier portal
- When called from broker forms embedded in iframes, authentication may be bypassed for read operations
- For write operations (sendMessage, uploadDocument), ensure proper authentication is in place

---

## Error Handling

- Handle 400 errors (validation errors) gracefully
- Handle 404 errors (form not found)
- Handle 500 errors (server errors) with user-friendly messages
- Display error messages to users when API calls fail

---

## Testing

Test the following scenarios:

1. Send text message successfully
2. Upload document successfully
3. Retrieve messages for a form
4. Mark messages as read
5. Handle errors gracefully
6. Display messages correctly (text vs file)
7. Filter messages correctly (show only relevant messages)

---

## Notes

- Message IDs are auto-incrementing integers
- Messages are associated with forms via `form_id`
- The `read` field defaults to `false` for new messages
- Timestamps (`created_at`, `updated_at`) are automatically managed
- File URLs are publicly accessible S3 URLs
