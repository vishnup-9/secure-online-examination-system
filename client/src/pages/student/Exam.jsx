import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, ChevronRight, Flag, Eraser, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import ConfirmDialog from '../../components/ConfirmDialog';
import WebcamMonitor from '../../components/WebcamMonitor';
import useTimer from '../../hooks/useTimer';
import useProctoring from '../../hooks/useProctoring';

export default function StudentExam() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> { selectedOptionId, markedForReview }
  const [current, setCurrent] = useState(0);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const saveTimeoutRef = useRef({});

  const submitExam = useCallback(async (reason = 'manual') => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/attempts/${attempt.id}/submit`, { reason });
      toast.success('Exam submitted successfully');
      navigate('/student/results');
    } catch (err) {
      toast.error('Submission failed, please retry');
      setSubmitting(false);
    }
  }, [attempt, navigate]);

  const proctoring = useProctoring({
    attemptId: attempt?.id,
    security: attempt?.security,
    onCritical: () => toast.error('High risk detected. One more violation may auto-submit your exam.', { icon: '⚠️' }),
    onFlagged: () => { toast.error('Exam auto-submitted due to repeated violations.'); submitExam('flagged'); }
  });

  useEffect(() => {
    async function start() {
      try {
        const res = await api.post('/attempts/start', { examId });
        setAttempt(res.data.attempt);
        const initial = {};
        res.data.attempt.answers.forEach((a) => { initial[a.questionId] = { selectedOptionId: a.selectedOptionId, markedForReview: a.markedForReview }; });
        setAnswers(initial);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not start exam');
        navigate('/student/dashboard');
      }
    }
    start();
  }, [examId, navigate]);

  useEffect(() => {
    if (attempt) proctoring.startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.id]);

  const timer = useTimer(attempt?.remainingSeconds ?? 0, useCallback(() => {
    toast('Time is up! Auto-submitting...', { icon: '⏰' });
    submitExam('auto');
  }, [submitExam]));

  const debouncedSave = useCallback((questionId, payload) => {
    clearTimeout(saveTimeoutRef.current[questionId]);
    saveTimeoutRef.current[questionId] = setTimeout(() => {
      api.patch(`/attempts/${attempt.id}/answer`, { questionId, ...payload }).catch(() => {});
    }, 400);
  }, [attempt]);

  if (!attempt) return <Loader label="Preparing your secure exam session..." />;

  const question = attempt.questions[current];
  const qAnswer = answers[question.id] || {};

  const selectOption = (optionId) => {
    setAnswers((prev) => ({ ...prev, [question.id]: { ...prev[question.id], selectedOptionId: optionId } }));
    debouncedSave(question.id, { selectedOptionId: optionId });
  };

  const clearAnswer = () => {
    setAnswers((prev) => ({ ...prev, [question.id]: { ...prev[question.id], selectedOptionId: null } }));
    debouncedSave(question.id, { selectedOptionId: null });
  };

  const toggleReview = () => {
    const val = !qAnswer.markedForReview;
    setAnswers((prev) => ({ ...prev, [question.id]: { ...prev[question.id], markedForReview: val } }));
    debouncedSave(question.id, { markedForReview: val });
  };

  const goTo = (idx) => setCurrent(Math.max(0, Math.min(attempt.questions.length - 1, idx)));

  const statusFor = (q) => {
    const a = answers[q.id] || {};
    if (a.markedForReview) return 'review';
    if (a.selectedOptionId) return 'answered';
    return 'unanswered';
  };

  const answeredCount = attempt.questions.filter((q) => (answers[q.id] || {}).selectedOptionId).length;
  const reviewCount = attempt.questions.filter((q) => (answers[q.id] || {}).markedForReview).length;

  return (
    <div className="min-h-screen bg-surface-muted select-none" onCopy={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()}>
      <header className="bg-ink-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-brand-400" />
          <span className="font-semibold text-sm">{attempt.examTitle}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className={`flex items-center gap-1.5 ${proctoring.riskLevel === 'LOW' ? 'text-green-400' : proctoring.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>
            <AlertTriangle size={13} /> Risk: {proctoring.riskLevel} · Violations: {proctoring.violationCount}
          </span>
          <span className="font-mono text-base font-bold bg-white/10 rounded-lg px-3 py-1">{timer.formatted}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-ink-500">Question {current + 1} of {attempt.questions.length}</span>
              <span className="text-xs text-ink-400">{question.marks} mark{question.marks !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-base font-medium text-ink-900 mb-5">{question.text}</p>
            <div className="space-y-2.5">
              {question.options.map((opt) => (
                <label key={opt.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                  qAnswer.selectedOptionId === opt.id ? 'border-brand-500 bg-brand-50' : 'border-surface-border hover:bg-surface-muted'
                }`}>
                  <input type="radio" name="option" className="accent-brand-600" checked={qAnswer.selectedOptionId === opt.id} onChange={() => selectOption(opt.id)} />
                  <span className="text-sm text-ink-900">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => goTo(current - 1)} disabled={current === 0}><ChevronLeft size={16} /> Previous</button>
              <button className="btn-secondary" onClick={clearAnswer}><Eraser size={16} /> Clear</button>
              <button className="btn-secondary" onClick={toggleReview}><Flag size={16} /> {qAnswer.markedForReview ? 'Unmark' : 'Mark for Review'}</button>
            </div>
            <div className="flex gap-2">
              {current < attempt.questions.length - 1 ? (
                <button className="btn-primary" onClick={() => goTo(current + 1)}>Save & Next <ChevronRight size={16} /></button>
              ) : (
                <button className="btn-primary" onClick={() => setSubmitDialog(true)}><Send size={16} /> Submit Exam</button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <WebcamMonitor videoRef={proctoring.videoRef} cameraActive={proctoring.cameraActive} faceStatus={proctoring.faceStatus} />

          <div className="card p-4">
            <p className="text-xs font-semibold text-ink-500 mb-3">Progress: {answeredCount}/{attempt.questions.length} answered · {reviewCount} for review</p>
            <div className="grid grid-cols-5 gap-2">
              {attempt.questions.map((q, idx) => {
                const st = statusFor(q);
                const styles = {
                  answered: 'bg-green-600 text-white',
                  review: 'bg-amber-500 text-white',
                  unanswered: 'bg-surface-muted text-ink-500 border border-surface-border'
                };
                return (
                  <button key={q.id} onClick={() => goTo(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold ${styles[st]} ${idx === current ? 'ring-2 ring-brand-500 ring-offset-1' : ''}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-600" /> Answered</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Marked for review</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-surface-muted border border-surface-border" /> Unanswered</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={submitDialog}
        title="Submit exam?"
        description={`You have answered ${answeredCount} of ${attempt.questions.length} questions. This action cannot be undone.`}
        confirmLabel={submitting ? 'Submitting...' : 'Submit Exam'}
        danger={false}
        onCancel={() => setSubmitDialog(false)}
        onConfirm={() => { setSubmitDialog(false); submitExam('manual'); }}
      />
    </div>
  );
}
