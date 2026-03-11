import React, { useState } from "react";
import {
    Clock,
    Search,
    ChevronDown,
    ChevronUp,
    User
} from "lucide-react";

import { useGetTimelineGroupedQuery } from "../../redux/api";

function LeadTimeline() {

    const { data, isLoading } = useGetTimelineGroupedQuery();

    const leadsTimeline = data || [];

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
       FILTER DATA
    ----------------------- */

    const filteredLeads = leadsTimeline?.map((leadBlock) => {

        const filteredTimeline = leadBlock.timeline.filter(item => {

            if (filterType !== "all" && item.type !== filterType) {
                return false;
            }

            if (searchTerm) {

                const text = searchTerm.toLowerCase();

                return (
                    item.title.toLowerCase().includes(text) ||
                    item.description.toLowerCase().includes(text) ||
                    item.createdBy?.toLowerCase().includes(text)
                );

            }

            return true;

        });

        return {
            ...leadBlock,
            timeline: filteredTimeline
        };

    }).filter(lead => lead.timeline.length > 0);

    /* -----------------------
       STATS
    ----------------------- */

    const stats = {

        total: leadsTimeline.reduce((acc, lead) => acc + lead.timeline.length, 0),

        leads: leadsTimeline.reduce(
            (acc, lead) =>
                acc + lead.timeline.filter(i => i.type === "lead_created").length,
            0
        ),

        updates: leadsTimeline.reduce(
            (acc, lead) =>
                acc + lead.timeline.filter(i => i.type === "lead_updated").length,
            0
        )

    };

    /* -----------------------
       LOADING
    ----------------------- */

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                <Clock className="animate-spin mr-2" size={18} />
                Loading timeline...
            </div>
        );
    }

    /* -----------------------
       UI
    ----------------------- */

    return (

        <div className="bg-white rounded-lg shadow border">

            {/* HEADER */}

            <div className="p-4 border-b">

                <div className="flex justify-between items-center">

                    <h2 className="text-lg font-semibold flex items-center gap-1.5">
                        <Clock className="text-blue-600" size={18} />
                        Lead Timeline
                    </h2>

                </div>

                {/* STATS - Compact */}

                <div className="grid grid-cols-3 gap-2 mt-3">

                    <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-xs text-blue-600">Total</p>
                        <p className="text-base font-bold">{stats.total}</p>
                    </div>

                    <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-xs text-green-600">Leads</p>
                        <p className="text-base font-bold">{stats.leads}</p>
                    </div>

                    <div className="bg-yellow-50 p-2 rounded text-center">
                        <p className="text-xs text-yellow-600">Updates</p>
                        <p className="text-base font-bold">{stats.updates}</p>
                    </div>

                </div>

                {/* SEARCH - Compact */}

                <div className="flex gap-2 mt-3">

                    <div className="flex-1 relative">

                        <Search
                            className="absolute left-2.5 top-2 text-gray-400"
                            size={14}
                        />

                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 text-sm border rounded"
                        />

                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border px-2 py-1.5 text-sm rounded w-32"
                    >
                        <option value="all">All</option>
                        <option value="lead_created">Lead</option>
                        <option value="lead_updated">Lead Update</option>
                        <option value="followup_created">FollowUp</option>
                        <option value="followup_updated">F/Up Update</option>
                    </select>

                </div>

            </div>

            {/* TIMELINE - Reduced height and spacing */}

            <div className="p-4 max-h-[500px] overflow-y-auto">

                {filteredLeads.map((leadBlock) => (

                    <div key={leadBlock._id} className="mb-4 last:mb-0">

                        {/* LEAD HEADER - More compact */}

                        <div className="bg-gray-50 p-3 rounded mb-3 border-l-4 border-blue-400">

                            <h3 className="font-medium text-base">
                                {leadBlock.lead.name}
                            </h3>

                            <p className="text-xs text-gray-500">
                                {leadBlock.lead.phone}
                            </p>

                        </div>

                        {/* TIMELINE ITEMS - Compact */}

                        <div className="space-y-2">

                            {leadBlock.timeline.map((item, index) => {

                                const { time } = formatDateTime(item.createdAt);

                                const uniqueId = leadBlock._id + index;

                                return (

                                    <div
                                        key={uniqueId}
                                        className="border rounded p-3 hover:bg-gray-50 transition"
                                    >

                                        <div
                                            className="flex justify-between cursor-pointer"
                                            onClick={() => toggleExpand(uniqueId)}
                                        >

                                            <div className="flex-1">

                                                <h4 className="font-medium text-sm text-gray-800">
                                                    {item.title}
                                                </h4>

                                                <p className="text-xs text-gray-600 line-clamp-1">
                                                    {item.description}
                                                </p>

                                                <div className="flex gap-3 text-xs text-gray-500 mt-1.5">

                                                    <span className="flex items-center gap-0.5">
                                                        <Clock size={10} />
                                                        {time}
                                                    </span>

                                                    <span className="flex items-center gap-0.5">
                                                        <User size={10} />
                                                        {item.createdBy || "System"}
                                                    </span>

                                                </div>

                                            </div>

                                            {expandedItems.includes(uniqueId)
                                                ? <ChevronUp size={16} className="text-gray-400" />
                                                : <ChevronDown size={16} className="text-gray-400" />
                                            }

                                        </div>

                                        {expandedItems.includes(uniqueId) && (

                                            <div className="mt-2 pt-2 border-t text-xs text-gray-600">

                                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                                    Type: {item.type.replace('_', ' ')}
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                ))}

                {filteredLeads.length === 0 && (

                    <div className="text-center py-8 text-sm text-gray-500">
                        No timeline data found
                    </div>

                )}

            </div>

            {/* FOOTER - Compact */}

            <div className="px-4 py-2 border-t text-xs text-gray-500 bg-gray-50 flex justify-between items-center">

                <span>
                    {stats.total} activities
                </span>

                {searchTerm && (
                    <span className="text-blue-600">
                        Filtered: {filteredLeads.reduce((acc, lead) => acc + lead.timeline.length, 0)} results
                    </span>
                )}

            </div>

        </div>

    );

}

export default LeadTimeline;