// frontend/src/pages/admin/Products.jsx
import React, { useState, useEffect } from 'react';
import {
    useGetProductsQuery,
    useDeleteProductMutation,
    useCreateProductMutation,
    useUpdateProductMutation,
    useGetFlatListQuery
} from '../redux/api';
import {
    Package,
    Plus,
    Edit2,
    Trash2,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
    Archive,
    X,
    Save,
    PlusCircle,
    MinusCircle,
    Upload,
    Image as ImageIcon,
    Trash2 as TrashIcon,
    Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import './products.css';

const Products = () => {
    // State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        description: '',
        shortDescription: '',
        featured: false,
        status: 'draft',
        tags: [],
        featuredImage: '',
        featuredFile: null,
        galleryFiles: [],
        gallery: [],
        variants: [{
            sku: '',
            title: '',
            mrp: 0,
            sellingPrice: 0,
            stock: 0,
            attributes: {},
            status: 'active'
        }]
    });
    const [newTag, setNewTag] = useState('');

    // API Hooks
    const { data, isLoading, refetch } = useGetProductsQuery({
        page,
        limit: 15,
        search: debouncedSearch,
        status: statusFilter !== 'all' ? statusFilter : undefined
    });
    const { data: categoriesData } = useGetFlatListQuery();
    const [deleteProduct] = useDeleteProductMutation();
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Handle Delete
    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await deleteProduct(deleteConfirmId).unwrap();
            toast.success('Product deleted successfully');
            refetch();
            setDeleteConfirmId(null);
        } catch (error) {
            toast.error(error.data?.message || 'Delete failed');
        }
    };

    // Handle Status Change
    const handleStatusChange = async (id, status) => {
        try {
            const formDataObj = new FormData();
            formDataObj.append('status', status);
            await updateProduct({ id, formData: formDataObj }).unwrap();
            toast.success(`Product ${status} successfully`);
            refetch();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Handle Image Upload - Fixed version


    // Remove Image
    const removeImage = (imageUrl, isFeatured = false) => {
        if (isFeatured) {
            setFormData(prev => ({ ...prev, featuredImage: '' }));
            toast.success('Featured image removed');
        } else {
            setFormData(prev => ({
                ...prev,
                gallery: prev.gallery.filter(img => img !== imageUrl)
            }));
            toast.success('Image removed from gallery');
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        setSelectedProduct(null);
        setFormData({
            name: '',
            brand: '',
            category: '',
            description: '',
            shortDescription: '',
            featured: false,
            status: 'draft',
            tags: [],
            featuredImage: '',
            featuredFile: null,
            galleryFiles: [],
            gallery: [],
            variants: [{
                sku: '',
                title: '',
                mrp: 0,
                sellingPrice: 0,
                stock: 0,
                attributes: {},
                status: 'active'
            }]
        });
        setModalType('add');
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name || '',
            brand: product.brand || '',
            category: product.category?._id || product.category || '',
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            featured: product.featured || false,
            status: product.status || 'draft',
            tags: product.tags || [],
            featuredImage: product.featuredImage || '',
            gallery: product.gallery || [],
            galleryFiles: [],
            featuredFile: null,
            variants: product.variants || [{
                sku: '',
                title: '',
                mrp: 0,
                sellingPrice: 0,
                stock: 0,
                attributes: {},
                status: 'active'
            }]
        });
        setModalType('edit');
        setShowModal(true);
    };

    // Handle Form Submit
    const handleSubmit = async () => {

        if (!formData.name.trim()) {
            toast.error("Product name is required");
            return;
        }

        if (!formData.category) {
            toast.error("Category is required");
            return;
        }

        const submitData = new FormData();

        submitData.append(
            "name",
            formData.name
        );

        submitData.append(
            "brand",
            formData.brand || ""
        );

        submitData.append(
            "category",
            formData.category
        );

        submitData.append(
            "description",
            formData.description || ""
        );

        submitData.append(
            "shortDescription",
            formData.shortDescription || ""
        );

        submitData.append(
            "featured",
            formData.featured
        );

        submitData.append(
            "status",
            formData.status
        );

        submitData.append(
            "tags",
            JSON.stringify(formData.tags)
        );

        submitData.append(
            "variants",
            JSON.stringify(formData.variants)
        );

        // FEATURED IMAGE

        if (formData.featuredFile) {

            submitData.append(
                "images",
                formData.featuredFile
            );

        }

        // GALLERY IMAGES

        formData.galleryFiles.forEach(file => {

            submitData.append(
                "images",
                file
            );

        });

        try {

            if (modalType === "add") {

                await createProduct(
                    submitData
                ).unwrap();

                toast.success(
                    "Product created"
                );

            } else {

                await updateProduct({
                    id: selectedProduct._id,
                    formData: submitData
                }).unwrap();

                toast.success(
                    "Product updated"
                );

            }

            setShowModal(false);

            refetch();

        } catch (error) {

            toast.error(
                error?.data?.message ||
                "Operation failed"
            );

        }
    };

    // Variant Handlers
    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [
                ...formData.variants,
                {
                    sku: '',
                    title: '',
                    mrp: 0,
                    sellingPrice: 0,
                    stock: 0,
                    attributes: {},
                    status: 'active'
                }
            ]
        });
    };

    const removeVariant = (index) => {
        const newVariants = [...formData.variants];
        newVariants.splice(index, 1);
        setFormData({ ...formData, variants: newVariants });
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, newTag.trim()]
            });
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    const products = data?.data || [];
    const pagination = data?.pagination;
    const categories = categoriesData || [];

    if (isLoading && !data) {
        return <Loading text="Loading products..." />;
    }

    return (
        <div className="products-container">
            {/* Header */}
            <div className="products-header">
                <div className="header-title">
                    <Package size={24} />
                    <h1>Product Management</h1>
                </div>
                <button className="btn-add" onClick={openAddModal}>
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="filter-select"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>

                <button className="btn-refresh" onClick={() => refetch()}>
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Products Table */}
            <div className="table-wrapper">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Price Range</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="empty-row">
                                    <Package size={48} />
                                    <p>No products found</p>
                                    <button className="btn-add-small" onClick={openAddModal}>
                                        Add your first product
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => {
                                const minPrice = product.variants?.reduce(
                                    (min, v) => v.sellingPrice < min ? v.sellingPrice : min,
                                    Infinity
                                ) || 0;
                                const maxPrice = product.variants?.reduce(
                                    (max, v) => v.sellingPrice > max ? v.sellingPrice : max,
                                    0
                                ) || 0;
                                const totalStock = product.variants?.reduce(
                                    (sum, v) => sum + (v.stock || 0), 0
                                ) || 0;

                                return (
                                    <tr key={product._id}>
                                        <td className="image-cell">
                                            {product.featuredImage ? (
                                                <img src={product.featuredImage} alt={product.name} />
                                            ) : (
                                                <div className="image-placeholder">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="name-cell">
                                            <div className="product-name">{product.name}</div>
                                            {product.shortDescription && (
                                                <div className="product-short-desc">{product.shortDescription}</div>
                                            )}
                                        </td>
                                        <td>{product.brand || '—'}</td>
                                        <td>
                                            <span className="category-tag">
                                                {product.category?.name || '—'}
                                            </span>
                                        </td>
                                        <td>
                                            {minPrice === maxPrice ? (
                                                <span className="price">${minPrice.toFixed(2)}</span>
                                            ) : (
                                                <span className="price-range">
                                                    ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'in'}`}>
                                                {totalStock} units
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={product.status}
                                                onChange={(e) => handleStatusChange(product._id, e.target.value)}
                                                className={`status-select ${product.status}`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="draft">Draft</option>
                                                <option value="out_of_stock">Out of Stock</option>
                                            </select>
                                        </td>
                                        <td>
                                            {product.featured ? (
                                                <span className="featured-badge">Yes</span>
                                            ) : (
                                                <span className="not-featured">No</span>
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => openEditModal(product)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => setDeleteConfirmId(product._id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="page-btn"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <span className="page-info">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="page-btn"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'add' ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Images Section */}
                            <div className="form-section">
                                <h3>Product Images</h3>

                                {/* Featured Image */}
                                <div className="form-group">
                                    <label>Featured Image</label>
                                    <div className="image-upload-area">
                                        {formData.featuredImage ? (
                                            <div className="image-preview featured">
                                                <img src={formData.featuredImage} alt="Featured" />
                                                <button
                                                    className="remove-image"
                                                    onClick={() => removeImage(formData.featuredImage, true)}
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="upload-box">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    // onChange={(e) => handleImageUpload(e, true)}
                                                    onChange={(e) => {

                                                        const file = e.target.files[0];

                                                        if (!file) return;

                                                        setFormData(prev => ({
                                                            ...prev,
                                                            featuredFile: file,
                                                            featuredImage: URL.createObjectURL(file)
                                                        }));
                                                    }}
                                                // disabled={uploadingImages}
                                                />
                                                {/* {uploadingImages ? <Loader size={24} className="spinner" /> : <Upload size={24} />} */}
                                                <span>{uploadingImages ? 'Uploading...' : 'Upload Featured Image'}</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Gallery Images */}
                                <div className="form-group">
                                    <label>Gallery Images</label>
                                    <div className="gallery-grid">
                                        {formData.gallery.map((img, idx) => (
                                            <div key={idx} className="image-preview">
                                                <img src={img} alt={`Gallery ${idx + 1}`} />
                                                <button
                                                    className="remove-image"
                                                    onClick={() => removeImage(img, false)}
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="upload-box small">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                // onChange={(e) => handleImageUpload(e, false)}
                                                onChange={(e) => {

                                                    const files = Array.from(e.target.files);

                                                    setFormData(prev => ({
                                                        ...prev,

                                                        galleryFiles: [
                                                            ...prev.galleryFiles,
                                                            ...files
                                                        ],

                                                        gallery: [
                                                            ...prev.gallery,
                                                            ...files.map(file =>
                                                                URL.createObjectURL(file)
                                                            )
                                                        ]
                                                    }));
                                                }}
                                                disabled={uploadingImages}
                                            />
                                            {uploadingImages ? <Loader size={24} className="spinner" /> : <PlusCircle size={24} />}
                                            <span>Add Images</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="form-section">
                                <h3>Basic Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter product name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input
                                            type="text"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="Enter brand name"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">Select category</option>
                                            {categories?.map(cat => (
                                                <option key={cat._id} value={cat._id}>
                                                    {'—'.repeat((cat.level || 1) - 1)} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div> */}
                                </div>

                                <div className="form-group full-width">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        />
                                        <span>Featured Product</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label>Short Description</label>
                                    <input
                                        type="text"
                                        value={formData.shortDescription}
                                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                        placeholder="Brief description (shown in listings)"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Full Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detailed product description"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="form-section">
                                <h3>Tags</h3>
                                <div className="tags-input">
                                    <div className="tags-list">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="tag">
                                                {tag}
                                                <button onClick={() => removeTag(tag)}>
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="tag-add">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                            placeholder="Add tag..."
                                        />
                                        <button type="button" onClick={addTag}>
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="form-section">
                                <div className="section-header">
                                    <h3>Variants *</h3>
                                    <button type="button" className="btn-add-variant" onClick={addVariant}>
                                        <PlusCircle size={16} />
                                        Add Variant
                                    </button>
                                </div>

                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="variant-card">
                                        <div className="variant-header">
                                            <h4>Variant {index + 1}</h4>
                                            {formData.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-variant"
                                                    onClick={() => removeVariant(index)}
                                                >
                                                    <MinusCircle size={16} />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-row">
                                           
                                            <div className="form-group">
                                                <label>Title *</label>
                                                <input
                                                    type="text"
                                                    value={variant.title}
                                                    onChange={(e) => updateVariant(index, 'title', e.target.value)}
                                                    placeholder="e.g., 2kg, Large, Red"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>MRP ($)</label>
                                                <input
                                                    type="number"
                                                    value={variant.mrp}
                                                    onChange={(e) => updateVariant(index, 'mrp', parseFloat(e.target.value))}
                                                    placeholder="Original price"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Selling Price ($) *</label>
                                                <input
                                                    type="number"
                                                    value={variant.sellingPrice}
                                                    onChange={(e) => updateVariant(index, 'sellingPrice', parseFloat(e.target.value))}
                                                    placeholder="Sale price"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Stock *</label>
                                                <input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                                                    placeholder="Quantity"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Attributes (optional)</label>
                                            <div className="attributes-input">
                                                <input
                                                    type="text"
                                                    placeholder="e.g., weight:2kg, size:L, color:Red"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const input = e.target;
                                                            const parts = input.value.split(',');
                                                            const newAttributes = { ...variant.attributes };
                                                            parts.forEach(part => {
                                                                const [key, value] = part.split(':');
                                                                if (key && value) {
                                                                    newAttributes[key.trim()] = value.trim();
                                                                }
                                                            });
                                                            updateVariant(index, 'attributes', newAttributes);
                                                            input.value = '';
                                                        }
                                                    }}
                                                />
                                                <div className="attributes-list">
                                                    {Object.entries(variant.attributes).map(([key, val]) => (
                                                        <span key={key} className="attribute-tag">
                                                            {key}: {val}
                                                            <button
                                                                onClick={() => {
                                                                    const newAttributes = { ...variant.attributes };
                                                                    delete newAttributes[key];
                                                                    updateVariant(index, 'attributes', newAttributes);
                                                                }}
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSubmit} disabled={uploadingImages}>
                                <Save size={16} />
                                {modalType === 'add' ? 'Create Product' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmId && (
                <ConfirmModal
                    open={!!deleteConfirmId}
                    title="Delete Product"
                    message="Are you sure you want to delete this product? This action cannot be undone."
                    onCancel={() => setDeleteConfirmId(null)}
                    onConfirm={handleDelete}
                    variant="danger"
                />
            )}


        </div>
    );
};

export default Products;