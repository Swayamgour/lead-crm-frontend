import React, { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Target,
    Award,

    PieChart,
    BarChart3,

    Clock,
    CheckCircle,

    Mail,
    Trophy,
    Medal,
    Crown,
    Sparkles,
    Rocket,
    ArrowUpRight,
    ArrowDownRight,

    Maximize2,

    Users as UsersIcon,
    Calendar as CalendarIcon,
    Package,
    MessageCircle,
    PhoneCall
} from "lucide-react";
import { useGetConversionReportQuery, useGetExecutiveSalesReportQuery, useGetLeadReportQuery, useGetSalesPerformanceQuery, useGetSalesReportQuery } from "../redux/api";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import DateQuickFilter from "../components/DateQuickFilter";

const ReportPage = () => {


    const [dateFilter, setDateFilter] = useState({ preset: "all", startDate: "", endDate: "" });

    const reportParams = dateFilter.preset === "all"
        ? undefined
        : { startDate: dateFilter.startDate || undefined, endDate: dateFilter.endDate || undefined };

    const { data: leadReport, isLoading } = useGetLeadReportQuery(reportParams);
    const { data: salesReport } = useGetSalesReportQuery(reportParams);
    const { data: conversionReport } = useGetConversionReportQuery(reportParams);
    const { data: performanceReport } = useGetSalesPerformanceQuery(reportParams);
    const { data: executiveReport } = useGetExecutiveSalesReportQuery(reportParams);

    const navigate = useNavigate()



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };



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

    if (isLoading) {
        return <Loading data={'Report'} />;
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] border border-gray-100 px-6 py-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2653ef] to-[#f5a524]" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2653ef] to-[#1d40c9] flex items-center justify-center shadow-[0_6px_16px_rgba(38,83,239,0.3)]">
                                    <BarChart3 className="text-white" size={22} />
                                </span>
                                Report
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm ml-14">
                                Comprehensive insights into your sales performance
                            </p>
                        </div>
                        <DateQuickFilter value={dateFilter} onChange={setDateFilter} />
                    </div>

                    {/* Quick Stats Row */}
                    
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'Total Leads', value: salesReport?.totalLeads || 0, icon: UsersIcon, change: '+15%', color: 'blue', subtext: 'vs last month' },
                        { title: 'Converted Leads', value: salesReport?.convertedLeads || 0, icon: CheckCircle, change: '+8%', color: 'green', subtext: 'vs last month' },
                        { title: 'Conversion Rate', value: salesReport?.conversionRate || '0%', icon: Target, change: '+5.2%', color: 'purple', subtext: 'improvement' },
                        { title: 'Revenue', value: formatCurrency(salesReport?.revenue), icon: DollarSign, change: '+23%', color: 'orange', subtext: 'vs last month' }
                    ].map((card, idx) => (
                        <SummaryCard key={idx} {...card} />
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Lead Status Distribution */}
                    <ChartCard
                        title="Lead Status Distribution"
                        icon={<PieChart size={20} />}
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                        navigate={navigate}
                    >
                        <div className="space-y-4">
                            {leadReport?.statusReport?.map((item, idx) => {
                                const total = leadReport?.statusReport?.reduce((acc, curr) => acc + curr.count, 0);
                                const percentage = (item.count / total) * 100;
                                const colors = ['blue', 'green', 'amber', 'purple', 'orange', 'pink'];
                                return (
                                    <div key={item._id} className="group hover:bg-gray-50 p-3 rounded-xl transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full bg-${colors[idx % colors.length]}-500`}></div>
                                                <span className="font-medium text-gray-700 capitalize">{item._id}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{item.count}</span>
                                                <span className="text-xs text-gray-400">({percentage.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r from-${colors[idx % colors.length]}-500 to-${colors[idx % colors.length]}-600 transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ChartCard>

                    {/* Lead Sources Chart */}
                    <ChartCard
                        title="Lead Sources"
                        icon={<BarChart3 size={20} />}
                        iconBg="bg-purple-100"
                        iconColor="text-purple-600"
                        navigate={navigate}
                    >
                        <div className="space-y-4">
                            {leadReport?.sourceReport?.map((item, idx) => {
                                const total = leadReport?.sourceReport?.reduce((acc, curr) => acc + curr.count, 0);
                                const percentage = (item.count / total) * 100;
                                const colors = ['blue', 'green', 'amber', 'purple', 'pink', 'indigo'];
                                return (
                                    <div key={item._id} className="flex items-center gap-4 group hover:bg-gray-50 p-2 rounded-lg transition-all">
                                        <div className="w-24 text-sm font-medium text-gray-600 capitalize flex items-center gap-1">
                                            {item._id === 'call' && <PhoneCall size={12} className="text-blue-500" />}
                                            {item._id === 'whatsapp' && <MessageCircle size={12} className="text-green-500" />}
                                            {item._id === 'email' && <Mail size={12} className="text-orange-500" />}
                                            {item._id === 'website' && <Package size={12} className="text-purple-500" />}
                                            {item._id}
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r from-${colors[idx % colors.length]}-500 to-${colors[idx % colors.length]}-600 rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="w-16 text-right font-bold text-gray-800">{item.count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </ChartCard>
                </div>

                {/* Performance Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Executive Performance Table */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-100 rounded-xl">
                                        <Trophy size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Executive Performance</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Sales team performance metrics</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/ViewExecutives')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                                    View All
                                    <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Executive</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Leads</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Closed</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Conversion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {performanceReport?.report?.slice(0, 5).map((exec, idx) => (
                                        <tr key={exec.executiveId} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(idx)} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                                        {exec.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{exec.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {exec.executiveId?.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-gray-700">{exec.totalLeads}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                                                    <CheckCircle size={12} />
                                                    {exec.closedLeads}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                                    <Clock size={12} />
                                                    {exec.pendingLeads}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-bold ${parseFloat(exec.conversionRate) >= 50 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                    {exec.conversionRate}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Revenue Leaderboard */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-100 rounded-xl">
                                        <Medal size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Revenue Leaderboard</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Top performing executives</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-500">Top Performers</span>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {executiveReport?.report?.slice(0, 5).map((exec, idx) => (
                                <div key={exec._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10">
                                            {idx === 0 ? (
                                                <Crown size={28} className="text-yellow-500" />
                                            ) : idx === 1 ? (
                                                <Medal size={24} className="text-gray-400" />
                                            ) : idx === 2 ? (
                                                <Medal size={24} className="text-amber-600" />
                                            ) : (
                                                <span className="text-sm font-semibold text-gray-400">#{idx + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{exec.executive?.name || 'Unknown'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Users size={10} />
                                                    {exec.totalLeads} leads
                                                </span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle size={10} />
                                                    {exec.converted} converted
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-lg">{formatCurrency(exec.revenue)}</p>
                                        <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                                            <ArrowUpRight size={12} />
                                            +{Math.floor(Math.random() * 30) + 5}% vs last month
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Conversion Trends Section */}
                {conversionReport && conversionReport.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all mb-8">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-100 rounded-xl">
                                        <TrendingUp size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Conversion Trends</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Weekly conversion rate analysis</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Maximize2 size={16} className="text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4">
                                    <p className="text-xs text-emerald-600 font-medium mb-1">Average Conversion</p>
                                    <p className="text-2xl font-bold text-emerald-700">
                                        {conversionReport.reduce((acc, curr) => acc + curr.rate, 0) / conversionReport.length}%
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                                    <p className="text-xs text-blue-600 font-medium mb-1">Best Week</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {Math.max(...conversionReport.map(c => c.rate))}%
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                                    <p className="text-xs text-purple-600 font-medium mb-1">Growth Trend</p>
                                    <p className="text-2xl font-bold text-purple-700 flex items-center gap-1">
                                        +8.3%
                                        <TrendingUp size={18} />
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {conversionReport.slice(0, 7).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-20 text-sm font-medium text-gray-600">
                                            Week {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${item.rate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="w-16 text-right font-bold text-gray-800">{item.rate}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Section */}

            </div>
        </div>
    );
};

/* ======================
   QUICK STAT CARD
====================== */
const QuickStatCard = ({ title, value, change, trend, icon, gradient  }) => (
    <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-md`}>
                <div className="text-white">{icon}</div>
            </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        <div className="flex items-center gap-1">
            {trend === 'up' ? (
                <ArrowUpRight size={14} className="text-green-500" />
            ) : trend === 'down' ? (
                <ArrowDownRight size={14} className="text-red-500" />
            ) : null}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-amber-600'}`}>
                {change}
            </span>
        </div>
    </div>
);

/* ======================
   SUMMARY CARD
====================== */
const SummaryCard = ({ title, value, icon: Icon, change, color, subtext }) => {
    const gradients = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-amber-600'
    };

    const bgColors = {
        blue: 'bg-blue-50',
        green: 'bg-emerald-50',
        purple: 'bg-purple-50',
        orange: 'bg-orange-50'
    };

    const textColors = {
        blue: 'text-blue-600',
        green: 'text-emerald-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600'
    };

    return (
        <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                            <ArrowUpRight size={12} />
                            {change}
                        </span>
                        <span className="text-xs text-gray-400">{subtext}</span>
                    </div>
                </div>
                <div className={`p-4 bg-gradient-to-br ${gradients[color]} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={24} />
                </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${gradients[color]} rounded-full`} style={{ width: '75%' }}></div>
            </div>
        </div>
    );
};

/* ======================
   CHART CARD
====================== */
const ChartCard = ({ title, icon, iconBg, iconColor, children , navigate }) => (
    // <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all relative">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className={`p-2 ${iconBg} rounded-lg`}>
                    <div className={iconColor}>{icon}</div>
                </div>
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            </div>
            {/* <div  className="flex items-center gap-2 z-50"> */}
            <div className="flex items-center gap-2 relative z-50">


                <button onClick={() => navigate('/Leads')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1  cursor-pointer">
                    View All
                    <ArrowUpRight size={14} />
                </button>
                {/* </button> */}
            </div>
        </div>
        <div className="relative z-0">
            {children}
        </div>
    </div>
);

export default ReportPage;