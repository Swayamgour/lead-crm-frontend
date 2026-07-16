import { useState } from "react";
import {
    MessageSquare,
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    Upload,
    Loader2,
    Tag,
    Search,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    useGetWhatsappTemplatesQuery,
    useCreateWhatsappTemplateMutation,
    useUpdateWhatsappTemplateMutation,
    useDeleteWhatsappTemplateMutation,
    useDeleteWhatsappTemplateImageMutation,
} from "../redux/api";
import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";

const BASE_URL = "http://localhost:5009/api";

const VARIABLES = [
    "customerName", "phone", "product", "price",
    "quantity", "city", "budget", "company", "assignedTo", "date",
];

// Image upload is done with a plain fetch (not RTK Query) so the
// browser can set the correct multipart/form-data boundary itself.
const uploadTemplateImages = async (templateId, files) => {
    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await fetch(`${BASE_URL}/whatsapp/templates/${templateId}/images`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.message || "Image upload failed");
    }

    return data;
};

const emptyForm = { name: "", category: "General", message: "", isActive: true };

function WhatsappTemplates() {
    const { data, isLoading, refetch } = useGetWhatsappTemplatesQuery();
    const [createTemplate] = useCreateWhatsappTemplateMutation();
    const [updateTemplate] = useUpdateWhatsappTemplateMutation();
    const [deleteTemplate] = useDeleteWhatsappTemplateMutation();
    const [deleteImage] = useDeleteWhatsappTemplateImageMutation();

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const templates = data?.data || [];
    const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setPendingFiles([]);
        setShowModal(true);
    };

    const openEdit = (template) => {
        setEditingId(template._id);
        setForm({
            name: template.name,
            category: template.category || "General",
            message: template.message,
            isActive: template.isActive,
        });
        setPendingFiles([]);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm);
        setPendingFiles([]);
    };

    const insertVariable = (variable) => {
        setForm((prev) => ({
            ...prev,
            message: `${prev.message}{{${variable}}}`,
        }));
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.message.trim()) {
            toast.error("Name aur message required hai");
            return;
        }

        setSaving(true);

        try {
            let templateId = editingId;

            if (editingId) {
                await updateTemplate({ id: editingId, ...form }).unwrap();
            } else {
                const created = await createTemplate(form).unwrap();
                templateId = created?.data?._id;
            }

            if (templateId && pendingFiles.length > 0) {
                setUploading(true);
                await uploadTemplateImages(templateId, pendingFiles);
                setUploading(false);
            }

            toast.success(editingId ? "Template updated" : "Template created");
            refetch();
            closeModal();
        } catch (err) {
            toast.error(err?.data?.message || err.message || "Failed to save template");
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            await deleteTemplate(deleteTarget._id).unwrap();
            toast.success("Template deleted");
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete template");
        }
    };

    const handleDeleteImage = async (templateId, imageId) => {
        try {
            await deleteImage({ id: templateId, imageId }).unwrap();
            toast.success("Image removed");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to remove image");
        }
    };

    if (isLoading) {
        return <Loading data="WhatsApp Templates" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <MessageSquare className="text-green-600" size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">WhatsApp Templates</h1>
                            <p className="text-sm text-gray-500">
                                Reusable messages with {"{{variables}}"} for sending to leads
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-all"
                    >
                        <Plus size={18} />
                        New Template
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No templates yet. Create your first one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((template) => (
                            <div
                                key={template._id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                            >
                                {template.images?.length > 0 && (
                                    <div className="flex gap-1 p-3 pb-0 flex-wrap">
                                        {template.images.map((img) => (
                                            <div key={img._id} className="relative group">
                                                <img
                                                    src={img.url}
                                                    alt=""
                                                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    onClick={() => handleDeleteImage(template._id, img._id)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-4 flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${template.isActive
                                                ? "bg-green-100 text-green-600"
                                                : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            {template.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                        <Tag size={12} />
                                        {template.category || "General"}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">
                                        {template.message}
                                    </p>
                                </div>

                                <div className="flex border-t border-gray-100">
                                    <button
                                        onClick={() => openEdit(template)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(template)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-l border-gray-100"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between sticky top-0">
                            <h3 className="text-lg font-semibold text-white">
                                {editingId ? "Edit Template" : "New Template"}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g. Follow Up Reminder"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                                <input
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g. Follow Up"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                    placeholder="Hi {{customerName}}, ..."
                                />

                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {VARIABLES.map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => insertVariable(v)}
                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 transition-colors"
                                        >
                                            {`{{${v}}}`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Images (optional)
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 cursor-pointer hover:border-green-400 transition-colors">
                                    <Upload size={16} />
                                    {pendingFiles.length > 0
                                        ? `${pendingFiles.length} file(s) selected`
                                        : "Choose images"}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => setPendingFiles(Array.from(e.target.files || []))}
                                    />
                                </label>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="rounded"
                                />
                                Active
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || uploading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
                                >
                                    {saving || uploading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {uploading ? "Uploading images..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={!!deleteTarget}
                title="Delete Template"
                message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                type="delete"
            />
        </div>
    );
}

export default WhatsappTemplates;
