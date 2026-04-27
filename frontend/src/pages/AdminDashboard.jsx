import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (user && isAdmin()) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/projects')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/admin/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/admin/projects/${id}`);
        setProjects(projects.filter(p => p.id !== id));
      } catch (error) {
        alert('Failed to delete project');
      }
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading Power...</div>;
  if (!user || !isAdmin()) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar / Header */}
      <div className="bg-slate-900 text-white p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-2xl font-bold italic">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">Control Center</h1>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Pure Authority</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link to="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all border border-slate-700">Exit Console</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {['stats', 'users', 'projects'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all shadow-sm ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-indigo-200' 
                  : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse flex space-y-4 flex-col">
            <div className="h-48 bg-slate-200 rounded-3xl"></div>
            <div className="h-64 bg-slate-200 rounded-3xl"></div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500' },
                  { label: 'Projects', value: stats.totalProjects, color: 'bg-purple-500' },
                  { label: 'Submissions', value: stats.totalSubmissions, color: 'bg-emerald-500' },
                  { label: 'Reviews', value: stats.totalReviews, color: 'bg-amber-500' }
                ].map(item => (
                  <div key={item.label} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between overflow-hidden relative group">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${item.color} opacity-5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150`}></div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-5xl font-black tracking-tighter text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-8 border-bottom border-slate-100">
                  <h3 className="text-2xl font-black tracking-tight italic">User Management</h3>
                  <p className="text-slate-400 text-sm">Control all accounts within PeerSphere</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-8 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">User</th>
                        <th className="px-8 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Role</th>
                        <th className="px-8 py-4 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{u.name}</p>
                                <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              u.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.email === user.email}
                              className="text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all font-bold text-sm disabled:opacity-30"
                            >
                              Destroy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-8 border-bottom border-slate-100">
                  <h3 className="text-2xl font-black tracking-tight italic">Project Repository</h3>
                  <p className="text-slate-400 text-sm">Oversee and moderate all collaborative initiatives</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-8 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Project</th>
                        <th className="px-8 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Creator</th>
                        <th className="px-8 py-4 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {projects.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-900">{p.title || p.name}</p>
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{p.description}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-slate-600">{p.createdByName}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => handleDeleteProject(p.id)}
                              className="text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all font-bold text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
