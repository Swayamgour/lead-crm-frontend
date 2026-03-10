import React from "react";
import { Users, TrendingUp, Clock, Target } from "lucide-react";

function Dashboard() {

    const stats = [

        {
            title: "Total Leads",
            value: 156,
            icon: Users,
            color: "bg-blue-100 text-blue-600"
        },

        {
            title: "Pipeline Leads",
            value: 72,
            icon: TrendingUp,
            color: "bg-yellow-100 text-yellow-600"
        },

        {
            title: "Follow-ups Today",
            value: 5,
            icon: Clock,
            color: "bg-orange-100 text-orange-600"
        },

        {
            title: "Converted Leads",
            value: 28,
            icon: Target,
            color: "bg-green-100 text-green-600"
        }

    ]

    return (

        <div className="p-6">

            <h1 className="text-2xl font-semibold mb-6">
                CRM Dashboard
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                {stats.map((item, index) => {

                    const Icon = item.icon

                    return (

                        <div key={index} className="bg-white p-5 rounded-xl shadow">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-gray-500">
                                        {item.title}
                                    </p>

                                    <p className="text-2xl font-semibold mt-1">
                                        {item.value}
                                    </p>

                                </div>

                                <div className={`p-3 rounded-lg ${item.color}`}>
                                    <Icon size={20} />
                                </div>

                            </div>

                        </div>

                    )

                })}

            </div>

        </div>

    )

}

export default Dashboard