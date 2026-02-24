import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  Send,
  Eye,
  MousePointer,
  CheckCircle,
  XCircle,
  LogOut
} from "lucide-react";

interface User {
  _id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface LoginHistory {
  date: string;
  loginTime: string;
  logoutTime?: string;
  duration?: string;
}

interface CampaignStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  openRate: string;
  clickRate: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'campaigns'>('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        window.location.href = '/auth';
        return;
      }

      // Parse user data from localStorage
      const parsedUser = JSON.parse(userData);
      
      // Create user object with fallbacks
      const user = {
        _id: parsedUser._id || parsedUser.id || '1',
        username: parsedUser.username || parsedUser.email?.split('@')[0] || 'user',
        email: parsedUser.email || 'user@example.com',
        firstName: parsedUser.firstName || parsedUser.name?.split(' ')[0] || 'User',
        lastName: parsedUser.lastName || parsedUser.name?.split(' ')[1] || 'Name',
        role: parsedUser.role || 'user',
        isActive: parsedUser.isActive !== false,
        createdAt: parsedUser.createdAt || new Date().toISOString(),
        lastLogin: parsedUser.lastLogin || new Date().toISOString()
      };
      
      setUser(user);
      
      // Set mock data for login history and campaign stats
      setLoginHistory([
        {
          date: new Date().toLocaleDateString(),
          loginTime: new Date().toLocaleTimeString(),
          duration: '2h 30m'
        }
      ]);
      
      setCampaignStats({
        totalSent: 150,
        totalDelivered: 145,
        totalOpened: 120,
        totalClicked: 45,
        openRate: '82.8%',
        clickRate: '31.0%'
      });
      
    } catch (err: any) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="relative h-20 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"></div>
          </div>
          <div className="px-8 pb-8 relative">
            <div className="flex items-end -mt-20 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white">
                  {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="ml-8 mb-4 flex-1">
                <h2 className="text-4xl font-bold text-slate-900 mb-2">
                  {user.firstName || ''} {user.lastName || ''}
                </h2>
                <p className="text-white text-lg mb-3">@{user.username}</p>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    user.isActive 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Email</p>
                    <p className="text-slate-900 font-semibold">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Member Since</p>
                    <p className="text-slate-900 font-semibold">{new Date(user.createdAt || new Date()).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Last Login</p>
                    <p className="text-slate-900 font-semibold">{new Date(user.lastLogin || new Date()).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                  activeTab === 'activity'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Activity & Login History</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                  activeTab === 'campaigns'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Email Campaign Stats</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                    <label className="text-slate-700 text-sm font-semibold mb-3 block">First Name</label>
                    <div className="bg-white rounded-xl px-4 py-3 text-slate-900 font-medium border border-slate-300">{user.firstName}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                    <label className="text-slate-700 text-sm font-semibold mb-3 block">Last Name</label>
                    <div className="bg-white rounded-xl px-4 py-3 text-slate-900 font-medium border border-slate-300">{user.lastName}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                    <label className="text-slate-700 text-sm font-semibold mb-3 block">Username</label>
                    <div className="bg-white rounded-xl px-4 py-3 text-slate-900 font-medium border border-slate-300">{user.username}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                    <label className="text-slate-700 text-sm font-semibold mb-3 block">Email Address</label>
                    <div className="bg-white rounded-xl px-4 py-3 text-slate-900 font-medium border border-slate-300">{user.email}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                    <label className="text-slate-700 text-sm font-semibold mb-3 block">Role</label>
                    <div className="bg-white rounded-xl px-4 py-3 text-slate-900 font-medium capitalize border border-slate-300">{user.role}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:bg-slate-100 transition-all duration-300">
                    <label className="text-slate-700 text-sm font-semibold mb-3 block">Account Status</label>
                    <div className="bg-white rounded-xl px-4 py-3 border border-slate-300">
                      <span className={`inline-flex items-center space-x-2 ${
                        user.isActive ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {user.isActive ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span className="font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Login History</h3>
                <div className="overflow-x-auto">
                  <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <table className="min-w-full">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Login Time
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Logout Time
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {loginHistory.map((entry, index) => (
                          <tr key={index} className="hover:bg-slate-100 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {entry.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>{entry.loginTime}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              <div className="flex items-center space-x-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span>{entry.logoutTime || 'Still Active'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                entry.duration ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {entry.duration || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && campaignStats && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Email Campaign Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Send className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-blue-700 text-sm font-semibold">Total Sent</div>
                    </div>
                    <div className="text-4xl font-bold text-blue-900">{campaignStats.totalSent.toLocaleString()}</div>
                    <div className="text-blue-600 text-sm mt-2">Emails dispatched</div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 hover:from-emerald-100 hover:to-green-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-emerald-700 text-sm font-semibold">Delivered</div>
                    </div>
                    <div className="text-4xl font-bold text-emerald-900">{campaignStats.totalDelivered.toLocaleString()}</div>
                    <div className="text-emerald-600 text-sm mt-2">Successfully delivered</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Eye className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-purple-700 text-sm font-semibold">Open Rate</div>
                    </div>
                    <div className="text-4xl font-bold text-purple-900">{campaignStats.openRate}</div>
                    <div className="text-purple-600 text-sm mt-2">Average open rate</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <MousePointer className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-yellow-700 text-sm font-semibold">Total Clicks</div>
                    </div>
                    <div className="text-4xl font-bold text-yellow-900">{campaignStats.totalClicked.toLocaleString()}</div>
                    <div className="text-yellow-600 text-sm mt-2">Link clicks</div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200 hover:from-indigo-100 hover:to-blue-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-indigo-700 text-sm font-semibold">Click Rate</div>
                    </div>
                    <div className="text-4xl font-bold text-indigo-900">{campaignStats.clickRate}</div>
                    <div className="text-indigo-600 text-sm mt-2">Average click rate</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 hover:from-red-100 hover:to-pink-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-red-700 text-sm font-semibold">Total Opened</div>
                    </div>
                    <div className="text-4xl font-bold text-red-900">{campaignStats.totalOpened.toLocaleString()}</div>
                    <div className="text-red-600 text-sm mt-2">Emails opened</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
