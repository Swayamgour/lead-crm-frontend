import React from "react";
import { Calendar, X } from "lucide-react";

// Local YYYY-MM-DD (avoids UTC offset issues from toISOString)
const toLocalISODate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const DATE_PRESETS = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom Range" },
];

// Returns { startDate, endDate } as YYYY-MM-DD strings for a given preset
export function getPresetRange(preset) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
        case "today":
            return { startDate: toLocalISODate(startOfToday), endDate: toLocalISODate(startOfToday) };

        case "yesterday": {
            const y = new Date(startOfToday);
            y.setDate(y.getDate() - 1);
            return { startDate: toLocalISODate(y), endDate: toLocalISODate(y) };
        }

        case "week": {
            const day = startOfToday.getDay(); // 0 = Sunday
            const diffToMonday = day === 0 ? 6 : day - 1;
            const monday = new Date(startOfToday);
            monday.setDate(monday.getDate() - diffToMonday);
            return { startDate: toLocalISODate(monday), endDate: toLocalISODate(startOfToday) };
        }

        case "month": {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: toLocalISODate(first), endDate: toLocalISODate(startOfToday) };
        }

        default:
            return { startDate: "", endDate: "" };
    }
}

// Checks whether a given date value falls within [startDate, endDate] (inclusive, YYYY-MM-DD strings)
export function isWithinRange(dateValue, startDate, endDate) {
    if (!dateValue) return false;
    if (!startDate && !endDate) return true;

    const d = new Date(dateValue);
    if (isNaN(d)) return false;
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (startDate) {
        const [sy, sm, sd] = startDate.split("-").map(Number);
        if (dOnly < new Date(sy, sm - 1, sd)) return false;
    }
    if (endDate) {
        const [ey, em, ed] = endDate.split("-").map(Number);
        if (dOnly > new Date(ey, em - 1, ed)) return false;
    }
    return true;
}

/**
 * Controlled quick date filter.
 * value: { preset: 'all'|'today'|'yesterday'|'week'|'month'|'custom', startDate, endDate }
 * onChange: (nextValue) => void
 */
export default function DateQuickFilter({ value, onChange, compact = false, className = "" }) {
    const { preset = "all", startDate = "", endDate = "" } = value || {};

    const handlePreset = (p) => {
        if (p === "custom") {
            onChange({ preset: "custom", startDate, endDate });
            return;
        }
        onChange({ preset: p, ...getPresetRange(p) });
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {DATE_PRESETS.map((p) => (
                <button
                    key={p.value}
                    type="button"
                    onClick={() => handlePreset(p.value)}
                    className={`px-3 ${compact ? "py-1" : "py-1.5"} rounded-xl text-xs font-medium transition-all whitespace-nowrap ${preset === p.value
                        ? "bg-gradient-to-r from-[#2653ef] to-[#1d40c9] text-white shadow-[0_4px_10px_rgba(38,83,239,0.25)]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    {p.label}
                </button>
            ))}

            {preset === "custom" && (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onChange({ preset: "custom", startDate: e.target.value, endDate })}
                            className="pl-7 pr-2 py-1.5 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2653ef] text-xs bg-gray-50"
                        />
                    </div>
                    <span className="text-xs text-gray-400">to</span>
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(e) => onChange({ preset: "custom", startDate, endDate: e.target.value })}
                            className="pl-7 pr-2 py-1.5 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2653ef] text-xs bg-gray-50"
                        />
                    </div>
                </div>
            )}

            {preset !== "all" && (
                <button
                    type="button"
                    onClick={() => onChange({ preset: "all", startDate: "", endDate: "" })}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear date filter"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
}
