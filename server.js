import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ✅ Ensure all /api responses are JSON
app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// 🧠 Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static frontend from /public folder
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for root requests
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Storage (Uploads directly to Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "plagiarism_uploads", // folder name in Cloudinary
    resource_type: "auto", // allows PDF, DOCX, images, etc.
  },
});

const upload = multer({ storage });

// ✅ Mongoose Schema and Model
const reportSchema = new mongoose.Schema({
  email: String,
  subject: String,
  filename: String,
  similarity: [String],
  fileUrl: String, // stores Cloudinary file URL
});

const Report = mongoose.model("Report", reportSchema);

// ✅ Health Check Route
app.get("/check-folder", (req, res) => {
  res.send(`📂 Server is running from folder: ${__dirname}`);
});

// ✅ Fetch All Reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    res.status(500).json({ message: "Error fetching reports", error });
  }
});

// ✅ Add Report (without file upload)
app.post("/api/report", async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;
    const report = new Report({
      email,
      subject,
      filename,
      similarity: similarity ? similarity.split(",") : [],
    });
    await report.save();
    res.json({ message: "✅ Report added successfully", report });
  } catch (error) {
    console.error("❌ Error adding report:", error);
    res.status(500).json({ message: "Error adding report", error });
  }
});

// ✅ File Upload Route (with Cloudinary)
app.post("/api/report/upload", upload.single("file"), async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = req.file.path; // Cloudinary file URL

    const newReport = new Report({
      email,
      subject,
      filename,
      similarity: similarity ? similarity.split(",") : [],
      fileUrl,
    });

    await newReport.save();

    res.json({
      success: true,
      message: "✅ File uploaded and saved successfully",
      report: newReport,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
});

// ✅ Catch-All Route for Frontend (important for Netlify/Render)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
