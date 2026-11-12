import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { queueEngine } from '../services/queueEngine';
import { Feedback } from '../types/queue';

interface FeedbackViewProps {
  initialToken?: string;
  onNavigateToKiosk?: () => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  initialToken,
  onNavigateToKiosk,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken || 'D-100');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Eligible served tokens for demo convenience
  const servedEntries = queueEngine
    .getAllEntries()
    .filter((e) => e.status === 'SERVED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) {
      setError('Please provide a valid token number.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please choose a star rating from 1 to 5.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fb = queueEngine.submitFeedback(cleanToken, rating, comment);
      setSubmittedFeedback(fb);
    } catch (err: any) {
      setError(err.message || 'Unable to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Customer Service Feedback
        </h1>
        <p className="text-xs text-slate-500">
          Route: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">/feedback/{'{tokenNumber}'}</code> · Share your counter experience to help us improve service speed.
        </p>
      </div>

      {submittedFeedback ? (
        /* Confirmation screen */
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Thank You for Your Feedback!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your review for ticket <strong className="font-mono text-indigo-600">{submittedFeedback.tokenNumber}</strong> ({submittedFeedback.serviceTypeName}) has been recorded into the administrative quality metrics.
          </p>

          <div className="inline-flex items-center gap-1 py-1.5 px-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-xs font-semibold text-amber-800">Your Rating:</span>
            <div className="flex gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= submittedFeedback.rating ? 'fill-current' : 'text-slate-300'}`}
                />
              ))}
            </div>
          </div>

          {submittedFeedback.comment && (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200 text-left">
              "{submittedFeedback.comment}"
            </p>
          )}

          <div className="pt-4 flex justify-center gap-3">
            {onNavigateToKiosk && (
              <button
                onClick={onNavigateToKiosk}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Join Another Queue
              </button>
            )}
            <button
              onClick={() => {
                setSubmittedFeedback(null);
                setComment('');
                setTokenInput('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Submit Another Review
            </button>
          </div>
        </div>
      ) : (
        /* Feedback submission form */
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Review Submission: </span>
                  {error}
                </div>
              </div>
            )}

            {/* Token Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Token Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. D-100, F-100"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm uppercase font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
              <p className="text-2xs text-slate-500 mt-1">
                Feedback can only be submitted for completed (SERVED) tickets.
              </p>
            </div>

            {/* Quick Served Tokens Chips */}
            {servedEntries.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  Select Completed Token to Review:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {servedEntries.map((e) => (
                    <button
                      type="button"
                      key={e.tokenNumber}
                      onClick={() => {
                        setTokenInput(e.tokenNumber);
                        setError(null);
                      }}
                      className="font-mono text-xs px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded text-slate-700 hover:text-indigo-700 transition-colors"
                    >
                      {e.tokenNumber} ({e.customerName})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1-5 Star Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Your Rating (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          isActive
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs font-semibold text-slate-700">
                  {rating === 5 && '5 - Excellent'}
                  {rating === 4 && '4 - Very Good'}
                  {rating === 3 && '3 - Average'}
                  {rating === 2 && '2 - Poor'}
                  {rating === 1 && '1 - Terrible'}
                </span>
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Comments or Suggestions (Optional)
                </label>
                <span className="text-2xs text-slate-400">
                  {comment.length} / 500 characters
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Share how quickly you were served or suggestions for the counter..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Customer Feedback'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
