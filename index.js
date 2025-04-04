const express = require("express");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const Student = require("./Student"); // ✅ Import Student Model

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); // ✅ Enable CORS

// ✅ Decode GOOGLE_CREDENTIALS from .env and write to a temporary file
const keyFilePath = "./credentials.json";
if (!process.env.GOOGLE_CREDENTIALS) {
  console.error("❌ Missing GOOGLE_CREDENTIALS environment variable.");
  process.exit(1);
}
fs.writeFileSync(keyFilePath, Buffer.from(process.env.GOOGLE_CREDENTIALS, "base64"));

// ✅ Initialize GoogleAuth with the temporary credentials file
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// ✅ Fetch & Store Data from Google Sheet to MongoDB
app.post("/fetch-sheet-data", async (req, res) => {
  try {
    const { sheetUrl, sheetName } = req.body;

    if (!sheetUrl || !sheetName) {
      return res.status(400).json({ error: "Sheet URL and Sheet Name are required" });
    }

    // Extract Spreadsheet ID
    const match = sheetUrl.match(/\/d\/(.*?)\//);
    if (!match) {
      return res.status(400).json({ error: "Invalid Google Sheet URL" });
    }
    const spreadsheetId = match[1];

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ Use sheetName from frontend request
    const range = `${sheetName}`;

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      return res.status(404).json({ error: "No data found in Google Sheet" });
    }

    const dataRows = rows.slice(1);

    const students = dataRows
      .map((row) => ({
        studentName: row[0]?.trim() || null,
        houseName: row[1]?.trim() || null,
        campusName: row[2]?.trim() || null,
        additionalEffort: parseInt(row[3]) || 0,
        supportingPeersAcademics: parseInt(row[4]) || 0,
        supportingSmallerGroup: parseInt(row[5]) || 0,
        supportLargeGroup: parseInt(row[6]) || 0,
        totalAcademicPoints: parseInt(row[7]) || 0,
        additionalEffortsLifeSkills: parseInt(row[8]) || 0,
        supportingPeersLifeSkills: parseInt(row[9]) || 0,
        supportingCommunityLifeSkills: parseInt(row[10]) || 0,
        effortsToLearnEnglish: parseInt(row[11]) || 0,
        competitionWinners: parseInt(row[12]) || 0,
        councilActiveness: parseInt(row[13]) || 0,
        solvingProblem: parseInt(row[14]) || 0,
        taskWinners: parseInt(row[15]) || 0,
        gettingAJob: parseInt(row[16]) || 0,
        totalCulturePoints: parseInt(row[17]) || 0,
        totalAcademicAndCulture: parseInt(row[18]) || 0,
      }))
      .filter(student => student.studentName && student.houseName && student.campusName);

    if (students.length === 0) {
      return res.status(400).json({ error: "No valid student data found" });
    }

    await Student.insertMany(students);
    return res.status(200).json({ message: "Data successfully saved to MongoDB" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ GET API to Retrieve Student Data from MongoDB
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch student data" });
  }
});

// ✅ Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

  
app.get("/", (req, res) => {
  res.send("Api is working!");
});