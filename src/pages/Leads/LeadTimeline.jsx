import React, { useState } from "react";
import {
    Clock,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    User
} from "lucide-react";

import { useGetTimelineQuery, useGetTimelineGroupedQuery } from "../../redux/api";

function LeadTimeline() {

    const { data, isLoading } = useGetTimelineQuery();
    const { data: grouped } = useGetTimelineGroupedQuery();

    // console.log(first)

    const timeline = data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [expandedItems, setExpandedItems] = useState([]);
    const [filterType, setFilterType] = useState("all");

    const toggleExpand = (id) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    /* -----------------------
       DATE FORMAT
    ----------------------- */

    const formatDateTime = (dateString) => {

        const d = new Date(dateString);

        return {
            date: d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            }),

            time: d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit"
            })
        };

    };

    /* -----------------------
       FILTER
    ----------------------- */

    const filteredTimeline = timeline.filter(item => {

        if (filterType !== "all" && item.type !== filterType) {
            return false;
        }

        if (searchTerm) {

            const text = searchTerm.toLowerCase();

            return (
                item.title.toLowerCase().includes(text) ||
                item.description.toLowerCase().includes(text) ||
                item.createdBy?.name?.toLowerCase().includes(text)
            );

        }

        return true;

    });

    /* -----------------------
       GROUP BY DATE
    ----------------------- */

    const groupedByDate = filteredTimeline.reduce((acc, item) => {

        const { date } = formatDateTime(item.date);

        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(item);

        return acc;

    }, {});

    /* -----------------------
       STATS
    ----------------------- */

    const stats = {

        total: timeline.length,

        leads: timeline.filter(i => i.type === "lead_created").length,

        updates: timeline.filter(i => i.type === "lead_updated").length

    };

    /* -----------------------
       LOADING
    ----------------------- */

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                Loading timeline...
            </div>
        );
    }

    /* -----------------------
       UI
    ----------------------- */

    return (

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

            {/* HEADER */}

            <div className="p-6 border-b">

                <div className="flex justify-between items-center">

                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="text-blue-600" size={22} />
                        Timeline
                    </h2>

                </div>

                {/* STATS */}

                <div className="grid grid-cols-3 gap-3 mt-4">

                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-blue-600">Total</p>
                        <p className="text-lg font-bold">{stats.total}</p>
                    </div>

                    <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-600">Leads</p>
                        <p className="text-lg font-bold">{stats.leads}</p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-xs text-yellow-600">Updates</p>
                        <p className="text-lg font-bold">{stats.updates}</p>
                    </div>

                </div>

                {/* SEARCH */}

                <div className="flex gap-3 mt-4">

                    <div className="flex-1 relative">

                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />

                        <input
                            type="text"
                            placeholder="Search timeline..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border rounded-lg"
                        />

                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="all">All</option>
                        <option value="lead_created">Lead Created</option>
                        <option value="lead_updated">Lead Updated</option>
                    </select>

                </div>

            </div>

            {/* TIMELINE */}

            <div className="p-6 max-h-[600px] overflow-y-auto">

                {Object.entries(groupedByDate).map(([date, items]) => (

                    <div key={date} className="mb-6">

                        {/* DATE HEADER */}

                        <div className="flex items-center gap-3 mb-4">

                            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg text-sm font-bold">
                                {new Date(date).getDate()}
                            </div>

                            <div>

                                <h3 className="font-semibold">{date}</h3>

                                <p className="text-xs text-gray-500">
                                    {items.length} activities
                                </p>

                            </div>

                        </div>

                        {/* ITEMS */}

                        <div className="space-y-3">

                            {items.map(item => {

                                const { time } = formatDateTime(item.date);

                                return (

                                    <div
                                        key={item._id}
                                        className="border rounded-lg p-4 hover:shadow transition"
                                    >

                                        <div
                                            className="flex justify-between cursor-pointer"
                                            onClick={() => toggleExpand(item._id)}
                                        >

                                            <div>

                                                <h4 className="font-semibold text-gray-800">
                                                    {item.title}
                                                </h4>

                                                <p className="text-sm text-gray-600">
                                                    {item.description}
                                                </p>

                                                <div className="flex gap-4 text-xs text-gray-500 mt-2">

                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {time}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <User size={12} />
                                                        {item.createdBy?.name || "System"}
                                                    </span>

                                                </div>

                                            </div>

                                            {expandedItems.includes(item._id)
                                                ? <ChevronUp size={18} />
                                                : <ChevronDown size={18} />
                                            }

                                        </div>

                                        {expandedItems.includes(item._id) && (

                                            <div className="mt-4 pt-3 border-t text-sm text-gray-600">

                                                <p><b>Status:</b> {item.status}</p>
                                                <p><b>Priority:</b> {item.priority}</p>

                                            </div>

                                        )}

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                ))}

                {filteredTimeline.length === 0 && (

                    <div className="text-center py-12 text-gray-500">
                        No timeline data found
                    </div>

                )}

            </div>

            {/* FOOTER */}

            <div className="p-4 border-t text-sm text-gray-500 flex justify-between">

                <span>
                    Showing {filteredTimeline.length} of {timeline.length}
                </span>

            </div>

        </div>

    );

}

export default LeadTimeline;