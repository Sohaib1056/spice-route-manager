import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists with better error handling
const uploadDir = path.join(__dirname, "../../uploads");
try {
  if (!fs.existsSync(uploadDir)) {
    console.log(`Creating upload directory at: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.error("⚠️  Warning: Could not create upload directory:", error);
  // Don't crash, maybe we can use /tmp or it already exists but fs.existsSync failed
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});
