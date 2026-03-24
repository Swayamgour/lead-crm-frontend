import { AlertCircle } from "lucide-react";

const ConfirmModal = ({
    open,
    title = "Confirm Action",
    message = "Are you sure?",
    onCancel,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    type = "delete" // 🔥 NEW
}) => {
    if (!open) return null;

    const isDelete = type === "delete";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">

                {/* Header */}
                <div
                    className={`px-6 py-4 ${isDelete
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <AlertCircle className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">{title}</h3>
                            <p className="text-sm text-white/90">
                                {isDelete ? "This action cannot be undone" : "Please confirm your action"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 mb-6">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            {cancelText}
                        </button>

                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50 ${isDelete
                                    ? "bg-gradient-to-r from-red-500 to-red-600"
                                    : "bg-gradient-to-r from-green-500 to-emerald-600"
                                }`}
                        >
                            {loading ? "Processing..." : confirmText}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ConfirmModal;