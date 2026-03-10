// App.jsx
import React, { useState } from 'react';
import {
    Menu,
    X,
    Home,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    Phone,
    Mail,
    Filter,
    Search,
    Plus,
    MoreVertical,
    TrendingUp,
    Target,
    Clock,
    CheckCircle,
    XCircle,
    MessageCircle,
    Video,
    Image,
    Download,
    Upload,
    Sidebar
} from 'lucide-react';
import NavSidebar from "./NavSidebar.jsx"

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Sample leads data
    const leads = [
        { id: 1, name: 'Rajesh Kumar', product: 'Dining Table', source: 'IndiaMART', stage: 'New Lead', status: 'hot', time: '5 min ago' },
        { id: 2, name: 'Priya Sharma', product: 'Sofa Set', source: 'Website', stage: 'Quotation Sent', status: 'warm', time: '2 hours ago' },
        { id: 3, name: 'Amit Patel', product: 'Wardrobe', source: 'WhatsApp', stage: 'Follow-Up', status: 'cold', time: '1 day ago' },
        { id: 4, name: 'Neha Gupta', product: 'Coffee Table', source: 'Meta', stage: 'Requirement Identified', status: 'hot', time: '3 hours ago' },
        { id: 5, name: 'Vikram Singh', product: 'Bed', source: 'Manual', stage: 'Contacted', status: 'warm', time: '30 min ago' },
    ];

    // Pipeline stages
    const stages = [
        { name: 'New Lead', count: 24, color: 'bg-blue-500' },
        { name: 'Contacted', count: 18, color: 'bg-yellow-500' },
        { name: 'Requirement Identified', count: 15, color: 'bg-purple-500' },
        { name: 'Quotation Sent', count: 12, color: 'bg-indigo-500' },
        { name: 'Follow-Up', count: 8, color: 'bg-orange-500' },
        { name: 'Won', count: 6, color: 'bg-green-500' },
        { name: 'Lost', count: 4, color: 'bg-red-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
           
            <div className={` transition-all duration-300`}>
                {/* Top Bar */}
              
                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {[
                            { label: 'Total Leads', value: '156', icon: Users, color: 'bg-blue-500', change: '+12%' },
                            { label: 'Conversion Rate', value: '24.5%', icon: TrendingUp, color: 'bg-green-500', change: '+5%' },
                            { label: 'Avg Response Time', value: '5 min', icon: Clock, color: 'bg-yellow-500', change: '-2 min' },
                            { label: 'Won Deals', value: '₹45.2L', icon: Target, color: 'bg-purple-500', change: '+18%' },
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} p-3 rounded-lg bg-opacity-10`}>
                                        <stat.icon className={`${stat.color.replace('bg-', 'text-')}`} size={24} />
                                    </div>
                                    <span className="text-sm text-green-600">{stat.change}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                                <p className="text-gray-600 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pipeline View */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Pipeline</h2>
                        <div className="grid grid-cols-7 gap-2">
                            {stages.map((stage, index) => (
                                <div key={index} className="text-center">
                                    <div className={`${stage.color} h-2 rounded-full mb-2`}></div>
                                    <p className="text-sm font-medium text-gray-700">{stage.name}</p>
                                    <p className="text-lg font-bold text-gray-900">{stage.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Leads & Chatbot Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Leads Table */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Recent Leads</h2>
                                <button className="text-blue-600 text-sm hover:underline">View All</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-600 border-b">
                                            <th className="pb-3">Lead</th>
                                            <th className="pb-3">Product</th>
                                            <th className="pb-3">Source</th>
                                            <th className="pb-3">Stage</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead) => (
                                            <tr key={lead.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{lead.name}</p>
                                                        <p className="text-xs text-gray-500">{lead.time}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-gray-600">{lead.product}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.source === 'IndiaMART' ? 'bg-orange-100 text-orange-700' :
                                                        lead.source === 'Website' ? 'bg-blue-100 text-blue-700' :
                                                            lead.source === 'WhatsApp' ? 'bg-green-100 text-green-700' :
                                                                'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {lead.source}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-600">{lead.stage}</td>
                                                <td className="py-3">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${lead.status === 'hot' ? 'bg-red-500' :
                                                        lead.status === 'warm' ? 'bg-yellow-500' : 'bg-gray-400'
                                                        }`}></span>
                                                </td>
                                                <td className="py-3">
                                                    <button className="p-1 hover:bg-gray-100 rounded">
                                                        <MoreVertical size={16} className="text-gray-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Chatbot Activity */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Chatbot Activity</h2>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Active</span>
                            </div>

                            {/* Active Chatbot Conversations */}
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <MessageCircle size={16} className="text-green-600" />
                                                </div>
                                                <div className="ml-2">
                                                    <p className="text-sm font-medium">Customer #{i}</p>
                                                    <p className="text-xs text-gray-500">Dining Table</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">2 min ago</span>
                                        </div>

                                        {/* Chatbot Actions */}
                                        <div className="flex space-x-2 mt-2">
                                            <button className="p-1 bg-blue-50 rounded">
                                                <Image size={14} className="text-blue-600" />
                                            </button>
                                            <button className="p-1 bg-red-50 rounded">
                                                <Video size={14} className="text-red-600" />
                                            </button>
                                            <button className="p-1 bg-purple-50 rounded">
                                                <Download size={14} className="text-purple-600" />
                                            </button>
                                        </div>

                                        {/* Message Preview */}
                                        <div className="mt-2 bg-gray-50 rounded p-2">
                                            <p className="text-xs text-gray-600">
                                                Sent: Product images & video links
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 pt-4 border-t">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                                        <MessageCircle size={16} className="mr-1" />
                                        <span className="text-xs">Broadcast</span>
                                    </button>
                                    <button className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                                        <Upload size={16} className="mr-1" />
                                        <span className="text-xs">Auto-reply</span>
                                    </button>
                                </div>
                            </div>

                            {/* Integration Status */}
                            <div className="mt-4 bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-700 font-medium mb-1">Connected Sources</p>
                                <div className="flex flex-wrap gap-1">
                                    <span className="px-2 py-1 bg-white rounded text-xs">IndiaMART</span>
                                    <span className="px-2 py-1 bg-white rounded text-xs">Website</span>
                                    <span className="px-2 py-1 bg-white rounded text-xs">Meta</span>
                                    <span className="px-2 py-1 bg-white rounded text-xs">WhatsApp</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chatbot Flow Visualization */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Flow with Chatbot Automation</h2>
                        <div className="flex items-center justify-between">
                            {['Lead Capture', 'Auto-Reply', 'Product Info', 'Warm Lead', 'Sales Follow-up'].map((step, index, array) => (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index < 3 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {index === 0 && <MessageSquare size={20} />}
                                            {index === 1 && <MessageCircle size={20} />}
                                            {index === 2 && <Image size={20} />}
                                            {index === 3 && <Users size={20} />}
                                            {index === 4 && <Phone size={20} />}
                                        </div>
                                        <p className="text-sm mt-2 text-center">{step}</p>
                                    </div>
                                    {index < array.length - 1 && (
                                        <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;