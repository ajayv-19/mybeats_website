const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./configaws");

const uploadDocuments = multer({
  storage: multerS3({
    s3: s3,
    bucket: "insurancedashboardprofileimages", // Using same bucket, can be changed if needed
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // Store documents in a documents folder
      cb(null, `documents/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit for documents
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedMimeTypes = [
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
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: PDF, Word, Excel, images, and text files.`), false);
    }
  },
});

module.exports = uploadDocuments;
