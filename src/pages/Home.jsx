// pages/Home.jsx
import React, { useState } from 'react';
import { 
  // Main Icons
  TrendingUp, Users, MessageSquare, DollarSign,
  Clock, CheckCircle, XCircle, AlertCircle,
  Phone, Mail, WhatsApp as WhatsAppIcon,
  Calendar, Star, Target, Award,
  ArrowUp, ArrowDown, MoreVertical,
  Download, Filter, RefreshCw,
  Globe, Facebook, Instagram,
  MessageCircle, Video, Image,
  Play, Pause, ChevronRight,
  Eye, Edit3, Trash2, Send,
  PieChart, BarChart3, Activity
} from 'lucide-react';

const Home = () => {
  const [dateRange, setDateRange] = useState('today');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for stats cards
  const statsCards = [
    {
      title: 'Total Leads',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      period: 'vs last month'
    },
    {
      title: 'Conversion Rate',
      value: '23.8%',
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      period: 'vs last month'
    },
    {
      title: 'Chatbot Conversations',
      value: '456',
      change: '+28.3%',
      trend: 'up',
      icon: MessageSquare,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      period: 'active now: 23'
    },
    {
      title: 'Revenue',
      value: '₹84.2L',
      change: '+18.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
      period: 'this quarter'
    }
  ];

  // Lead sources data with progress
  const leadSources = [
    { 
      name: 'IndiaMART', 
      icon: Globe, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      leads: 423,
      percentage: 34,
      trend: '+15%',
      conversion: '28%'
    },
    { 
      name: 'WhatsApp Chatbot', 
      icon: WhatsAppIcon, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      leads: 356,
      percentage: 28,
      trend: '+42%',
      conversion: '31%'
    },
    { 
      name: 'Website Forms', 
      icon: Mail, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      leads: 245,
      percentage: 20,
      trend: '+8%',
      conversion: '22%'
    },
    { 
      name: 'Meta Platforms', 
      icon: Facebook, 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-100',
      leads: 156,
      percentage: 12,
      trend: '+5%',
      conversion: '19%'
    },
    { 
      name: 'Manual Entry', 
      icon: Users, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      leads: 67,
      percentage: 6,
      trend: '-2%',
      conversion: '24%'
    }
  ];

  // Pipeline stages
  const pipelineStages = [
    { name: 'New Lead', count: 124, value: '₹12.4L', color: 'bg-blue-500' },
    { name: 'Contacted', count: 98, value: '₹9.8L', color: 'bg-yellow-500' },
    { name: 'Requirement', count: 76, value: '₹7.6L', color: 'bg-purple-500' },
    { name: 'Quotation', count: 54, value: '₹5.4L', color: 'bg-indigo-500' },
    { name: 'Follow-up', count: 32, value: '₹3.2L', color: 'bg-orange-500' },
    { name: 'Won', count: 28, value: '₹2.8L', color: 'bg-green-500' }
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'lead',
      action: 'New lead from IndiaMART',
      user: 'Rajesh Kumar',
      time: '2 min ago',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'chatbot',
      action: 'Chatbot conversation started',
      user: 'Priya Sharma',
      time: '5 min ago',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      type: 'deal',
      action: 'Deal won - Dining Table',
      user: 'Amit Patel',
      time: '15 min ago',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      type: 'call',
      action: 'Follow-up call completed',
      user: 'Neha Gupta',
      time: '25 min ago',
      icon: Phone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 5,
      type: 'message',
      action: 'Quotation sent via WhatsApp',
      user: 'Vikram Singh',
      time: '35 min ago',
      icon: Send,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  // Upcoming tasks
  const upcomingTasks = [
    { id: 1, task: 'Follow up with Rajesh', time: '10:30 AM', priority: 'high', assignee: 'You' },
    { id: 2, task: 'Send quotation to Priya', time: '11:45 AM', priority: 'medium', assignee: 'You' },
    { id: 3, task: 'Team meeting', time: '2:00 PM', priority: 'high', assignee: 'All' },
    { id: 4, task: 'Update product catalog', time: '3:30 PM', priority: 'low', assignee: 'You' },
    { id: 5, task: 'Call with Amit for closing', time: '4:15 PM', priority: 'high', assignee: 'You' }
  ];

  // Top performing products
  const topProducts = [
    { name: 'Dining Table', sales: 45, revenue: '₹18.2L', trend: '+23%', image: '🪑' },
    { name: 'Sofa Set', sales: 38, revenue: '₹15.8L', trend: '+18%', image: '🛋️' },
    { name: 'Wardrobe', sales: 32, revenue: '₹14.5L', trend: '+12%', image: '🚪' },
    { name: 'Coffee Table', sales: 28, revenue: '₹8.9L', trend: '+8%', image: '☕' },
    { name: 'Bed', sales: 24, revenue: '₹12.3L', trend: '+15%', image: '🛏️' }
  ];

  // Chatbot performance
  const chatbotMetrics = [
    { label: 'Active Chats', value: '23', icon: MessageCircle, color: 'text-green-600' },
    { label: 'Avg Response', value: '30s', icon: Clock, color: 'text-blue-600' },
    { label: 'Conversion', value: '31%', icon: Target, color: 'text-purple-600' },
    { label: ' satisfaction', value: '94%', icon: Star, color: 'text-yellow-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Welcome and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, John! 👋</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your leads today.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Refresh Button */}
          <button 
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 1000);
            }}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={20} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Download Report */}
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center">
            <Download size={18} className="mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgLight} p-3 rounded-lg`}>
                <stat.icon className={stat.textColor} size={24} />
              </div>
              <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.period}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources Chart - Left Column */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Lead Sources Distribution</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View Details <ChevronRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {leadSources.map((source, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div className={`p-1.5 rounded ${source.bgColor} mr-3`}>
                      <source.icon size={16} className={source.color} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-gray-800">{source.leads}</span>
                    <span className="text-xs text-green-600">{source.trend}</span>
                    <span className="text-xs text-gray-500">Conv: {source.conversion}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${source.color.replace('text', 'bg')}`}
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Chart Legend */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">IndiaMART (34%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">WhatsApp (28%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Website (20%)</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">Total: 1,247 leads</span>
          </div>
        </div>

        {/* Chatbot Performance - Right Column */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Chatbot Performance</h2>
            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>
          </div>

          {/* Active Chatbot Widget */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-800">23</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle size={24} className="text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock size={12} className="mr-1" />
              Avg response: 30 seconds
            </div>
          </div>

          {/* Chatbot Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {chatbotMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <metric.icon size={16} className={metric.color} />
                  <span className="text-xs text-gray-500">{metric.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Chatbot Interactions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 mb-2">RECENT CHATS</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <MessageCircle size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Customer #{i}</p>
                    <p className="text-xs text-gray-500">Dining Table • 2 min ago</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline and Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stages */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pipeline Overview</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View Full Pipeline</button>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-4">
            {pipelineStages.map((stage, index) => (
              <div key={index} className="text-center">
                <div className={`${stage.color} h-1.5 rounded-full mb-2`}></div>
                <p className="text-xs font-medium text-gray-600 truncate">{stage.name}</p>
                <p className="text-sm font-bold text-gray-800">{stage.count}</p>
                <p className="text-xs text-gray-500">{stage.value}</p>
              </div>
            ))}
          </div>

          {/* Pipeline Chart Bars */}
          <div className="space-y-3 mt-4">
            {pipelineStages.map((stage, index) => (
              <div key={index} className="flex items-center">
                <span className="w-24 text-xs text-gray-600">{stage.name}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${stage.color} h-2 rounded-full`}
                      style={{ width: `${(stage.count / 124) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-800">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`${activity.bgColor} p-2 rounded-lg mr-3`}>
                  <activity.icon size={16} className={activity.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user} • {activity.time}
                  </p>
                </div>
                <button className="opacity-0 group-hover:opacity-100">
                  <MoreVertical size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid - Tasks and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.task}</p>
                    <p className="text-xs text-gray-500">{task.time} • {task.assignee}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-600' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Top Performing Products</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View Catalog</button>
          </div>

          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center text-2xl mr-3">
                    {product.image}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{product.revenue}</p>
                  <p className="text-xs text-green-600">{product.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlusCircle size={18} className="mr-2" />
            Add New Lead
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <MessageCircle size={18} className="mr-2" />
            Start Chatbot
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Send size={18} className="mr-2" />
            Send Broadcast
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Need help?</span>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <AlertCircle size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;