import React from "react";
import {
    Phone,
    Mail,
    Calendar,
    User,
    Tag,
    FileText
} from "lucide-react";
import { useGetExecutiveByIdQuery } from "../../redux/api";
import { useParams } from "react-router-dom";

function AssignLeadView() {

    const statusColors = {
        Incoming: "bg-blue-100 text-blue-700",
        Interested: "bg-green-100 text-green-700",
        Ongoing: "bg-purple-100 text-purple-700",
        Cold: "bg-gray-100 text-gray-700",
        Won: "bg-emerald-100 text-emerald-700",
        Lost: "bg-red-100 text-red-700"
    };

    const { id } = useParams()




    const { data, isSuccess } = useGetExecutiveByIdQuery(id)

    return (

        <div className="min-h-screen bg-transparent p-6">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] border border-gray-100 px-6 py-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2653ef] to-[#f5a524]" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2653ef] to-[#1d40c9] flex items-center justify-center shadow-[0_6px_16px_rgba(38,83,239,0.3)]">
                                <User className="text-white" size={22} />
                            </span>
                            Assigned Leads
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm ml-14">
                            View all leads assigned to the executive
                        </p>
                    </div>
                </div>

                {/* Lead Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {isSuccess && data?.map((lead) => (

                        <div
                            key={lead._id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)] transition-all"
                        >

                            {/* Top */}
                            <div className="flex justify-between items-start mb-3">

                                <div>

                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {lead.name}
                                    </h2>

                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${statusColors[lead.status]}`}
                                    >
                                        {lead.status}
                                    </span>

                                </div>

                                <span className="text-sm text-gray-400">
                                    {lead.source}
                                </span>

                            </div>

                            {/* Contact */}
                            <div className="space-y-2 text-sm text-gray-600">

                                <div className="flex items-center gap-2">
                                    <Phone size={15} />
                                    {lead.phone}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail size={15} />
                                    {lead.email}
                                </div>

                            </div>

                            {/* Followup */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">

                                <Calendar size={15} />

                                Follow Up :
                                {new Date(lead.followUpDate).toLocaleDateString()}

                            </div>

                            {/* Assigned */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">

                                <User size={15} />

                                Assigned :
                                {lead.assignedTo?.name}

                            </div>

                            {/* Expected Value */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">

                                <Tag size={15} />

                                Value : ₹{lead.expectedValue}

                            </div>

                            {/* Remark */}
                            {lead.remarks && (

                                <div
                                    className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
                                    dangerouslySetInnerHTML={{ __html: lead.remarks }}
                                />

                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-4">

                                <a
                                    href={`tel:${lead.phone}`}
                                    className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg"
                                >
                                    <Phone size={14} />
                                    Call
                                </a>

                                <a
                                    href={`mailto:${lead.email}`}
                                    className="flex items-center gap-1 text-sm bg-[#2653ef]/10 text-[#2653ef] px-3 py-1.5 rounded-lg"
                                >
                                    <Mail size={14} />
                                    Email
                                </a>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default AssignLeadView;