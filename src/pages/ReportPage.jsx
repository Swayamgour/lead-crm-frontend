import React, { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Target,
    Award,
    Calendar,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    PieChart,
    BarChart3,
    LineChart,
    Activity,
    Eye,
    Star,
    Zap,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Filter,
    Search,
    Mail,
    Phone,
    User,
    Trophy,
    Medal,
    Crown,
    Sparkles,
    Rocket,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Printer,
    Share2,
    Maximize2,
    Minimize2,
    FileText
} from "lucide-react";
import { useGetConversionReportQuery, useGetExecutiveSalesReportQuery, useGetLeadReportQuery, useGetSalesPerformanceQuery, useGetSalesReportQuery } from "../redux/api";

const ReportPage = () => {
    const [timeframe, setTimeframe] = useState("monthly");
    const [expandedSections, setExpandedSections] = useState({});
    const [selectedChart, setSelectedChart] = useState("bar");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [fullscreenSection, setFullscreenSection] = useState(null);

    // Mock data - replace with your actual API data
    const { data: leadReport } = useGetLeadReportQuery();
    const { data: salesReport } = useGetSalesReportQuery();
    const { data: conversionReport } = useGetConversionReportQuery();
    const { data: performanceReport } = useGetSalesPerformanceQuery();
    const { data: executiveReport } = useGetExecutiveSalesReportQuery();

    console.log(conversionReport)

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleFullscreen = (section) => {
        setFullscreenSection(fullscreenSection === section ? null : section);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'won': 'bg-green-100 text-green-800 border-green-200',
            'lost': 'bg-red-100 text-red-800 border-red-200',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'converted': 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Get random gradient
    const getGradient = (index) => {
        const gradients = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-orange-500 to-amber-600',
            'from-purple-500 to-pink-600',
            'from-rose-500 to-red-600',
            'from-cyan-500 to-sky-600'
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white  shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                <BarChart3 size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                                    Analytics Dashboard
                                    <Sparkles size={24} className="text-yellow-300 animate-pulse" />
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    Comprehensive insights into your sales performance
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Timeframe Selector */}
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                <option value="daily" className="text-gray-800">📅 Daily</option>
                                <option value="weekly" className="text-gray-800">📊 Weekly</option>
                                <option value="monthly" className="text-gray-800">📈 Monthly</option>
                                <option value="quarterly" className="text-gray-800">📉 Quarterly</option>
                                <option value="yearly" className="text-gray-800">🎯 Yearly</option>
                            </select>

                            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all">
                                <Download size={18} />
                            </button>
                            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-blue-100 text-xs">Total Revenue</p>
                            <p className="text-xl font-bold">{formatCurrency(salesReport?.revenue)}</p>
                            <p className="text-xs text-green-300 mt-1 flex items-center gap-1">
                                <ArrowUpRight size={12} />
                                +12.5% vs last month
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-blue-100 text-xs">Conversion Rate</p>
                            <p className="text-xl font-bold">{salesReport?.conversionRate || '0%'}</p>
                            <p className="text-xs text-green-300 mt-1 flex items-center gap-1">
                                <ArrowUpRight size={12} />
                                +5.2% vs last month
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-blue-100 text-xs">Active Deals</p>
                            <p className="text-xl font-bold">{salesReport?.activeDeals || 0}</p>
                            <p className="text-xs text-yellow-300 mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                23 closing this week
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-blue-100 text-xs">Team Performance</p>
                            <p className="text-xl font-bold">94%</p>
                            <p className="text-xs text-green-300 mt-1 flex items-center gap-1">
                                <Target size={12} />
                                Above target
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Summary Cards with Enhanced Design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: 'Total Leads',
                            value: salesReport?.totalLeads || 0,
                            icon: Users,
                            change: '+15%',
                            color: 'blue',
                            subtext: 'vs last month'
                        },
                        {
                            title: 'Converted Leads',
                            value: salesReport?.convertedLeads || 0,
                            icon: CheckCircle,
                            change: '+8%',
                            color: 'green',
                            subtext: 'vs last month'
                        },
                        {
                            title: 'Conversion Rate',
                            value: salesReport?.conversionRate || '0%',
                            icon: Target,
                            change: '+5.2%',
                            color: 'purple',
                            subtext: 'improvement'
                        },
                        {
                            title: 'Revenue',
                            value: formatCurrency(salesReport?.revenue),
                            icon: DollarSign,
                            change: '+23%',
                            color: 'orange',
                            subtext: 'vs last month'
                        }
                    ].map((card, idx) => {
                        const Icon = card.icon;
                        const gradients = {
                            blue: 'from-blue-500 to-blue-600',
                            green: 'from-emerald-500 to-green-600',
                            purple: 'from-purple-500 to-purple-600',
                            orange: 'from-orange-500 to-amber-600'
                        };
                        return (
                            <div
                                key={idx}
                                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                                        <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                                                <ArrowUpRight size={12} />
                                                {card.change}
                                            </span>
                                            <span className="text-xs text-gray-400">{card.subtext}</span>
                                        </div>
                                    </div>
                                    <div className={`p-4 bg-gradient-to-br ${gradients[card.color]} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform`}>
                                        <Icon className="text-white" size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${gradients[card.color]} rounded-full`} style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Lead Status Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <PieChart size={20} className="text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Lead Status Distribution</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreVertical size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {leadReport?.statusReport?.map((item, idx) => (
                                <div key={item._id} className="group hover:bg-gray-50 p-3 rounded-xl transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' :
                                                idx === 1 ? 'bg-green-500' :
                                                    idx === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                                                }`}></div>
                                            <span className="font-medium text-gray-700 capitalize">{item._id}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                idx === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                    idx === 2 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'
                                                }`}
                                            style={{
                                                width: `${(item.count / leadReport?.statusReport?.reduce((acc, curr) => acc + curr.count, 0)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lead Source Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 size={20} className="text-purple-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Lead Sources</h2>
                            </div>
                            <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>This Quarter</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            {leadReport?.sourceReport?.map((item, idx) => (
                                <div key={item._id} className="flex items-center gap-4 group hover:bg-gray-50 p-2 rounded-lg transition-all">
                                    <div className="w-24 text-sm font-medium text-gray-600 capitalize">{item._id}</div>
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-blue-500 to-indigo-600' :
                                                    idx === 1 ? 'from-green-500 to-emerald-600' :
                                                        idx === 2 ? 'from-yellow-500 to-amber-600' : 'from-purple-500 to-pink-600'
                                                    } rounded-full transition-all duration-500`}
                                                style={{
                                                    width: `${(item.count / leadReport?.sourceReport?.reduce((acc, curr) => acc + curr.count, 0)) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-16 text-right font-bold text-gray-800">{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Performance Table */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <Trophy size={20} className="text-amber-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Executive Performance</h2>
                                </div>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executive</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Closed</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {performanceReport?.report?.map((exec, idx) => (
                                        <tr key={exec.executiveId} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGradient(idx)} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                                        {exec.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{exec.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {exec.executiveId?.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">{exec.totalLeads}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                    <CheckCircle size={12} />
                                                    {exec.closedLeads}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                    <Clock size={12} />
                                                    {exec.pendingLeads}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-semibold ${parseFloat(exec.conversionRate) >= 50 ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {exec.conversionRate}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Executive Leaderboard */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Medal size={20} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Revenue Leaderboard</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Top Performers</span>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {executiveReport?.report?.map((exec, idx) => (
                                <div key={exec._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-8 h-8">
                                            {idx === 0 ? (
                                                <Crown size={24} className="text-yellow-500" />
                                            ) : idx === 1 ? (
                                                <Medal size={20} className="text-gray-400" />
                                            ) : idx === 2 ? (
                                                <Medal size={20} className="text-amber-600" />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-400">#{idx + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{exec.executive?.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                <span>{exec.totalLeads} leads</span>
                                                <span>•</span>
                                                <span>{exec.converted} converted</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(exec.revenue)}</p>
                                        <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                                            <ArrowUpRight size={12} />
                                            +{Math.floor(Math.random() * 30)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Conversion Trends */}
              

                {/* Export Section */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Download size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Export Reports</h3>
                                <p className="text-sm text-gray-500">Download data in various formats</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                                <FileText size={16} />
                                PDF
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                                <BarChart3 size={16} />
                                Excel
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                                <Printer size={16} />
                                Print
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                                <Download size={16} />
                                Export All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;