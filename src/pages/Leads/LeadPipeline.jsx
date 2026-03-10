import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
    Users,
    Phone,
    Mail,
    Calendar,
    Clock,
    TrendingUp,
    DollarSign,
    Tag,
    UserPlus,
    Filter,
    Search,
    MoreVertical,
    Edit3,
    Trash2,
    Copy,
    Eye,
    Star,
    MessageCircle,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronRight,
    Plus,
    Settings,
    RefreshCw,
    Download,
    Upload,
    Maximize2,
    Minimize2,
    Grid,
    List
} from "lucide-react";

const initialData = {
    "New Lead": [
        { id: "1", name: "Rajesh Kumar", product: "Dining Table", value: "₹45,000", priority: "High", avatar: "RK", color: "bg-blue-500" },
        { id: "2", name: "Amit Sharma", product: "Sofa Set", value: "₹85,000", priority: "Medium", avatar: "AS", color: "bg-green-500" },
        { id: "8", name: "Sunil Verma", product: "Office Chair", value: "₹12,000", priority: "Low", avatar: "SV", color: "bg-purple-500" },
    ],
    Contacted: [
        { id: "3", name: "Priya Singh", product: "Wardrobe", value: "₹65,000", priority: "High", avatar: "PS", color: "bg-orange-500" },
        { id: "9", name: "Anjali Gupta", product: "Coffee Table", value: "₹25,000", priority: "Medium", avatar: "AG", color: "bg-pink-500" },
    ],
    "Requirement Identified": [
        { id: "10", name: "Vikram Mehta", product: "King Size Bed", value: "₹95,000", priority: "High", avatar: "VM", color: "bg-indigo-500" },
    ],
    "Quotation Sent": [
        { id: "4", name: "Neha Kapoor", product: "Modular Kitchen", value: "₹2,50,000", priority: "High", avatar: "NK", color: "bg-red-500" },
    ],
    "Follow-Up": [
        { id: "5", name: "Rahul Gupta", product: "TV Unit", value: "₹35,000", priority: "Medium", avatar: "RG", color: "bg-yellow-500" },
    ],
    Won: [
        { id: "6", name: "Sneha Reddy", product: "Complete Home Set", value: "₹5,50,000", priority: "High", avatar: "SR", color: "bg-emerald-500" },
    ],
    Lost: [
        { id: "7", name: "Manoj Yadav", product: "Study Table", value: "₹8,000", priority: "Low", avatar: "MY", color: "bg-gray-500" },
    ],
};

const stageColors = {
    "New Lead": { bg: "bg-blue-50", header: "bg-blue-600", text: "text-blue-600", border: "border-blue-200" },
    "Contacted": { bg: "bg-purple-50", header: "bg-purple-600", text: "text-purple-600", border: "border-purple-200" },
    "Requirement Identified": { bg: "bg-indigo-50", header: "bg-indigo-600", text: "text-indigo-600", border: "border-indigo-200" },
    "Quotation Sent": { bg: "bg-orange-50", header: "bg-orange-600", text: "text-orange-600", border: "border-orange-200" },
    "Follow-Up": { bg: "bg-yellow-50", header: "bg-yellow-600", text: "text-yellow-600", border: "border-yellow-200" },
    "Won": { bg: "bg-green-50", header: "bg-green-600", text: "text-green-600", border: "border-green-200" },
    "Lost": { bg: "bg-red-50", header: "bg-red-600", text: "text-red-600", border: "border-red-200" },
};

const priorityColors = {
    High: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
    Medium: { bg: "bg-yellow-100", text: "text-yellow-600", dot: "bg-yellow-500" },
    Low: { bg: "bg-green-100", text: "text-green-600", dot: "bg-green-500" },
};

function LeadPipeline() {
    const [pipeline, setPipeline] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("list"); // grid or list
    const [selectedLead, setSelectedLead] = useState(null);
    const [showStats, setShowStats] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [filterPriority, setFilterPriority] = useState("all");

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        const sourceColumn = pipeline[source.droppableId];
        const destColumn = pipeline[destination.droppableId];

        const sourceItems = [...sourceColumn];
        const destItems = [...destColumn];

        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);

        setPipeline({
            ...pipeline,
            [source.droppableId]: sourceItems,
            [destination.droppableId]: destItems,
        });
    };

    const getStageStats = () => {
        const stats = {};
        Object.entries(pipeline).forEach(([stage, leads]) => {
            const totalValue = leads.reduce((sum, lead) => {
                const value = parseInt(lead.value.replace(/[^0-9]/g, '')) || 0;
                return sum + value;
            }, 0);
            stats[stage] = {
                count: leads.length,
                value: totalValue
            };
        });
        return stats;
    };

    const stats = getStageStats();

    const filteredPipeline = Object.entries(pipeline).reduce((acc, [stage, leads]) => {
        const filteredLeads = leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.product.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPriority = filterPriority === "all" || lead.priority === filterPriority;
            return matchesSearch && matchesPriority;
        });
        if (filteredLeads.length > 0) {
            acc[stage] = filteredLeads;
        }
        return acc;
    }, {});

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const totalLeads = Object.values(pipeline).flat().length;
    const totalValue = Object.values(pipeline).flat().reduce((sum, lead) => {
        const value = parseInt(lead.value.replace(/[^0-9]/g, '')) || 0;
        return sum + value;
    }, 0);

    return (
        <div className={`p-4 md:p-6 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="text-blue-600" size={28} />
                            Lead Pipeline
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Drag and drop leads to update their stage
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                       

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>

                        {/* Actions */}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <RefreshCw size={18} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {showStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
                        {Object.entries(stats).map(([stage, data]) => (
                            <div key={stage} className={`${stageColors[stage].bg} rounded-lg p-3 border ${stageColors[stage].border}`}>
                                <p className={`text-xs font-medium ${stageColors[stage].text}`}>{stage}</p>
                                <p className="text-lg font-bold text-gray-800">{data.count}</p>
                                <p className="text-xs text-gray-600">₹{(data.value / 100000).toFixed(1)}L</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads by name or product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Priorities</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                    </select>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                {/* Summary */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <Users size={16} />
                        Total Leads: {totalLeads}
                    </span>
                    <span className="flex items-center gap-1">
                        <DollarSign size={16} />
                        Pipeline Value: ₹{(totalValue / 100000).toFixed(1)}L
                    </span>
                </div>
            </div>

            {/* Pipeline Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className={`
                    ${viewMode === "grid"
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4'
                        : 'flex flex-col gap-4'
                    }
                `}>
                    {Object.entries(filteredPipeline).map(([stage, leads]) => (
                        <Droppable droppableId={stage} key={stage}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`
                                        rounded-xl transition-all duration-200
                                        ${viewMode === "grid"
                                            ? stageColors[stage].bg
                                            : 'w-full'
                                        }
                                        ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                                    `}
                                >
                                    {/* Stage Header */}
                                    <div className={`
                                        flex items-center justify-between p-3 rounded-t-xl
                                        ${stageColors[stage].header} text-white
                                    `}>
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-semibold text-sm">{stage}</h2>
                                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                                {leads.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button className="p-1 hover:bg-white/20 rounded transition-colors">
                                                <Plus size={14} />
                                            </button>
                                            <button className="p-1 hover:bg-white/20 rounded transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stage Content */}
                                    <div className={`
                                        p-3 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto
                                        ${viewMode === "grid" ? '' : 'flex flex-wrap gap-2'}
                                    `}>
                                        {leads.map((lead, index) => (
                                            <Draggable
                                                key={lead.id}
                                                draggableId={lead.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`
                                                            bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                                                            ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''}
                                                            ${viewMode === "grid" ? 'w-full' : 'w-64 inline-block'}
                                                            cursor-grab active:cursor-grabbing
                                                            group relative
                                                        `}
                                                        onClick={() => setSelectedLead(lead)}
                                                    >
                                                        {/* Priority Indicator */}
                                                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${priorityColors[lead.priority].dot}`} />

                                                        {/* Lead Content */}
                                                        <div className="p-3">
                                                            <div className="flex items-start gap-2">
                                                                <div className={`
                                                                    w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0
                                                                    ${lead.color}
                                                                `}>
                                                                    {getInitials(lead.name)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm text-gray-800 truncate">
                                                                        {lead.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {lead.product}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {lead.value}
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[lead.priority].bg} ${priorityColors[lead.priority].text}`}>
                                                                    {lead.priority}
                                                                </span>
                                                            </div>

                                                            {/* Quick Actions */}
                                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                                                                <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                                                                    <Eye size={14} />
                                                                </button>
                                                                <button className="p-1 hover:bg-green-100 rounded text-green-600">
                                                                    <MessageCircle size={14} />
                                                                </button>
                                                                <button className="p-1 hover:bg-purple-100 rounded text-purple-600">
                                                                    <Edit3 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>

                                    {/* Stage Footer */}
                                    <div className="p-2 border-t border-gray-200 bg-white/50 rounded-b-xl">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Total: {leads.length}</span>
                                            <span>Value: ₹{stats[stage].value.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* Lead Detail Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Lead Details</h3>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-16 h-16 ${selectedLead.color} rounded-xl flex items-center justify-center text-white font-bold text-2xl`}>
                                    {getInitials(selectedLead.name)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold">{selectedLead.name}</h4>
                                    <p className="text-gray-500">{selectedLead.product}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Value</p>
                                    <p className="font-semibold">{selectedLead.value}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Priority</p>
                                    <p className={`font-semibold ${priorityColors[selectedLead.priority].text}`}>
                                        {selectedLead.priority}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <Phone size={16} />
                                    Call
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <MessageCircle size={16} />
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeadPipeline;