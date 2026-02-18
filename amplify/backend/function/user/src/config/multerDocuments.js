const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./configaws");

// Multer configuration for document uploads (PDFs, Word docs, etc.)
const uploadDocuments = multer({
  storage: multerS3({
    s3: s3,
    bucket: "brokerassets2", // Based on the S3 URL pattern seen in the database
    acl: "public-read", // Make files publicly accessible
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // Generate unique filename: timestamp-originalname
      const timestamp = Date.now();
      cb(null, `uploads/${timestamp}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit for documents
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: PDF, Word, Excel, Images, Text`), false);
    }
  },
});

module.exports = uploadDocuments;
