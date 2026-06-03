// frontend/src/pages/admin/Banners.jsx
import React, { useState } from 'react';
import {
    useGetBannersQuery,
    useCreateBannerMutation,
    useUpdateBannerMutation,
    useDeleteBannerMutation
} from '../redux/api';
import {
    Image,
    Plus,
    Edit2,
    Trash2,
    Search,
    RefreshCw,
    X,
    Save,
    Upload,
    Eye,
    EyeOff,
    ChevronUp,
    ChevronDown,
    Monitor,
    Smartphone,
    Link as LinkIcon,
    Type,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';

const Banners = () => {
    // State
    const [search, setSearch] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state - stores File objects, not uploaded URLs
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        position: 0,
        status: true,
        image: null,      // File object
        mobileImage: null, // File object
        existingImage: '',    // For edit mode - existing image URL
        existingMobileImage: '' // For edit mode - existing mobile image URL
    });

    // Preview URLs for displaying selected images
    const [previewImage, setPreviewImage] = useState(null);
    const [previewMobileImage, setPreviewMobileImage] = useState(null);

    // API Hooks
    const { data, isLoading, refetch } = useGetBannersQuery();
    const [createBanner] = useCreateBannerMutation();
    const [updateBanner] = useUpdateBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();

    // Handle Delete
    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await deleteBanner(deleteConfirmId).unwrap();
            toast.success('Banner deleted successfully');
            refetch();
            setDeleteConfirmId(null);
        } catch (error) {
            toast.error(error.data?.message || 'Delete failed');
        }
    };

    // Handle file selection - only set state, no upload
    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        if (type === 'image') {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, mobileImage: file }));
            setPreviewMobileImage(URL.createObjectURL(file));
        }

        toast.success(`${type === 'image' ? 'Desktop' : 'Mobile'} image selected`);
        e.target.value = ''; // Clear input
    };

    // Remove selected image
    const removeImage = (type) => {
        if (type === 'image') {
            setFormData(prev => ({ ...prev, image: null }));
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
                setPreviewImage(null);
            }
            toast.success('Desktop image removed');
        } else {
            setFormData(prev => ({ ...prev, mobileImage: null }));
            if (previewMobileImage) {
                URL.revokeObjectURL(previewMobileImage);
                setPreviewMobileImage(null);
            }
            toast.success('Mobile image removed');
        }
    };

    // Remove existing image (for edit mode)
    const removeExistingImage = (type) => {
        if (type === 'image') {
            setFormData(prev => ({ ...prev, existingImage: '' }));
            toast.success('Desktop image will be removed on save');
        } else {
            setFormData(prev => ({ ...prev, existingMobileImage: '' }));
            toast.success('Mobile image will be removed on save');
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        setSelectedBanner(null);
        setFormData({
            title: '',
            subtitle: '',
            buttonText: '',
            buttonLink: '',
            position: 0,
            status: true,
            image: null,
            mobileImage: null,
            existingImage: '',
            existingMobileImage: ''
        });
        setPreviewImage(null);
        setPreviewMobileImage(null);
        setModalType('add');
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (banner) => {
        setSelectedBanner(banner);
        setFormData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            buttonText: banner.buttonText || '',
            buttonLink: banner.buttonLink || '',
            position: banner.position || 0,
            status: banner.status !== undefined ? banner.status : true,
            image: null,
            mobileImage: null,
            existingImage: banner.image || '',
            existingMobileImage: banner.mobileImage || ''
        });
        setPreviewImage(null);
        setPreviewMobileImage(null);
        setModalType('edit');
        setShowModal(true);
    };

    // Handle Form Submit - Upload images here
    const handleSubmit = async () => {
        // Validation
        if (!formData.title.trim()) {
            toast.error('Banner title is required');
            return;
        }

        // For add mode, image is required
        if (modalType === 'add' && !formData.image) {
            toast.error('Please select a desktop image');
            return;
        }

        // For edit mode, either existing image or new image is required
        if (modalType === 'edit' && !formData.existingImage && !formData.image) {
            toast.error('Please select a desktop image');
            return;
        }

        setSubmitting(true);

        try {
            // Create FormData for submission
            const submitFormData = new FormData();
            submitFormData.append('title', formData.title);
            submitFormData.append('subtitle', formData.subtitle || '');
            submitFormData.append('buttonText', formData.buttonText || '');
            submitFormData.append('buttonLink', formData.buttonLink || '');
            submitFormData.append('position', formData.position);
            submitFormData.append('status', formData.status);

            // Handle images
            if (formData.image) {
                submitFormData.append('image', formData.image);
            } else if (modalType === 'edit' && formData.existingImage) {
                submitFormData.append('existingImage', formData.existingImage);
            }

            if (formData.mobileImage) {
                submitFormData.append('mobileImage', formData.mobileImage);
            } else if (modalType === 'edit' && formData.existingMobileImage) {
                submitFormData.append('existingMobileImage', formData.existingMobileImage);
            }

            if (modalType === 'add') {
                await createBanner(submitFormData).unwrap();
                toast.success('Banner created successfully');
            } else {
                await updateBanner({ id: selectedBanner._id, formData: submitFormData }).unwrap();
                toast.success('Banner updated successfully');
            }

            setShowModal(false);
            refetch();

            // Cleanup preview URLs
            if (previewImage) URL.revokeObjectURL(previewImage);
            if (previewMobileImage) URL.revokeObjectURL(previewMobileImage);

        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle Status
    const toggleStatus = async (banner) => {
        try {
            const formData = new FormData();
            formData.append('status', !banner.status);
            await updateBanner({ id: banner._id, formData }).unwrap();
            toast.success(`Banner ${!banner.status ? 'activated' : 'deactivated'}`);
            refetch();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Update Position
    const updatePosition = async (id, newPosition) => {
        try {
            const formData = new FormData();
            formData.append('position', newPosition);
            await updateBanner({ id, formData }).unwrap();
            toast.success('Position updated');
            refetch();
        } catch (error) {
            toast.error('Failed to update position');
        }
    };

    const banners = data?.data || [];

    // Filter banners
    const filteredBanners = banners.filter(banner =>
        banner.title.toLowerCase().includes(search.toLowerCase()) ||
        banner.subtitle?.toLowerCase().includes(search.toLowerCase())
    );

    // Sort by position
    const sortedBanners = [...filteredBanners].sort((a, b) => a.position - b.position);

    if (isLoading && !data) {
        return <Loading text="Loading banners..." />;
    }

    return (
        <div className="banners-container">
            {/* Header */}
            <div className="banners-header">
                <div className="header-title">
                    <Image size={24} />
                    <h1>Banner Management</h1>
                </div>
                <button className="btn-add" onClick={openAddModal}>
                    <Plus size={18} />
                    Add Banner
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <Image size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{banners.length}</span>
                        <span className="stat-label">Total Banners</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <CheckCircle size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            {banners.filter(b => b.status).length}
                        </span>
                        <span className="stat-label">Active</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon inactive">
                        <EyeOff size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            {banners.filter(b => !b.status).length}
                        </span>
                        <span className="stat-label">Inactive</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search banners..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button className="btn-refresh" onClick={() => refetch()}>
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Banners Grid */}
            <div className="banners-grid">
                {sortedBanners.length === 0 ? (
                    <div className="empty-state">
                        <Image size={64} />
                        <h3>No banners found</h3>
                        <p>
                            {search ? "Try adjusting your search" : "Get started by adding your first banner"}
                        </p>
                        <button className="btn-add" onClick={openAddModal}>
                            <Plus size={18} />
                            Add Banner
                        </button>
                    </div>
                ) : (
                    sortedBanners.map((banner, index) => (
                        <div key={banner._id} className={`banner-card ${!banner.status ? 'inactive' : ''}`}>
                            {/* Position Controls */}
                            <div className="position-controls">
                                {index > 0 && (
                                    <button
                                        className="position-btn up"
                                        onClick={() => updatePosition(banner._id, banner.position - 1)}
                                        title="Move Up"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                )}
                                <span className="position-number">{banner.position}</span>
                                {index < sortedBanners.length - 1 && (
                                    <button
                                        className="position-btn down"
                                        onClick={() => updatePosition(banner._id, banner.position + 1)}
                                        title="Move Down"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Banner Images */}
                            <div className="banner-images">
                                <div className="image-container desktop">
                                    <img src={banner.image} alt={banner.title} />
                                    <span className="image-label">
                                        <Monitor size={12} />
                                        Desktop
                                    </span>
                                </div>
                                {banner.mobileImage && (
                                    <div className="image-container mobile">
                                        <img src={banner.mobileImage} alt={banner.title} />
                                        <span className="image-label">
                                            <Smartphone size={12} />
                                            Mobile
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Banner Content */}
                            <div className="banner-content">
                                <div className="banner-header">
                                    <h3 className="banner-title">{banner.title}</h3>
                                    <div className="status-badge" onClick={() => toggleStatus(banner)}>
                                        {banner.status ? (
                                            <span className="status active">
                                                <Eye size={12} />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="status inactive">
                                                <EyeOff size={12} />
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {banner.subtitle && (
                                    <p className="banner-subtitle">{banner.subtitle}</p>
                                )}

                                <div className="banner-meta">
                                    {banner.buttonText && (
                                        <div className="meta-item">
                                            <Type size={14} />
                                            <span>Button: {banner.buttonText}</span>
                                        </div>
                                    )}
                                    {banner.buttonLink && (
                                        <div className="meta-item">
                                            <LinkIcon size={14} />
                                            <span>{banner.buttonLink}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="banner-actions">
                                <button
                                    className="action-btn edit"
                                    onClick={() => openEditModal(banner)}
                                    title="Edit Banner"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => setDeleteConfirmId(banner._id)}
                                    title="Delete Banner"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Banner Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'add' ? 'Add New Banner' : 'Edit Banner'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Images Section */}
                            <div className="form-section">
                                <h3>Banner Images</h3>

                                {/* Desktop Image */}
                                <div className="form-group">
                                    <label>Desktop Image *</label>
                                    <div className="image-upload-area">
                                        {/* Show existing image for edit mode */}
                                        {modalType === 'edit' && formData.existingImage && !previewImage && (
                                            <div className="image-preview desktop">
                                                <img src={formData.existingImage} alt="Existing desktop banner" />
                                                <button
                                                    className="remove-image"
                                                    onClick={() => removeExistingImage('image')}
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <span className="existing-badge">Existing</span>
                                            </div>
                                        )}

                                        {/* Show preview of newly selected image */}
                                        {previewImage && (
                                            <div className="image-preview desktop">
                                                <img src={previewImage} alt="New desktop banner preview" />
                                                <button
                                                    className="remove-image"
                                                    onClick={() => removeImage('image')}
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <span className="new-badge">New</span>
                                            </div>
                                        )}

                                        {/* Upload button - only show if no existing image and no preview */}
                                        {(!formData.existingImage || previewImage) && !previewImage && modalType === 'edit' ? null : (
                                            <label className="upload-box">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileSelect(e, 'image')}
                                                />
                                                <Upload size={24} />
                                                <span>Select Desktop Image</span>
                                                <small>Recommended: 1920x600px (Max 5MB)</small>
                                            </label>
                                        )}

                                        {/* Show change button for edit mode with existing image */}
                                        {modalType === 'edit' && formData.existingImage && !previewImage && (
                                            <button
                                                type="button"
                                                className="change-image-btn"
                                                onClick={() => {
                                                    document.querySelector('input[type="file"][accept="image/*"]')?.click();
                                                }}
                                            >
                                                Change Image
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Image */}
                                <div className="form-group">
                                    <label>Mobile Image (Optional)</label>
                                    <div className="image-upload-area">
                                        {/* Show existing mobile image for edit mode */}
                                        {modalType === 'edit' && formData.existingMobileImage && !previewMobileImage && (
                                            <div className="image-preview mobile">
                                                <img src={formData.existingMobileImage} alt="Existing mobile banner" />
                                                <button
                                                    className="remove-image"
                                                    onClick={() => removeExistingImage('mobileImage')}
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <span className="existing-badge">Existing</span>
                                            </div>
                                        )}

                                        {/* Show preview of newly selected mobile image */}
                                        {previewMobileImage && (
                                            <div className="image-preview mobile">
                                                <img src={previewMobileImage} alt="New mobile banner preview" />
                                                <button
                                                    className="remove-image"
                                                    onClick={() => removeImage('mobileImage')}
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <span className="new-badge">New</span>
                                            </div>
                                        )}

                                        {/* Upload button */}
                                        {(!formData.existingMobileImage || previewMobileImage) && !previewMobileImage && modalType === 'edit' ? null : (
                                            <label className="upload-box small">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileSelect(e, 'mobileImage')}
                                                />
                                                <Upload size={24} />
                                                <span>Select Mobile Image</span>
                                                <small>Recommended: 750x600px (Max 5MB)</small>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Banner Content Section */}
                            <div className="form-section">
                                <h3>Banner Content</h3>

                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter banner title"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="Enter banner subtitle"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Button Text</label>
                                        <input
                                            type="text"
                                            value={formData.buttonText}
                                            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                            placeholder="e.g., Shop Now"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Button Link</label>
                                        <input
                                            type="text"
                                            value={formData.buttonLink}
                                            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                                            placeholder="/products or https://..."
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Position (Order)</label>
                                        <input
                                            type="number"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            min="0"
                                        />
                                        <small>Lower numbers appear first</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                            />
                                            <span>Active Banner</span>
                                        </label>
                                        <small>Inactive banners won't be shown on the website</small>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Section */}
                            {(previewImage || previewMobileImage || formData.existingImage || formData.existingMobileImage) && (
                                <div className="form-section">
                                    <h3>Preview</h3>
                                    <div className="preview-container">
                                        {(previewImage || formData.existingImage) && (
                                            <div className="preview-item">
                                                <label>Desktop Preview</label>
                                                <div className="preview-image desktop">
                                                    <img src={previewImage || formData.existingImage} alt="Preview" />
                                                </div>
                                            </div>
                                        )}
                                        {(previewMobileImage || formData.existingMobileImage) && (
                                            <div className="preview-item">
                                                <label>Mobile Preview</label>
                                                <div className="preview-image mobile">
                                                    <img src={previewMobileImage || formData.existingMobileImage} alt="Preview" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="info-box">
                                <AlertCircle size={16} />
                                <span>Images will be uploaded only when you click the Save button.</span>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {modalType === 'add' ? 'Create Banner' : 'Save Changes'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmId && (
                <ConfirmModal
                    open={!!deleteConfirmId}
                    title="Delete Banner"
                    message="Are you sure you want to delete this banner? This action cannot be undone."
                    onCancel={() => setDeleteConfirmId(null)}
                    onConfirm={handleDelete}
                    variant="danger"
                />
            )}

            <style jsx>{`
                .banners-container {
                    padding: 20px;
                    background: #f5f7fa;
                    min-height: 100vh;
                }

                /* Header */
                .banners-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    background: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .header-title h1 {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1a1a2e;
                    margin: 0;
                }

                .btn-add {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 20px;
                    background: #4f46e5;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-add:hover {
                    background: #4338ca;
                    transform: translateY(-1px);
                }

                /* Stats Cards */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-icon.total {
                    background: #eef2ff;
                    color: #4f46e5;
                }

                .stat-icon.active {
                    background: #ecfdf5;
                    color: #10b981;
                }

                .stat-icon.inactive {
                    background: #fef2f2;
                    color: #ef4444;
                }

                .stat-info {
                    flex: 1;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    display: block;
                    line-height: 1;
                }

                .stat-label {
                    font-size: 13px;
                    color: #64748b;
                }

                /* Filters */
                .filters-section {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    background: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .search-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                }

                .search-wrapper input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 14px;
                }

                .search-wrapper button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #94a3b8;
                }

                .btn-refresh {
                    padding: 8px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Banners Grid */
                .banners-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 20px;
                }

                .banner-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                    position: relative;
                }

                .banner-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .banner-card.inactive {
                    opacity: 0.7;
                }

                /* Position Controls */
                .position-controls {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    display: flex;
                    gap: 4px;
                    background: rgba(0,0,0,0.7);
                    padding: 4px;
                    border-radius: 20px;
                    z-index: 1;
                }

                .position-btn {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: white;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .position-btn.up:hover {
                    background: #4f46e5;
                    color: white;
                }

                .position-btn.down:hover {
                    background: #4f46e5;
                    color: white;
                }

                .position-number {
                    padding: 4px 8px;
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                }

                /* Banner Images */
                .banner-images {
                    display: flex;
                    gap: 2px;
                    background: #f1f5f9;
                }

                .image-container {
                    flex: 1;
                    position: relative;
                    aspect-ratio: 2/1;
                    overflow: hidden;
                }

                .image-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-label {
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* Banner Content */
                .banner-content {
                    padding: 16px;
                }

                .banner-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .banner-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                }

                .status-badge {
                    cursor: pointer;
                }

                .status {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                }

                .status.active {
                    background: #ecfdf5;
                    color: #059669;
                }

                .status.inactive {
                    background: #fef2f2;
                    color: #dc2626;
                }

                .banner-subtitle {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0 0 12px 0;
                }

                .banner-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #475569;
                    background: #f8fafc;
                    padding: 4px 8px;
                    border-radius: 6px;
                }

                /* Actions */
                .banner-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafbfc;
                }

                .action-btn {
                    flex: 1;
                    padding: 6px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .action-btn.edit {
                    background: #eef2ff;
                    color: #4f46e5;
                }

                .action-btn.edit:hover {
                    background: #4f46e5;
                    color: white;
                }

                .action-btn.delete {
                    background: #fef2f2;
                    color: #ef4444;
                }

                .action-btn.delete:hover {
                    background: #ef4444;
                    color: white;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 16px;
                }

                .empty-state svg {
                    color: #cbd5e1;
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    font-size: 18px;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }

                .empty-state p {
                    color: #64748b;
                    margin-bottom: 20px;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-container {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 85vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .modal-header h2 {
                    font-size: 20px;
                    margin: 0;
                    color: #1a1a2e;
                }

                .modal-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: #f1f5f9;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-body {
                    padding: 24px;
                }

                .form-section {
                    margin-bottom: 28px;
                }

                .form-section h3 {
                    font-size: 16px;
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #4f46e5;
                    display: inline-block;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 6px;
                }

                .form-group input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                }

                .form-group input:focus {
                    border-color: #4f46e5;
                }

                .form-group small {
                    display: block;
                    margin-top: 4px;
                    font-size: 11px;
                    color: #94a3b8;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }

                .checkbox-label input {
                    width: auto;
                }

                /* Image Upload */
                .image-upload-area {
                    margin-bottom: 16px;
                }

                .upload-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 32px;
                    border: 2px dashed #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #fafbfc;
                }

                .upload-box:hover {
                    border-color: #4f46e5;
                    background: #eef2ff;
                }

                .upload-box.small {
                    padding: 24px;
                }

                .upload-box input {
                    display: none;
                }

                .upload-box span {
                    font-size: 13px;
                    color: #64748b;
                }

                .upload-box small {
                    font-size: 11px;
                    color: #94a3b8;
                }

                .image-preview {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 12px;
                }

                .image-preview.desktop {
                    width: 100%;
                    max-height: 200px;
                }

                .image-preview.mobile {
                    width: 150px;
                    height: 150px;
                }

                .image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                }

                .remove-image {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 28px;
                    height: 28px;
                    background: #ef4444;
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .existing-badge, .new-badge {
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 500;
                }

                .existing-badge {
                    background: #4f46e5;
                    color: white;
                }

                .new-badge {
                    background: #10b981;
                    color: white;
                }

                .change-image-btn {
                    margin-top: 8px;
                    padding: 6px 12px;
                    background: #eef2ff;
                    border: none;
                    border-radius: 6px;
                    color: #4f46e5;
                    cursor: pointer;
                    font-size: 12px;
                }

                /* Preview Section */
                .preview-container {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .preview-item {
                    flex: 1;
                }

                .preview-item label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 8px;
                    display: block;
                }

                .preview-image {
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }

                .preview-image.desktop {
                    width: 100%;
                    max-height: 150px;
                }

                .preview-image.mobile {
                    width: 100px;
                    height: 100px;
                }

                .preview-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Info Box */
                .info-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: #eef2ff;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-size: 13px;
                    color: #4f46e5;
                }

                /* Spinner */
                .spinner-small {
                    width: 16px;
                    height: 16px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Modal Footer */
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                }

                .btn-cancel {
                    padding: 10px 20px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .btn-save {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: #4f46e5;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                }

                .btn-save:hover {
                    background: #4338ca;
                }

                .btn-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .banners-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .banner-images {
                        flex-direction: column;
                    }
                    
                    .image-container {
                        aspect-ratio: 2/1;
                    }
                }
            `}</style>
        </div>
    );
};

export default Banners;