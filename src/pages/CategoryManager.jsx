// frontend/src/pages/admin/CategoryManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    useGetFlatListQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useReorderCategoriesMutation,
} from '../redux/api';
import {
    FolderTree,
    Plus,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronRight,
    Folder,
    FolderOpen,
    FileText,
    Check,
    X,
    AlertCircle,
    Search,
    Filter,
    RefreshCw,
    Eye,
    Archive,
    GripVertical,
    Image as ImageIcon,
    Tag,
    Layers,
    TrendingUp,
    Shield,
    Zap,
    Menu,
    Grid,
    List,
    Move,
    Save,
    Undo2,
    HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './CategoryManagement.css';

const CategoryManager = () => {
    const { data: categories = [], refetch, isLoading } = useGetFlatListQuery();
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();
    const [reorderCategories] = useReorderCategoriesMutation();

    // UI State
    const [viewMode, setViewMode] = useState('tree'); // 'tree', 'grid', 'list'
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [parentForNew, setParentForNew] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        status: true,
        menuType: 'mega',
        showInNavbar: true,
        featured: false,
        image: '',
        icon: '',
        seo: { title: '', description: '' }
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isDraggingMode, setIsDraggingMode] = useState(false);
    const [dragUpdates, setDragUpdates] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState(new Set());

    // Build hierarchical tree
    const buildTree = useCallback((flatList) => {
        const map = new Map();
        const roots = [];

        flatList.forEach(item => {
            map.set(item._id, {
                ...item,
                children: [],
                level: item.level || 1
            });
        });

        flatList.forEach(item => {
            if (item.parentId && map.has(item.parentId)) {
                map.get(item.parentId).children.push(map.get(item._id));
            } else {
                roots.push(map.get(item._id));
            }
        });

        const sortChildren = (node) => {
            if (node.children) {
                node.children.sort((a, b) => a.order - b.order);
                node.children.forEach(sortChildren);
            }
        };
        roots.forEach(sortChildren);

        return roots;
    }, []);

    const handleDelete = async () => {
        try {
            await deleteCategory(deleteConfirmId).unwrap();

            toast.success("Category deleted successfully");

            setDeleteConfirmId(null);

            refetch();
        } catch (error) {
            toast.error(
                error?.data?.message || "Failed to delete category"
            );
        }
    };

    // Filter tree
    const filterTree = useCallback((nodes) => {
        let filtered = nodes;

        if (searchTerm) {
            const filterBySearch = (node) => {
                const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
                const filteredChildren = node.children ? node.children.map(filterBySearch).filter(Boolean) : [];
                if (matchesSearch || filteredChildren.length > 0) {
                    return { ...node, children: filteredChildren };
                }
                return null;
            };
            filtered = filtered.map(filterBySearch).filter(Boolean);
        }

        if (statusFilter !== 'all') {
            const filterByStatus = (node) => {
                const matchesStatus = statusFilter === 'active' ? node.status === true : node.status === false;
                const filteredChildren = node.children ? node.children.map(filterByStatus).filter(Boolean) : [];
                if (matchesStatus || filteredChildren.length > 0) {
                    return { ...node, children: filteredChildren };
                }
                return null;
            };
            filtered = filtered.map(filterByStatus).filter(Boolean);
        }

        if (selectedLevel !== 'all') {
            const filterByLevel = (node) => {
                const matchesLevel = node.level === parseInt(selectedLevel);
                const filteredChildren = node.children ? node.children.map(filterByLevel).filter(Boolean) : [];
                if (matchesLevel || filteredChildren.length > 0) {
                    return { ...node, children: filteredChildren };
                }
                return null;
            };
            filtered = filtered.map(filterByLevel).filter(Boolean);
        }

        return filtered;
    }, [searchTerm, statusFilter, selectedLevel]);

    const treeData = buildTree(categories);
    const filteredTree = filterTree(treeData);

    // Auto-expand when searching
    useEffect(() => {
        if (searchTerm) {
            const expandMatching = (nodes) => {
                for (const node of nodes) {
                    if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        const expandParents = (item) => {
                            if (item.parentId) {
                                setExpandedNodes(prev => new Set([...prev, item.parentId]));
                                const findParent = (nodesList, id) => {
                                    for (const n of nodesList) {
                                        if (n._id === id) return n;
                                        const found = findParent(n.children || [], id);
                                        if (found) return found;
                                    }
                                    return null;
                                };
                                const parentNode = findParent(treeData, item.parentId);
                                if (parentNode) expandParents(parentNode);
                            }
                        };
                        expandParents(node);
                    }
                    if (node.children) expandMatching(node.children);
                }
            };
            expandMatching(treeData);
        }
    }, [searchTerm, treeData]);

    const toggleExpand = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const expandAll = () => {
        const allIds = new Set();
        const collectIds = (nodes) => {
            nodes.forEach(node => {
                allIds.add(node._id);
                if (node.children) collectIds(node.children);
            });
        };
        collectIds(treeData);
        setExpandedNodes(allIds);
        toast.success("All categories expanded");
    };

    const collapseAll = () => {
        setExpandedNodes(new Set());
        toast.success("All categories collapsed");
    };

    // Drag and drop handlers
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const sourceId = result.draggableId;
        const destinationParentId = result.destination.droppableId === 'root' ? null : result.destination.droppableId;
        const newOrder = result.destination.index;

        const update = {
            id: sourceId,
            order: newOrder,
            parentId: destinationParentId
        };

        setDragUpdates(prev => {
            const existing = prev.find(u => u.id === sourceId);
            if (existing) {
                return prev.map(u => u.id === sourceId ? update : u);
            }
            return [...prev, update];
        });

        // Optimistically update UI
        toast.success(`Moved "${categories.find(c => c._id === sourceId)?.name}"`, { icon: '🔄' });
    };

    const saveDragChanges = async () => {
        if (dragUpdates.length === 0) return;

        try {
            await reorderCategories({ updates: dragUpdates }).unwrap();
            toast.success(`${dragUpdates.length} categories reordered successfully!`);
            setDragUpdates([]);
            setIsDraggingMode(false);
            refetch();
        } catch (error) {
            toast.error("Failed to save changes: " + (error.data?.message || "Unknown error"));
        }
    };

    const cancelDragChanges = () => {
        setDragUpdates([]);
        setIsDraggingMode(false);
        refetch();
        toast.info("Changes discarded");
    };

    // Open Add Modal
    const openAddModal = (parent = null) => {
        setParentForNew(parent);
        setSelectedCategory(null);
        setFormData({
            name: '',
            status: true,
            menuType: 'mega',
            showInNavbar: true,
            featured: false,
            image: '',
            icon: '',
            seo: { title: '', description: '' }
        });
        setModalType('add');
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            status: category.status,
            menuType: category.menuType || 'mega',
            showInNavbar: category.showInNavbar !== false,
            featured: category.featured || false,
            image: category.image || '',
            icon: category.icon || '',
            seo: category.seo || { title: '', description: '' }
        });
        setModalType('edit');
        setShowModal(true);
    };

    // Handle Add/Edit Submit
    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("Category name is required!");
            return;
        }

        try {
            if (modalType === 'add') {
                const level = parentForNew ? (parentForNew.level || 1) + 1 : 1;
                if (level > 3) {
                    toast.error("Maximum 3 levels allowed!");
                    return;
                }

                await createCategory({
                    name: formData.name,
                    parentId: parentForNew?._id || null,
                    status: formData.status,
                    menuType: formData.menuType,
                    showInNavbar: formData.showInNavbar,
                    featured: formData.featured,
                    image: formData.image,
                    icon: formData.icon,
                    order: 0,
                }).unwrap();
                toast.success("Category created successfully!");
            } else {
                await updateCategory({
                    id: selectedCategory._id,
                    ...formData
                }).unwrap();
                toast.success("Category updated successfully!");
            }

            setShowModal(false);
            refetch();
        } catch (error) {
            toast.error(error.data?.message || "Operation failed!");
        }
    };

    // Bulk actions
    const bulkUpdateStatus = async (status) => {
        const promises = Array.from(selectedCategories).map(id =>
            updateCategory({ id, status }).unwrap()
        );
        await Promise.all(promises);
        toast.success(`${selectedCategories.size} categories updated`);
        setSelectedCategories(new Set());
        setShowBulkActions(false);
        refetch();
    };

    const handleSelectCategory = (id, checked) => {
        const newSelected = new Set(selectedCategories);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedCategories(newSelected);
    };

    // Get level icon and color
    const getLevelStyle = (level) => {
        const styles = {
            1: { icon: Folder, color: '#2653ef', bg: '#eaf0ff', text: '#1d40c9' },
            2: { icon: FolderOpen, color: '#3c5480', bg: '#eef1f6', text: '#6d28d9' },
            3: { icon: FileText, color: '#10b981', bg: '#ecfdf5', text: '#047857' }
        };
        return styles[level] || styles[1];
    };

    // Render Tree View with Drag & Drop
    const renderDraggableTree = (nodes, level = 1, parentId = 'root') => {
        return nodes.map((node, index) => {
            const isExpanded = expandedNodes.has(node._id);
            const hasChildren = node.children && node.children.length > 0;
            const levelStyle = getLevelStyle(level);
            const IconComponent = levelStyle.icon;
            const isSelected = selectedCategories.has(node._id);

            return (
                <Draggable key={node._id} draggableId={node._id} index={index} isDragDisabled={!isDraggingMode}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`category-node-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                            <div className={`category-node ${!node.status ? 'inactive' : ''} ${isSelected ? 'selected' : ''}`}>
                                {/* Selection Checkbox */}
                                {/* <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleSelectCategory(node._id, e.target.checked)}
                                    className="category-checkbox"
                                    onClick={(e) => e.stopPropagation()}
                                /> */}

                                {/* Drag Handle */}
                                {isDraggingMode && (
                                    <div {...provided.dragHandleProps} className="drag-handle">
                                        <GripVertical size={16} />
                                    </div>
                                )}

                                {/* Expand/Collapse */}
                                {hasChildren ? (
                                    <button className="expand-btn" onClick={() => toggleExpand(node._id)}>
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                ) : (
                                    <span className="expand-placeholder"></span>
                                )}

                                {/* Icon */}
                                <div className="node-icon" style={{ backgroundColor: levelStyle.bg }}>
                                    <IconComponent size={level === 1 ? 16 : 14} style={{ color: levelStyle.color }} />
                                </div>

                                {/* Content */}
                                <div className="node-content">
                                    <div className="node-header">
                                        <span className="node-name">{node.name}</span>
                                        <div className="node-badges">
                                            {node.featured && (
                                                <span className="badge featured">
                                                    <TrendingUp size={10} />
                                                    Featured
                                                </span>
                                            )}
                                            {node.showInNavbar && level === 1 && (
                                                <span className="badge navbar">
                                                    <Menu size={10} />
                                                    Navbar
                                                </span>
                                            )}
                                            <span className={`badge status ${node.status ? 'active' : 'inactive'}`}>
                                                {node.status ? 'Active' : 'Inactive'}
                                            </span>
                                            {hasChildren && (
                                                <span className="badge count">
                                                    <Layers size={10} />
                                                    {node.children.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {node.seo?.title && (
                                        <div className="node-meta">
                                            <span className="meta-text">SEO: {node.seo.title}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="node-actions">
                                    {level < 3 && (
                                        <button
                                            className="action-btn add"
                                            onClick={() => openAddModal(node)}
                                            title="Add Subcategory"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    )}
                                    <button
                                        className="action-btn edit"
                                        onClick={() => openEditModal(node)}
                                        title="Edit Category"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => setDeleteConfirmId(node._id)}
                                        title="Delete Category"
                                        disabled={hasChildren}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Children */}
                            {isExpanded && hasChildren && (
                                <Droppable droppableId={node._id} type="category">
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="category-children"
                                            style={{ marginLeft: '32px' }}
                                        >
                                            {renderDraggableTree(node.children, level + 1, node._id)}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            )}
                        </div>
                    )}
                </Draggable>
            );
        });
    };

    // Render Grid View
    const renderGridView = () => {
        const displayCategories = categories.filter(cat => {
            if (searchTerm && !cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (statusFilter !== 'all' && ((statusFilter === 'active') !== cat.status)) return false;
            if (selectedLevel !== 'all' && cat.level !== parseInt(selectedLevel)) return false;
            return true;
        });

        return (
            <div className="grid-view">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayCategories.map(category => {
                        const levelStyle = getLevelStyle(category.level);
                        const IconComponent = levelStyle.icon;
                        const isSelected = selectedCategories.has(category._id);

                        return (
                            <div
                                key={category._id}
                                className={`category-card ${!category.status ? 'inactive' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectCategory(category._id, !isSelected)}
                            >
                                <div className="card-header">
                                    <div className="card-icon" style={{ backgroundColor: levelStyle.bg }}>
                                        <IconComponent size={24} style={{ color: levelStyle.color }} />
                                    </div>
                                    <div className="card-badges">
                                        {category.featured && <span className="badge featured">Featured</span>}
                                        <span className={`badge status ${category.status ? 'active' : 'inactive'}`}>
                                            {category.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h3 className="card-title">{category.name}</h3>
                                    <p className="card-meta">
                                        Level {category.level} • Order {category.order}
                                    </p>
                                    {category.seo?.title && (
                                        <p className="card-seo">{category.seo.title}</p>
                                    )}
                                </div>
                                <div className="card-footer">
                                    <button
                                        className="card-btn edit"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(category);
                                        }}
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        className="card-btn delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmId(category._id);
                                        }}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render List View
    const renderListView = () => {
        const displayCategories = [...categories].sort((a, b) => a.order - b.order);

        return (
            <div className="list-view">
                <table className="category-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.size === displayCategories.length && displayCategories.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCategories(new Set(displayCategories.map(c => c._id)));
                                        } else {
                                            setSelectedCategories(new Set());
                                        }
                                    }}
                                />
                            </th>
                            <th>Name</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>Order</th>
                            <th>Children</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayCategories.map(category => {
                            const isSelected = selectedCategories.has(category._id);
                            const levelStyle = getLevelStyle(category.level);
                            const IconComponent = levelStyle.icon;

                            return (
                                <tr key={category._id} className={!category.status ? 'inactive-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectCategory(category._id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="category-name-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="table-icon" style={{ backgroundColor: levelStyle.bg }}>
                                                <IconComponent size={14} style={{ color: levelStyle.color }} />
                                            </div>
                                            <span>{category.name}</span>
                                            {category.featured && <TrendingUp size={12} className="featured-icon" />}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="level-badge" style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}>
                                            Level {category.level}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${category.status ? 'active' : 'inactive'}`}>
                                            {category.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{category.order}</td>
                                    <td>
                                        <span className="children-count">{category.children?.length || 0}</span>
                                    </td>
                                    <td className="action-buttons">
                                        <button className="table-action edit" onClick={() => openEditModal(category)}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="table-action delete" onClick={() => setDeleteConfirmId(category._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Statistics
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.status === true).length;
    const featuredCategories = categories.filter(c => c.featured).length;
    const navbarCategories = categories.filter(c => c.showInNavbar).length;

    if (isLoading) {
        return <Loading text="Loading categories..." />;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="category-manager">
                {/* Header Section */}
                <div className="manager-header">
                    <div className="header-left">
                        <div className="header-icon">
                            <FolderTree size={28} />
                        </div>
                        <div>
                            <h1>Category Manager</h1>
                            <p>Manage your product hierarchy with ease</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
                                onClick={() => setViewMode('tree')}
                                title="Tree View"
                            >
                                <FolderTree size={18} />
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <button className="btn-primary" onClick={() => openAddModal(null)}>
                            <Plus size={18} />
                            New Category
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <FolderTree size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{totalCategories}</span>
                            <span className="stat-label">Total Categories</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon active">
                            <Check size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{activeCategories}</span>
                            <span className="stat-label">Active</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon featured">
                            <TrendingUp size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{featuredCategories}</span>
                            <span className="stat-label">Featured</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon navbar">
                            <Menu size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{navbarCategories}</span>
                            <span className="stat-label">In Navbar</span>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="filters-bar">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-btn" onClick={() => setSearchTerm("")}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>

                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Levels</option>
                            <option value="1">Level 1 (Parent)</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                        </select>
                    </div>

                    <div className="action-buttons-group">
                        {viewMode === 'tree' && (
                            <>
                                <button className="action-btn-icon" onClick={expandAll} title="Expand All">
                                    <ChevronRight size={16} /> Expand
                                </button>
                                <button className="action-btn-icon" onClick={collapseAll} title="Collapse All">
                                    <ChevronDown size={16} /> Collapse
                                </button>
                                {/* <button
                                    className={`action-btn-icon ${isDraggingMode ? 'active' : ''}`}
                                    onClick={() => setIsDraggingMode(!isDraggingMode)}
                                    title={isDraggingMode ? "Exit Drag Mode" : "Enter Drag Mode"}
                                >
                                    <Move size={16} /> Drag
                                </button> */}
                            </>
                        )}
                        {/* <button className="action-btn-icon" onClick={() => refetch()} title="Refresh">
                            <RefreshCw size={16} /> Refresh
                        </button> */}
                    </div>

                    {selectedCategories.size > 0 && (
                        <div className="bulk-actions">
                            <span className="bulk-count">{selectedCategories.size} selected</span>
                            <button className="bulk-btn" onClick={() => bulkUpdateStatus(true)}>
                                Activate
                            </button>
                            <button className="bulk-btn" onClick={() => bulkUpdateStatus(false)}>
                                Deactivate
                            </button>
                            <button className="bulk-btn danger" onClick={() => setSelectedCategories(new Set())}>
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="manager-content">
                    {isDraggingMode && dragUpdates.length > 0 && (
                        <div className="drag-bar">
                            <span>{dragUpdates.length} pending change(s)</span>
                            <div className="drag-actions">
                                <button className="save-btn" onClick={saveDragChanges}>
                                    <Save size={14} /> Save Changes
                                </button>
                                <button className="cancel-btn" onClick={cancelDragChanges}>
                                    <Undo2 size={14} /> Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {viewMode === 'tree' && (
                        <Droppable droppableId="root" type="category">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="category-tree"
                                >
                                    {filteredTree.length === 0 ? (
                                        <div className="empty-state">
                                            <FolderTree size={64} />
                                            <h3>No categories found</h3>
                                            <p>
                                                {searchTerm || statusFilter !== 'all' || selectedLevel !== 'all'
                                                    ? "Try adjusting your filters"
                                                    : "Get started by creating your first category"}
                                            </p>
                                            <button className="btn-primary" onClick={() => openAddModal(null)}>
                                                <Plus size={18} /> Create Category
                                            </button>
                                        </div>
                                    ) : (
                                        renderDraggableTree(filteredTree)
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    )}

                    {viewMode === 'grid' && renderGridView()}
                    {viewMode === 'list' && renderListView()}
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon" style={{ backgroundColor: getLevelStyle(parentForNew?.level || 1).bg }}>
                                    {modalType === 'add' ? <Plus size={22} /> : <Edit2 size={22} />}
                                </div>
                                <div>
                                    <h3>
                                        {modalType === 'add'
                                            ? parentForNew
                                                ? `Add Subcategory to "${parentForNew.name}"`
                                                : 'Create New Category'
                                            : `Edit "${selectedCategory?.name}"`}
                                    </h3>
                                    <p>
                                        {modalType === 'add' && parentForNew
                                            ? `Level ${(parentForNew.level || 1) + 1} of 3`
                                            : modalType === 'add'
                                                ? 'Top level category'
                                                : 'Update category information'}
                                    </p>
                                </div>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label>
                                        Category Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Electronics, Clothing, Books"
                                        autoFocus
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Menu Type</label>
                                        <select
                                            value={formData.menuType}
                                            onChange={(e) => setFormData({ ...formData, menuType: e.target.value })}
                                        >
                                            <option value="mega">Mega Menu</option>
                                            <option value="dropdown">Dropdown</option>
                                            <option value="simple">Simple</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.order || 0}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                            />
                                            <span>Active</span>
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.showInNavbar}
                                                onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                                            />
                                            <span>Show in Navbar</span>
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            />
                                            <span>Featured</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    
                                </div>

                               

                                {modalType === 'add' && parentForNew && parentForNew.level === 2 && (
                                    <div className="info-box warning">
                                        <AlertCircle size={16} />
                                        <span>This will be level 3 (maximum depth). No further subcategories can be added.</span>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleSubmit}>
                                    <Check size={16} />
                                    {modalType === 'add' ? 'Create Category' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirmId && (
                    <ConfirmModal
                        open={!!deleteConfirmId}
                        title="Delete Category"
                        message="Are you sure you want to delete this category? This action cannot be undone."
                        onCancel={() => setDeleteConfirmId(null)}
                        onConfirm={handleDelete}
                        variant="danger"
                    />
                )}
            </div>


        </DragDropContext>
    );
};

export default CategoryManager;