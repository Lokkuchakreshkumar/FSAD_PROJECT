import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronLeft, Send, FileText, User, MessageSquare, PlusCircle, Download, Paperclip, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProjectAndSubmissions();
  }, [projectId]);

  const fetchProjectAndSubmissions = async () => {
    try {
      const [projRes, subRes] = await Promise.all([
        api.get(`/api/projects`), // Backend doesn't have GET /api/projects/{id} in controller, only listAll
        api.get(`/api/submissions/project/${projectId}`)
      ]);
      const foundProject = projRes.data.find(p => p.id === parseInt(projectId));
      setProject(foundProject);
      setSubmissions(subRes.data);
    } catch (err) {
      console.error('Failed to fetch details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmission = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      const requestBlob = new Blob([JSON.stringify({
        projectId: parseInt(projectId),
        content: submissionContent
      })], { type: 'application/json' });
      
      formData.append('request', requestBlob);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post('/api/submissions', formData);

      setSubmissionContent('');
      setSelectedFile(null);
      setShowSubmitModal(false);
      fetchProjectAndSubmissions();
    } catch (err) {
      console.error(err);
      alert('Failed to create submission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/api/projects/${projectId}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project_${projectId}_export.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center font-grotesk text-2xl font-bold italic animate-pulse">
      Elevating Project Sphere...
    </div>
  );
  
  if (!project) return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center font-grotesk">
       <div className="text-8xl font-black text-slate-200 mb-4">404</div>
       <p className="text-2xl font-bold text-slate-400">Project Not Found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-grotesk pb-32">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 mb-12 transition-all group font-bold uppercase tracking-widest text-sm"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <div className="glass-card rounded-[3rem] p-12 mb-16 relative overflow-hidden border-2 border-slate-50 shadow-2xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -mr-48 -mt-48" />
          <h1 className="text-7xl font-black mb-8 text-slate-900 tracking-tighter leading-none">
            {project.title}
          </h1>
          <p className="text-2xl text-slate-500 font-medium leading-relaxed mb-12 max-w-3xl">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10">
                <User className="w-5 h-5 mr-3 text-indigo-400" />
                <span className="font-bold">{project.createdByName || 'System'}</span>
             </div>
             <div className="flex items-center px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl">
                <FileText className="w-5 h-5 mr-3 text-indigo-500" />
                <span className="font-bold">{submissions.length} Submissions</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center">
             <div className="w-2 h-10 bg-indigo-600 rounded-full mr-4" />
             Peer Submissions
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {currentUser?.id === project.createdBy && (
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-center px-8 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-500/25 disabled:opacity-50"
              >
                <Download className="w-6 h-6 mr-3" />
                {exporting ? 'Exporting...' : 'Export Data'}
              </button>
            )}
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center justify-center px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-500/25 group"
            >
              <PlusCircle className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-500" />
              New Submission
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {submissions.map((sub) => (
            <div 
              key={sub.id}
              className="group glass-card p-10 rounded-[2.5rem] hover:border-indigo-600/30 transition-all cursor-pointer flex items-center justify-between"
              onClick={() => navigate(`/submission/${sub.id}`)}
            >
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Submission #{sub.id}</span>
                    {sub.fileName && (
                      <span className="flex items-center text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        <Paperclip className="w-3 h-3 mr-1" />
                        File
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-slate-900 line-clamp-1 italic group-hover:text-indigo-600 transition-colors">"{sub.content}"</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="hidden md:flex items-center space-x-2 text-slate-400 group-hover:text-indigo-600 transition-colors font-bold uppercase tracking-widest text-xs px-4 py-2 bg-slate-50 rounded-xl">
                    <MessageSquare className="w-4 h-4" />
                    <span>Evaluate</span>
                 </div>
                 <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                    <Send className="w-5 h-5 text-slate-400 group-hover:text-white -rotate-45" />
                 </div>
              </div>
            </div>
          ))}
          
          {submissions.length === 0 && (
            <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
               <p className="text-slate-400 text-2xl font-bold italic mb-6">The stage is empty. Share your work.</p>
               <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20"
               >
                  Create First Submission
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowSubmitModal(false)} />
          <div className="relative w-full max-w-2xl glass-card rounded-[3.5rem] p-12 border-2 border-slate-50 animate-in zoom-in duration-500 shadow-3xl shadow-slate-900/20">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">New Submission</h3>
              <p className="text-slate-500 font-medium">Contribute your research or output.</p>
            </div>
            <form onSubmit={handleCreateSubmission} className="space-y-8">
              <div className="space-y-4">
                <textarea
                  required
                  className="w-full h-48 px-8 py-6 rounded-[2.5rem] bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 font-medium text-xl transition-all placeholder:text-slate-400 resize-none shadow-sm"
                  placeholder="Share your breakthrough..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                />
                
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                  {!selectedFile ? (
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full py-6 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all cursor-pointer group"
                    >
                      <Paperclip className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                      <span className="font-bold">Attach Supporting Document</span>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                      <div className="flex items-center text-indigo-600">
                        <FileText className="w-5 h-5 mr-3" />
                        <span className="font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? 'Sharing...' : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Share Work
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
