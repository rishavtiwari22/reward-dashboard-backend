const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  houseName: { type: String, required: true },
  campusName: { type: String, required: true },
  additionalEffort: { type: Number, default: 0 },
  supportingPeersAcademics: { type: Number, default: 0 },
  supportingSmallerGroup: { type: Number, default: 0 },
  supportLargeGroup: { type: Number, default: 0 },
  totalAcademicPoints: { type: Number, default: 0 },
  additionalEffortsLifeSkills: { type: Number, default: 0 },
  supportingPeersLifeSkills: { type: Number, default: 0 },
  supportingCommunityLifeSkills: { type: Number, default: 0 },
  effortsToLearnEnglish: { type: Number, default: 0 },
  competitionWinners: { type: Number, default: 0 },
  councilActiveness: { type: Number, default: 0 },
  solvingProblem: { type: Number, default: 0 },
  taskWinners: { type: Number, default: 0 },
  gettingAJob: { type: Number, default: 0 },
  totalCulturePoints: { type: Number, default: 0 },  // 🆕 New Field
  totalAcademicAndCulture: { type: Number, default: 0 } // 🆕 New Field
}, { timestamps: true });

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;
