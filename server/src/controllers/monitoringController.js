const ExamAttempt = require('../models/ExamAttempt');

// GET /api/monitoring/active — polled by the admin Live Monitoring page.
exports.getActiveAttempts = async (req, res) => {
  const attempts = await ExamAttempt.find({ status: 'in_progress' })
    .populate('student', 'name email')
    .populate('exam', 'title durationMinutes')
    .sort({ lastActivityAt: -1 });

  const now = Date.now();
  const payload = attempts.map((a) => {
    const elapsedSeconds = a.startedAt ? Math.floor((now - a.startedAt.getTime()) / 1000) : 0;
    const remainingSeconds = Math.max(a.durationMinutes * 60 - elapsedSeconds, 0);
    const answered = a.answers.filter((ans) => ans.selectedOptionId).length;
    return {
      attemptId: a._id,
      student: a.student?.name,
      studentEmail: a.student?.email,
      exam: a.exam?.title,
      remainingSeconds,
      cameraActive: a.camera?.active,
      faceDetected: a.camera?.faceDetected,
      violationCount: a.violationCount,
      riskLevel: a.riskLevel,
      answered,
      total: a.answers.length,
      lastActivityAt: a.lastActivityAt
    };
  });

  res.json({ success: true, activeAttempts: payload });
};
