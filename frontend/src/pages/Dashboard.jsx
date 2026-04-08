import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Orbit, LogOut, ExternalLink, Calendar, Search, FileText, Download } from 'lucide-react';

const Dashboard = () => {
  const { logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/api/projects', newProject);
      setIsModalOpen(false);
      setNewProject({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
      alert('Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    (p.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (p.description?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-grotesk">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Orbit className="text-white w-7 h-7 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              PeerSphere
            </h1>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-6xl font-black tracking-tight text-slate-900 mb-4 antialiased">
              Discover <span className="text-indigo-600">Projects.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Explore and contribute to the next generation of academic and peer review projects.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-8 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-2xl shadow-slate-900/20 group"
          >
            <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-500" />
            Launch Project
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-16 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or description..."
              className="w-full pl-16 pr-8 py-6 rounded-4xl bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 outline-none text-slate-900 text-lg font-medium transition-all placeholder:text-slate-400 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-[2.5rem] bg-slate-50 animate-pulse border-2 border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                className="group glass-card rounded-[2.5rem] p-10 flex flex-col justify-between"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                       <Orbit className="w-6 h-6" />
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                      <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-4">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 line-clamp-3 mb-8 text-lg font-medium leading-relaxed">
                    {project.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-auto">
                   <div className="flex items-center text-slate-400 text-sm font-bold uppercase tracking-wider">
                      <Calendar className="w-4 h-4 mr-2" />
                      {project.createdByName || 'System'}
                   </div>
                   <span className="text-indigo-600 font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                     View
                   </span>
                 </div>
              </div>
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-32 text-center rounded-[3rem] border-4 border-dashed border-slate-50">
                <p className="text-slate-400 text-2xl font-bold mb-6">Zero projects match your vision.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
                >
                  Create One Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <div className="glass-card w-full max-w-2xl p-12 rounded-[3.5rem] relative animate-in zoom-in duration-500 shadow-3xl shadow-slate-900/20">
              <div className="mb-10 text-center">
                <h3 className="text-4xl font-black text-slate-900 mb-3">New Project</h3>
                <p className="text-slate-500 font-medium">Define the future of peer review.</p>
              </div>
              <form onSubmit={handleCreateProject} className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest ml-1">Project Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter a bold title..."
                    className="w-full px-6 py-5 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none border-2 border-transparent focus:border-indigo-500 font-bold text-lg text-slate-900 transition-all placeholder:text-slate-400"
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    rows="5"
                    required
                    placeholder="Describe the goals and scope..."
                    className="w-full px-6 py-5 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none border-2 border-transparent focus:border-indigo-500 font-medium text-lg text-slate-900 transition-all resize-none placeholder:text-slate-400"
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/20 disabled:opacity-50"
                  >
                    {createLoading ? 'Launching...' : 'Launch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
