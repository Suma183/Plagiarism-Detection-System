// Import dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Initialize the Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());

// ✅ Root route to confirm backend is live
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend is live and running successfully!");
});

// MongoDB Atlas connection string
const uri = "mongodb+srv://priya22bce8666:Sumaammu189@cluster0.7lr0ybt.mongodb.net/?appName=Cluster0";

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define schema for report data
const reportSchema = new mongoose.Schema({
  email: String,
  subject: String,
  filename: String,
  similarity: Array,
});

// Create the Report model
const Report = mongoose.model("Report", reportSchema);

// ✅ API route to save report data
app.post("/api/report", async (req, res) => {
  try {
    const { email, subject, filename, similarity } = req.body;
    const newReport = new Report({ email, subject, filename, similarity });
    await newReport.save();
    res.status(201).json({ message: "Report saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ API route to get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server port setup for Render
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
