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

        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-gray-800">
                        Assigned Leads
                    </h1>

                    <p className="text-gray-500 text-sm">
                        View all leads assigned to the executive
                    </p>

                </div>

                {/* Lead Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {isSuccess && data?.map((lead) => (

                        <div
                            key={lead._id}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
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
                                    className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg"
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