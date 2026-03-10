import { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import {
  fetchExecutives,
  createExecutive,
  deleteExecutive,
} from '../services/executive.service';
import {
  fetchLeads,
  createLead,
  deleteLead,
  updateLead,
  updateLeadStatus,
} from '../services/lead.service';
import { SERVER_URL } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPhotoUrl = (path) => (path ? `${SERVER_URL}/${path}` : null);

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  // Executives state
  const [executives, setExecutives] = useState([]);
  const [execLoading, setExecLoading] = useState(false);
  const [showAddExecutive, setShowAddExecutive] = useState(false);
  const [execSaving, setExecSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [executiveForm, setExecutiveForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [viewLead, setViewLead] = useState(null); // lead object to show in modal
  const [modalSaving, setModalSaving] = useState(false);
  const [showAddRemark, setShowAddRemark] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [remarkBold, setRemarkBold] = useState(false);
  const [remarkItalic, setRemarkItalic] = useState(false);
  const [remarkUnderline, setRemarkUnderline] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '', phone: '', email: '', source: '', status: '',
    followUpDate: '', expectedValue: '', remarks: '',
  });
  const [remarksBold, setRemarksBold] = useState(false);
  const [remarksItalic, setRemarksItalic] = useState(false);
  const [remarksUnderline, setRemarksUnderline] = useState(false);

  // Dashboard stats (static placeholders — extend as needed)
  const stats = [
    { label: 'Total Customers', value: leads.length.toString(), change: '+12%', trend: 'up' },
    { label: 'Active Deals', value: leads.filter(l => l.status === 'qualified').length.toString(), change: '+8%', trend: 'up' },
    { label: 'Executives', value: executives.length.toString(), change: '', trend: 'up' },
    { label: 'Closed Won', value: leads.filter(l => l.status === 'closed-won').length.toString(), change: '', trend: 'up' },
  ];

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ─── Load executives ────────────────────────────────────────────────────────
  const loadExecutives = useCallback(async () => {
    setExecLoading(true);
    try {
      const res = await fetchExecutives();
      setExecutives(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load executives', 'error');
    } finally {
      setExecLoading(false);
    }
  }, []);

  // ─── Load leads ─────────────────────────────────────────────────────────────
  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await fetchLeads();
      setLeads(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load leads', 'error');
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExecutives();
    loadLeads();
  }, [loadExecutives, loadLeads]);

  // ─── Executive handlers ─────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleExecutiveReset = () => {
    setExecutiveForm({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handleSaveExecutive = async () => {
    const { name, phone, email, password, confirmPassword } = executiveForm;
    if (!name || !phone || !email || !password) {
      return showToast('All fields are required', 'error');
    }
    if (password !== confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }

    setExecSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('phone', phone);
      fd.append('email', email);
      fd.append('password', password);
      fd.append('confirmPassword', confirmPassword);
      if (photoFile) fd.append('avatar', photoFile);

      await createExecutive(fd);
      showToast('Executive saved successfully');
      handleExecutiveReset();
      setShowAddExecutive(false);
      loadExecutives();
    } catch (err) {
      showToast(err.message || 'Failed to save executive', 'error');
    } finally {
      setExecSaving(false);
    }
  };

  const handleDeleteExecutive = async (id) => {
    if (!window.confirm('Delete this executive?')) return;
    try {
      await deleteExecutive(id);
      showToast('Executive deleted');
      loadExecutives();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  // ─── Lead handlers ──────────────────────────────────────────────────────────
  const handleLeadReset = () => {
    setLeadForm({
      name: '', phone: '', email: '', source: '', status: '',
      followUpDate: '', expectedValue: '', remarks: '',
    });
    setSelectedAssignee(null);
  };

  const handleSaveLead = async () => {
    const { name: leadName, phone, source, status } = leadForm;
    if (!leadName || !phone || !source || !status) {
      return showToast('Lead name, phone, source and status are required', 'error');
    }

    setLeadSaving(true);
    try {
      await createLead({
        ...leadForm,
        assignedTo: selectedAssignee || undefined,
        expectedValue: leadForm.expectedValue ? Number(leadForm.expectedValue) : 0,
      });
      showToast('Lead saved successfully');
      handleLeadReset();
      setShowAddLead(false);
      loadLeads();
    } catch (err) {
      showToast(err.message || 'Failed to save lead', 'error');
    } finally {
      setLeadSaving(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await deleteLead(id);
      showToast('Lead deleted');
      loadLeads();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateLeadStatus(id, status);
      showToast('Status updated');
      loadLeads();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // ─── Modal field save (assignedTo / followUpDate) ─────────────────────────
  const handleModalFieldSave = async (field, value) => {
    if (!viewLead) return;
    setModalSaving(true);
    try {
      await updateLead(viewLead._id, { [field]: value });

      if (field === 'assignedTo') {
        // Store full exec object so the card highlights immediately
        const exec = executives.find(e => String(e._id) === String(value));
        setViewLead(prev => ({ ...prev, assignedTo: exec || value }));
      } else {
        setViewLead(prev => ({ ...prev, [field]: value }));
      }

      showToast('Saved');
      loadLeads();
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setModalSaving(false);
    }
  };

  // ─── Add remark ───────────────────────────────────────────────────────────
  const handleAddRemark = async () => {
    if (!newRemark.trim()) return showToast('Remark cannot be empty', 'error');
    setModalSaving(true);
    try {
      const combined = viewLead.remarks
        ? `${viewLead.remarks}\n\n${newRemark.trim()}`
        : newRemark.trim();
      await updateLead(viewLead._id, { remarks: combined });
      setViewLead(prev => ({ ...prev, remarks: combined }));
      setNewRemark('');
      setShowAddRemark(false);
      setRemarkBold(false); setRemarkItalic(false); setRemarkUnderline(false);
      showToast('Remark added');
      loadLeads();
    } catch (err) {
      showToast(err.message || 'Failed to add remark', 'error');
    } finally {
      setModalSaving(false);
    }
  };


  const navItems = [
    {
      id: 'sales-executives', label: 'Sales Executives',
      badge: executives.length || null,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      id: 'lead-sources', label: 'Lead Sources', badge: 12,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
    },
    {
      id: 'lead-pipeline', label: 'Lead Pipeline',
      badge: leads.filter(l => l.status === 'new').length || null,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>,
    },
    {
      id: 'follow-up', label: 'Follow Up',
      badge: leads.filter(l => l.followUpDate).length || null,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      id: 'lead-timeline', label: 'Lead Timeline', badge: null,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    },
  ];

  // ─── Page title ───────────────────────────────────────────────────────────────
  const pageTitle = navItems.find(n => n.id === activeTab)?.label || 'Dashboard';



  return (
    <div className="dashboard">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">C</div>
          <span className="logo-text">CRM</span>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar-sidebar">JD</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'John Doe'}</span>
            <span className="user-role">Admin · <span className="online-dot" /> Online</span>
          </div>
          <button className="bell-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setShowAddExecutive(false); setShowAddLead(false); }}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>{activeTab === 'overview' ? 'Dashboard' : pageTitle}</h1>
          </div>
          <div className="header-right">
            <div className="header-avatar">{(user?.email?.[0] || 'U').toUpperCase()}</div>
          </div>
        </header>
        <div className="page-content">{renderContent()}</div>
      </div>

      {/* ── Lead View Modal ─────────────────────────────────────────────────── */}
      {viewLead && (
        <div className="modal-overlay" onClick={() => { setViewLead(null); setShowAddRemark(false); setNewRemark(''); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-lead-avatar">{viewLead.name?.[0]?.toUpperCase()}</div>
                <div>
                  <h3 className="modal-lead-name">{viewLead.name}</h3>
                  <p className="modal-lead-sub">{viewLead.email || 'No email provided'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => { setViewLead(null); setShowAddRemark(false); setNewRemark(''); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* ── Status bar ───────────────────────────────────────────────── */}
            <div className="modal-status-bar">
              <span className="modal-status-label">Status</span>
              <select
                className={`status-select status-${viewLead.status}`}
                value={viewLead.status}
                onChange={async e => {
                  const newStatus = e.target.value;
                  await handleStatusChange(viewLead._id, newStatus);
                  setViewLead(prev => ({ ...prev, status: newStatus }));
                }}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed-won">Closed Won</option>
                <option value="closed-lost">Closed Lost</option>
              </select>
              {modalSaving && <span className="modal-saving-badge">Saving…</span>}
            </div>

            {/* ── Scrollable body ───────────────────────────────────────────── */}
            <div className="modal-body">

              {/* Row 1 — Phone (read) + Source (read) */}
              <div className="modal-detail-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/></svg>
                    Phone
                  </span>
                  <span className="modal-detail-value">{viewLead.phone}</span>
                </div>

                <div className="modal-detail-item">
                  <span className="modal-detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    Source
                  </span>
                  <span className="modal-detail-value capitalize">{viewLead.source || '—'}</span>
                </div>

                {/* Row 2 — Added On (read) */}
                <div className="modal-detail-item">
                  <span className="modal-detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Added On
                  </span>
                  <span className="modal-detail-value">
                    {viewLead.createdAt ? new Date(viewLead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>

                {/* Priority (read) */}
                <div className="modal-detail-item">
                  <span className="modal-detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Priority
                  </span>
                  <span className={`modal-detail-value priority-badge priority-${viewLead.priority || 'medium'}`}>
                    {viewLead.priority || 'medium'}
                  </span>
                </div>
              </div>

              {/* ── Editable: Assigned To ────────────────────────────────────── */}
              <div className="modal-edit-section">
                <span className="modal-detail-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Assigned To
                </span>
                <div className="modal-edit-row">
                  <div className="assignee-grid modal-assignee-grid">
                    {executives.map(exec => (
                      <button
                        key={exec._id}
                        type="button"
                        className={`assignee-card ${String(viewLead.assignedTo?._id || viewLead.assignedTo || '') === String(exec._id) ? 'selected' : ''}`}
                        onClick={() => handleModalFieldSave('assignedTo', exec._id)}
                      >
                        <span className="assignee-name">{exec.name.toUpperCase()}</span>
                        <span className="assignee-phone">{exec.phone}</span>
                      </button>
                    ))}
                    {executives.length === 0 && <p className="hint-text">No executives available.</p>}
                  </div>
                </div>
              </div>

              {/* ── Editable: Follow Up Date ─────────────────────────────────── */}
              <div className="modal-edit-section">
                <span className="modal-detail-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Follow Up Date
                </span>
                <div className="modal-edit-row">
                  <div className="input-wrapper modal-date-input">
                    <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input
                      type="date"
                      defaultValue={viewLead.followUpDate ? new Date(viewLead.followUpDate).toISOString().split('T')[0] : ''}
                      onBlur={e => {
                        if (e.target.value) handleModalFieldSave('followUpDate', e.target.value);
                      }}
                      onChange={e => {
                        if (e.target.value) handleModalFieldSave('followUpDate', e.target.value);
                      }}
                    />
                  </div>
                  {viewLead.followUpDate && (
                    <span className="modal-date-display">
                      {new Date(viewLead.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Existing Remarks ─────────────────────────────────────────── */}
              {viewLead.remarks && (
                <div className="modal-edit-section">
                  <span className="modal-detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Remarks / Notes
                  </span>
                  <p className="modal-remarks-text">{viewLead.remarks}</p>
                </div>
              )}

              {/* ── Add Remark section ───────────────────────────────────────── */}
              <div className="modal-edit-section">
                {!showAddRemark ? (
                  <button className="btn-add-remark" onClick={() => setShowAddRemark(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Remark
                  </button>
                ) : (
                  <div className="modal-remark-form">
                    <span className="modal-detail-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      New Remark
                    </span>
                    <div className="rich-text-editor">
                      <div className="rich-text-toolbar">
                        <button type="button" className={`toolbar-btn ${remarkBold ? 'active' : ''}`} onClick={() => setRemarkBold(v => !v)}><b>B</b></button>
                        <button type="button" className={`toolbar-btn ${remarkItalic ? 'active' : ''}`} onClick={() => setRemarkItalic(v => !v)}><i>I</i></button>
                        <button type="button" className={`toolbar-btn ${remarkUnderline ? 'active' : ''}`} onClick={() => setRemarkUnderline(v => !v)}><u>U</u></button>
                        <div className="toolbar-divider" />
                        <button type="button" className="toolbar-btn" onClick={() => setNewRemark(v => v + '\n• ')}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        </button>
                        <button type="button" className="toolbar-btn" onClick={() => setNewRemark('')}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
                        </button>
                      </div>
                      <textarea
                        className="rich-text-area"
                        placeholder="Write your remark or note..."
                        value={newRemark}
                        onChange={e => setNewRemark(e.target.value)}
                        style={{
                          fontWeight: remarkBold ? 'bold' : 'normal',
                          fontStyle: remarkItalic ? 'italic' : 'normal',
                          textDecoration: remarkUnderline ? 'underline' : 'none',
                        }}
                        rows={4}
                      />
                    </div>
                    <div className="modal-remark-actions">
                      <button className="btn-reset" onClick={() => { setShowAddRemark(false); setNewRemark(''); }}>Cancel</button>
                      <button className="btn-primary" onClick={handleAddRemark} disabled={modalSaving}>
                        {modalSaving ? <span className="spinner" /> : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        )}
                        {modalSaving ? 'Saving...' : 'Save Remark'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>{/* end modal-body */}

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <div className="modal-footer">
              <button className="btn-reset" onClick={() => { setViewLead(null); setShowAddRemark(false); setNewRemark(''); }}>Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;