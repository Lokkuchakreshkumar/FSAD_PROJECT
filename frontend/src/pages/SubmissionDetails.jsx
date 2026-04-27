import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronLeft, Star, MessageSquare, Send, User, Quote, Paperclip, FileText, Download } from 'lucide-react';

const SubmissionDetails = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [score, setScore] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubmissionAndReviews();
  }, [submissionId]);

  const fetchSubmissionAndReviews = async () => {
    try {
      const [subRes, reviewRes] = await Promise.all([
        api.get(`/api/submissions/${submissionId}`),
        api.get(`/api/reviews/submission/${submissionId}`)
      ]);
      setSubmission(subRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      console.error('FAILED to fetch submission details:', err);
      if (err.response) {
         console.error('Response data:', err.response.data);
         console.error('Response status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/reviews', {
        submissionId: parseInt(submissionId),
        comment,
        rating: score
      });
      setComment('');
      setScore(5);
      fetchSubmissionAndReviews();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add review';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center font-grotesk text-2xl font-bold animate-pulse">
      Retrieving Peer Feedback...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-grotesk pb-32">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 mb-12 transition-all group font-bold uppercase tracking-widest text-sm"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Go Back</span>
        </button>

        {}
        <div className="glass-card rounded-[3rem] p-12 mb-16 border-2 border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <Quote className="absolute top-10 right-12 w-24 h-24 text-indigo-500/5" />
          <div className="flex items-center space-x-3 mb-8">
            <span className="px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100">
              Submission #{submissionId}
            </span>
          </div>
          <p className="text-3xl text-slate-900 leading-tight font-black italic tracking-tight mb-10">
            "{submission?.content || 'Innovative approach to peer review systems with focus on modern aesthetic.'}"
          </p>

          {submission?.fileName && (
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 group-hover:border-indigo-100 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Attached Document</p>
                  <p className="text-lg font-bold text-slate-900">{submission.fileName}</p>
                </div>
              </div>
              <a 
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${submission.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold border-2 border-indigo-50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
              >
                <Download className="w-5 h-5" />
                <span>Open File</span>
              </a>
            </div>
          )}
        </div>

        {}
        <div className="mb-20">
          <div className="flex items-center space-x-4 mb-10">
             <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
             <h3 className="text-4xl font-black text-slate-900 tracking-tight">
               Your Evaluation
             </h3>
          </div>
          
          <form onSubmit={handleAddReview} className="glass-card rounded-3xl p-12 border-2 border-white shadow-xl shadow-slate-200/30 space-y-10">
            <div>
              <label className="block text-slate-500 text-sm font-black mb-6 uppercase tracking-widest ml-1">Assign Impact Score</label>
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScore(s)}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 ${
                      score >= s 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30 active:scale-90' 
                        : 'bg-white border-slate-100 text-slate-300 hover:border-indigo-200 hover:text-indigo-400'
                    }`}
                  >
                    <Star className={`w-7 h-7 ${score >= s ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-slate-500 text-sm font-black mb-6 uppercase tracking-widest ml-1">Peer Feedback</label>
              <textarea
                required
                className="w-full h-48 px-8 py-6 rounded-4xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 font-medium text-xl transition-all placeholder:text-slate-400 resize-none shadow-sm"
                placeholder="Detail your observations and suggestions..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-6 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Review'}
            </button>
          </form>
        </div>

        {}
        <div className="space-y-12">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
             <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 mr-5">
                <Star className="w-7 h-7 fill-emerald-600" />
             </div>
             Community Reviews ({reviews.length})
          </h3>
          
          <div className="grid gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="group relative">
                <div className="glass-card p-10 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-100 transition-all shadow-lg hover:shadow-2xl shadow-slate-200/50">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900">{review.reviewerName || 'Anonymous Peer'}</p>
                        <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">Verified Contributor</p>
                      </div>
                    </div>
                    <div className="flex items-center px-5 py-2.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <Star className="w-4 h-4 text-indigo-600 fill-indigo-600 mr-2" />
                      <span className="text-indigo-600 font-black text-lg">{review.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {reviews.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
              <Star className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 text-2xl font-bold italic">No evaluations yet. Start the conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
