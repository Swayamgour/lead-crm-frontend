import React, { useState } from "react";
import { useGetLeadReportQuery } from "../redux/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
    Legend
} from "recharts";
import {
    TrendingUp,
    Users,
    Target,
    Award,
    Calendar,
    Download,
    RefreshCw,
    Filter,
    ChevronDown,
    BarChart3,
    PieChart as PieChartIcon,
    Table as TableIcon,
    Eye,
    EyeOff,
    Loader,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Zap,
    Activity
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f97316", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];

function ReportPage() {
    const [dateRange, setDateRange] = useState("month");
    const [chartType, setChartType] = useState("bar");
    const [showTable, setShowTable] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState("count");

    const { data, isLoading, error, refetch } = useGetLeadReportQuery();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your reports...</p>
                    <p className="text-sm text-gray-400 mt-1">Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Report</h3>
                    <p className="text-gray-500 mb-6">There was an error loading the report data. Please try again.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const totalLeads = data?.totalLeads || 0;
    const statusData = data?.statusReport || [];
    const sourceData = data?.sourceReport || [];

    // Calculate additional metrics
    const convertedLeads = statusData.find(s => s._id?.toLowerCase() === 'won' || s._id?.toLowerCase() === 'closed')?.count || 0;
    const pendingLeads = statusData.find(s => s._id?.toLowerCase() === 'pending' || s._id?.toLowerCase() === 'new')?.count || 0;
    const lostLeads = statusData.find(s => s._id?.toLowerCase() === 'lost')?.count || 0;

    const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={24} />
                </div>
                {trend && (
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} />
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-sm text-blue-600 mt-1">
                        {payload[0].value} leads
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <BarChart3 size={32} />
                                CRM Reports & Analytics
                            </h1>
                            <p className="text-blue-100 mt-2">
                                Track your lead generation performance and conversion metrics
                            </p>
                        </div>

                        {/* <div className="flex items-center gap-3">
                            <button
                                onClick={() => refetch()}
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                title="Refresh Data"
                            >
                                <RefreshCw size={20} />
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl">
                                <Download size={18} />
                                <span className="font-medium">Export</span>
                            </button>
                        </div> */}
                    </div>

                    {/* Date Range Selector */}
                  
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Leads"
                        value={totalLeads}
                        icon={Users}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        trend="+12.5%"
                        subtitle="vs last month"
                    />
                    <StatCard
                        title="Converted"
                        value={convertedLeads}
                        icon={CheckCircle}
                        color="bg-gradient-to-br from-green-500 to-green-600"
                        trend="+8.2%"
                        subtitle="vs last month"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${conversionRate}%`}
                        icon={Target}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                        trend="+5.1%"
                        subtitle="vs last month"
                    />
                    <StatCard
                        title="Pending"
                        value={pendingLeads}
                        icon={Clock}
                        color="bg-gradient-to-br from-orange-500 to-orange-600"
                        trend="-3.2%"
                        subtitle="vs last month"
                    />
                </div>

                {/* Charts Control Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">View:</span>
                        <button
                            onClick={() => setChartType("bar")}
                            className={`p-2 rounded-lg transition-colors ${chartType === "bar"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <BarChart3 size={20} />
                        </button>
                        <button
                            onClick={() => setChartType("line")}
                            className={`p-2 rounded-lg transition-colors ${chartType === "line"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <Activity size={20} />
                        </button>
                        <button
                            onClick={() => setChartType("pie")}
                            className={`p-2 rounded-lg transition-colors ${chartType === "pie"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <PieChartIcon size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Show Table</span>
                            <button
                                onClick={() => setShowTable(!showTable)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showTable ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showTable ? "translate-x-5" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All Sources</option>
                            <option>Website</option>
                            <option>Referral</option>
                            <option>Social Media</option>
                            <option>Direct</option>
                        </select>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Leads by Status */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Leads by Status</h2>
                                <p className="text-sm text-gray-500 mt-1">Distribution of leads across stages</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {statusData.length} statuses
                                </span>
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === "bar" ? (
                                    <BarChart data={statusData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="_id"
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                        />
                                        <YAxis
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="count"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                ) : chartType === "line" ? (
                                    <LineChart data={statusData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6', r: 6 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                ) : (
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            dataKey="count"
                                            nameKey="_id"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={60}
                                            paddingAngle={2}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Leads by Source */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Leads by Source</h2>
                                <p className="text-sm text-gray-500 mt-1">Lead generation channels performance</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    {sourceData.length} sources
                                </span>
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        dataKey="count"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        innerRadius={60}
                                        paddingAngle={2}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                {showTable && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <TableIcon size={16} className="text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Lead Status Summary</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                                    <Filter size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Count
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Percentage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Trend
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {statusData.map((item, index) => {
                                        const percentage = totalLeads ? ((item.count / totalLeads) * 100).toFixed(1) : 0;
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                        <span className="font-medium text-gray-800">{item._id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{item.count}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">{percentage}%</span>
                                                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                        +{Math.floor(Math.random() * 20)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 font-semibold text-gray-800">Total</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">{totalLeads}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">100%</td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {totalLeads === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg mt-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
                        <p className="text-gray-500 mb-6">There are no leads to display in the report yet.</p>
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
                            <RefreshCw size={18} />
                            Refresh Data
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportPage;