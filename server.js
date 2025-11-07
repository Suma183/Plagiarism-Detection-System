import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
    folder: "plagiarism_uploads", // folder in your Cloudinary account
    resource_type: "auto", // allows PDFs, images, etc.
  },
});

const upload = multer({ storage });

// ✅ Mongoose Schema
const reportSchema = new mongoose.Schema({
  email: String,
  subject: String,
  filename: String,
  similarity: [String],
  fileUrl: String, // stores uploaded Cloudinary file URL
});

const Report = mongoose.model("Report", reportSchema);

// ✅ Basic Test Route
app.get("/", (req, res) => {
  res.send("Backend is running for Plagiarism Detection System 🚀");
});

// ✅ Fetch All Reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
});

// ✅ Add Report (without file)
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
    res.json({ message: "Report added successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Error adding report", error });
  }
});

// ✅ File Upload Route (with Cloudinary)
app.post("/api/report/upload", upload.single("file"), async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
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
    res.json({ message: "File uploaded successfully", report: newReport });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
