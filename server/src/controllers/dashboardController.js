const User = require('../models/User');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');

exports.getAdminStats = async (req, res) => {
  const now = new Date();

  const [totalStudents, totalExams, activeExams, completedAttempts, allAttempts, suspiciousAttempts, recent] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Exam.countDocuments(),
      Exam.countDocuments({ isPublished: true, startTime: { $lte: now }, endTime: { $gte: now } }),
      ExamAttempt.countDocuments({ status: { $in: ['submitted', 'auto_submitted'] } }),
      ExamAttempt.find({ status: { $in: ['submitted', 'auto_submitted'] } }).select('result'),
      ExamAttempt.countDocuments({ riskLevel: { $in: ['HIGH', 'CRITICAL'] } }),
      ExamAttempt.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('student', 'name email')
        .populate('exam', 'title')
    ]);

  const scores = allAttempts.map((a) => a.result?.percentage).filter((p) => typeof p === 'number');
  const averageScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const passCount = allAttempts.filter((a) => a.result?.passed).length;
  const passPercentage = completedAttempts ? (passCount / completedAttempts) * 100 : 0;

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalExams,
      activeExams,
      completedExams: completedAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passPercentage: Math.round(passPercentage * 100) / 100,
      suspiciousAttempts
    },
    recentActivity: recent.map((a) => ({
      id: a._id,
      student: a.student?.name,
      exam: a.exam?.title,
      status: a.status,
      riskLevel: a.riskLevel,
      updatedAt: a.updatedAt
    }))
  });
};

exports.getStudentStats = async (req, res) => {
  const now = new Date();
  const [upcoming, completed, results] = await Promise.all([
    Exam.countDocuments({ isPublished: true, startTime: { $gt: now } }),
    ExamAttempt.countDocuments({ student: req.user._id, status: { $in: ['submitted', 'auto_submitted'] } }),
    ExamAttempt.find({ student: req.user._id, status: { $in: ['submitted', 'auto_submitted'] } }).select('result')
  ]);
  const avg = results.length
    ? results.reduce((s, r) => s + (r.result?.percentage || 0), 0) / results.length
    : 0;

  res.json({
    success: true,
    stats: { upcomingExams: upcoming, completedExams: completed, averageScore: Math.round(avg * 100) / 100 }
  });
};
