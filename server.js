import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
mongoose
  .connect(
    "mongodb+srv://priya22bce8666:Suma12345@cluster0.7lr0ybt.mongodb.net/plagiarism?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Define Schema
const reportSchema = new mongoose.Schema({
  email: String,
  subject: String,
  filename: String,
  fileUrl: String,
  similarity: [String],
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

// ✅ Create uploads folder if not exists
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/*                            ✅ API ROUTES BELOW                             */
/* -------------------------------------------------------------------------- */

// ✅ Upload report with file
app.post("/api/report/upload", upload.single("file"), async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const newReport = new Report({
      email,
      subject,
      filename,
      fileUrl: `/uploads/${req.file.filename}`,
      similarity: similarity ? similarity.split(",") : [],
    });

    await newReport.save();
    res.json({ message: "✅ File uploaded successfully!", report: newReport });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error while uploading." });
  }
});

// ✅ Save report without file
app.post("/api/report", async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;

    const newReport = new Report({
      email,
      subject,
      filename,
      similarity: similarity ? similarity.split(",") : [],
    });

    await newReport.save();
    res.json({ message: "✅ Report saved successfully!", report: newReport });
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ message: "Server error while saving report." });
  }
});

// ✅ Get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
});

// ✅ Serve uploaded files
app.use("/uploads", express.static("uploads"));

/* -------------------------------------------------------------------------- */
/*                        ✅ ROOT ROUTE (KEEP LAST)                           */
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) =>
  res.send("✅ Backend is live and running successfully!")
);

/* -------------------------------------------------------------------------- */
/*                           ✅ START THE SERVER                              */
/* -------------------------------------------------------------------------- */
const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`🚀 Server running successfully on port ${port}`)
);
