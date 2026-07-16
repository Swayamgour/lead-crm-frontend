import { useState, useMemo } from "react";
import {
    X,
    Send,
    MessageSquare,
    FileText,
    Image as ImageIcon,
    Check,
    CheckCheck,
    Clock,
    AlertCircle,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    useGetWhatsappTemplatesQuery,
    useSendWhatsAppTemplateMutation,
    useSendWhatsAppCustomMutation,
    useGetWhatsappLogsQuery,
} from "../redux/api";

// Fills {{variables}} in a template preview using the lead —
// mirrors what the backend does, just for a quick on-screen preview.
const previewMessage = (message, lead) => {
    if (!message) return "";

    const values = {
        customerName: lead?.name || "Customer",
        phone: lead?.phone || "",
        product: lead?.product || "",
        price: lead?.price != null ? String(lead.price) : "",
        quantity: lead?.quantity != null ? String(lead.quantity) : "",
        city: lead?.city || "",
        budget: lead?.expectedValue != null ? String(lead.expectedValue) : "",
        company: lead?.company || lead?.companyName || "",
        assignedTo: "",
        date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    };

    return message.replace(/{{\s*(\w+)\s*}}/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
    );
};

const StatusBadge = ({ status }) => {
    const map = {
        queued: { icon: Clock, cls: "bg-gray-100 text-gray-600" },
        sent: { icon: Check, cls: "bg-blue-100 text-blue-600" },
        delivered: { icon: CheckCheck, cls: "bg-indigo-100 text-indigo-600" },
        read: { icon: CheckCheck, cls: "bg-green-100 text-green-600" },
        failed: { icon: AlertCircle, cls: "bg-red-100 text-red-600" },
    };

    const entry = map[status] || map.queued;
    const Icon = entry.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${entry.cls}`}
        >
            <Icon size={12} />
            {status}
        </span>
    );
};

function WhatsAppSendModal({ lead, open, onClose }) {
    const [mode, setMode] = useState("template"); // "template" | "custom"
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [customMessage, setCustomMessage] = useState("");

    const { data: templatesData, isLoading: templatesLoading } =
        useGetWhatsappTemplatesQuery({ isActive: true }, { skip: !open });

    const {
        data: logsData,
        isLoading: logsLoading,
        refetch: refetchLogs,
    } = useGetWhatsappLogsQuery(lead?._id, { skip: !open || !lead?._id });

    const [sendTemplateMsg, { isLoading: sendingTemplate }] =
        useSendWhatsAppTemplateMutation();
    const [sendCustomMsg, { isLoading: sendingCustom }] =
        useSendWhatsAppCustomMutation();

    const templates = templatesData?.data || [];
    const logs = logsData?.data || [];

    const selectedTemplate = useMemo(
        () => templates.find((t) => t._id === selectedTemplateId),
        [templates, selectedTemplateId]
    );

    if (!open) return null;

    const handleSendTemplate = async () => {
        if (!selectedTemplateId) {
            toast.error("Pehle ek template select karo");
            return;
        }

        try {
            await sendTemplateMsg({
                leadId: lead._id,
                templateId: selectedTemplateId,
            }).unwrap();

            toast.success("WhatsApp message sent");
            setSelectedTemplateId("");
            refetchLogs();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to send message");
        }
    };

    const handleSendCustom = async () => {
        if (!customMessage.trim()) {
            toast.error("Message likho pehle");
            return;
        }

        try {
            await sendCustomMsg({
                leadId: lead._id,
                message: customMessage.trim(),
            }).unwrap();

            toast.success("WhatsApp message sent");
            setCustomMessage("");
            refetchLogs();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to send message");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Send WhatsApp
                        </h3>
                        <p className="text-sm text-white/90">
                            {lead?.name} · {lead?.phone || "No phone"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Mode tabs */}
                <div className="flex border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => setMode("template")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${mode === "template"
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <FileText size={16} />
                        Template
                    </button>
                    <button
                        onClick={() => setMode("custom")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${mode === "custom"
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <MessageSquare size={16} />
                        Custom Message
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {!lead?.phone && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            <AlertCircle size={16} />
                            This lead has no phone number saved.
                        </div>
                    )}

                    {mode === "template" ? (
                        <div className="space-y-4">
                            {templatesLoading ? (
                                <p className="text-sm text-gray-500">Loading templates...</p>
                            ) : templates.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No active templates found. Create one from WhatsApp Templates first.
                                </p>
                            ) : (
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select a template</option>
                                    {templates.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.name} {t.category ? `(${t.category})` : ""}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {selectedTemplate && (
                                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                                    {selectedTemplate.images?.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {selectedTemplate.images.map((img) => (
                                                <img
                                                    key={img._id}
                                                    src={img.url}
                                                    alt="template"
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {previewMessage(selectedTemplate.message, lead)}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleSendTemplate}
                                disabled={sendingTemplate || !lead?.phone || !selectedTemplateId}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {sendingTemplate ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                Send Template
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                rows={5}
                                placeholder={`Hi ${lead?.name || ""}, ...`}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            />

                            <button
                                onClick={handleSendCustom}
                                disabled={sendingCustom || !lead?.phone || !customMessage.trim()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {sendingCustom ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                Send Message
                            </button>
                        </div>
                    )}

                    {/* History */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Message History
                        </h4>

                        {logsLoading ? (
                            <p className="text-sm text-gray-500">Loading...</p>
                        ) : logs.length === 0 ? (
                            <p className="text-sm text-gray-400">No WhatsApp messages sent yet.</p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {logs.map((log) => (
                                    <div
                                        key={log._id}
                                        className="border border-gray-100 rounded-xl p-3 bg-white shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400">
                                                {new Date(log.createdAt).toLocaleString("en-IN")}
                                            </span>
                                            <StatusBadge status={log.status} />
                                        </div>

                                        {log.media?.length > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                <ImageIcon size={12} />
                                                {log.media.length} image(s)
                                            </div>
                                        )}

                                        {log.message && (
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {log.message}
                                            </p>
                                        )}

                                        {log.errorMessage && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {log.errorMessage}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WhatsAppSendModal;
