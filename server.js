import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Root route — Render will check this to verify your backend is live
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running successfully!");
});

// ✅ MongoDB Connection
// (You can later replace this with: process.env.MONGO_URI for security)
const uri = "mongodb+srv://priya22bce8666:Sumaammu189@cluster0.7lr0ybt.mongodb.net/?appName=Cluster0";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schema and Model
const reportSchema = new mongoose.Schema({
  email: String,
  subject: String,
  filename: String,
  similarity: Array,
});

const Report = mongoose.model("Report", reportSchema);

// ✅ API route to save report data
app.post("/api/report", async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;
    const newReport = new Report({ email, subject, filename, similarity });
    await newReport.save();
    res.status(201).json({ message: "✅ Report saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving report:", error);
    res.status(500).json({ error: "Failed to save report." });
  }
});

// ✅ API route to get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports." });
  }
});

// ✅ Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
