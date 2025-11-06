import express from "express";
import mongoose from "mongoose";
import cors from "cors";

app.get('/', (req, res) => {
  res.send('Backend is live and running successfully!');
});

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Atlas Connection
const uri = "mongodb+srv://priya22bce8666:Sumaammu189@cluster0.7lr0ybt.mongodb.net/?appName=Cluster0"

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ DB connection error:", err));

// Schema (structure) for storing report data
const reportSchema = new mongoose.Schema({
  email: String,
  subject: String,
  filename: String,
  similarity: Array
});

const Report = mongoose.model("Report", reportSchema);

// Route to save report data
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

// Route to get all reports
app.get("/api/reports", async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
