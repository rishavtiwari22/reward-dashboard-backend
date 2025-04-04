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

// ✅ Load Google credentials from environment variables
const googleCredentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
};

// ✅ Initialize GoogleAuth with credentials from environment variables
const auth = new google.auth.GoogleAuth({
  credentials: googleCredentials,
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