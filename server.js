// ✅ Import required modules
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Get current directory info (important for Render debugging)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("🗂️ Server running from directory:", __dirname);

// ✅ Initialize Express app
const app = express();

// ✅ Middleware setup
app.use(cors());
app.use(express.json());

// ✅ Root route (Render will hit this by default)
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running successfully!");
});

// ✅ Folder check route for Render debugging
app.get("/check-folder", (req, res) => {
  res.send(`🗂️ Server is running from folder: ${process.cwd()}`);
});

// ✅ MongoDB connection URI
const uri = "mongodb+srv://priya22bce8666:Sumaammu189@cluster0.7lr0ybt.mongodb.net/?retryWrites=true&w=majority";

// ✅ Connect to MongoDB Atlas
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Define Schema
const reportSchema = new mongoose.Schema({
  email: String,
  subject: String,
  filename: String,
  similarity: Array,
});

// ✅ Model
const Report = mongoose.model("Report", reportSchema);

// ✅ POST route to save report
app.post("/api/report", async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;
    const newReport = new Report({ email, subject, filename, similarity });
    await newReport.save();
    res.status(201).json({ message: "Report saved successfully!" });
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET route to retrieve reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error("Error retrieving reports:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Use Render/Cloud Port
const PORT = process.env.PORT || 5000;

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
