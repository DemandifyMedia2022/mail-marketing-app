import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPageBuilder from '../components/LandingPageBuilder';

interface LandingPage {
  _id: string;
  name: string;
  title: string;
  description: string;
  contentType: 'html' | 'iframe' | 'pdf';
  contentUrl: string;
  isActive: boolean;
  campaignId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  tags: string[];
}

const pageBg = '#f8fafc';
const cardBg = '#ffffff';
const borderColor = '#e5e7eb';
const primary = '#2563eb';
const muted = '#6b7280';

const LandingPagesList: React.FC = () => {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'html' | 'iframe' | 'pdf'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      const res = await axios.get('/api/landing-pages');
      if (res.data.success) setLandingPages(res.data.data);
    } catch {
      setError('Unable to load landing pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this landing page?')) return;
    await axios.delete(`/api/landing-pages/${id}`);
    setLandingPages(prev => prev.filter(p => p._id !== id));
  };

  const handleEdit = async (page: LandingPage) => {
    setEditingPage(page);
    setShowBuilder(true);
  };

  const toggleActive = async (id: string, status: boolean) => {
    await axios.put(`/api/landing-pages/${id}`, { isActive: !status });
    setLandingPages(prev =>
      prev.map(p => (p._id === id ? { ...p, isActive: !status } : p))
    );
  };

  const getLandingPageUrl = (page: LandingPage) =>
    `http://localhost:5173/landing-page/${page._id}`;

  const filtered = landingPages.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)) &&
      (filterType === 'all' || p.contentType === filterType)
    );
  });

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ background: pageBg, minHeight: '100vh', padding: 32, width: '100%', maxWidth: 'none' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Landing Pages
        </h1>
        <p style={{ color: muted }}>
          Manage and monitor all campaign landing pages
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        alignItems: 'center'
      }}>
        <input
          placeholder="Search landing pages..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={inputStyle}
        />

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
          style={inputStyle}
        >
          <option value="all">All Types</option>
          <option value="html">HTML</option>
          <option value="iframe">Iframe</option>
          <option value="pdf">PDF</option>
        </select>

        <button
          onClick={() => setShowBuilder(true)}
          style={{
            ...primaryBtn,
            backgroundColor: '#10b981',
            marginRight: '8px'
          }}
        >
          🎨 Use Builder
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={primaryBtn}
        >
          + New Landing Page
        </button>
      </div>

      {showBuilder ? (
        <LandingPageBuilder
          editingPage={editingPage}
          onSave={() => {
            setShowBuilder(false);
            setEditingPage(null);
            fetchLandingPages();
          }}
          onCancel={() => {
            setShowBuilder(false);
            setEditingPage(null);
          }}
        />
      ) : (
        <>
          {showAddForm && (
            <div style={{ marginBottom: 24 }}>
              <AddLandingPageForm
                onSuccess={() => {
                  setShowAddForm(false);
                  fetchLandingPages();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

      {/* Cards */}
      {error ? (
        <div>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={emptyState}>
          No landing pages found
        </div>
      ) : (
        <div style={grid}>
          {filtered.map(page => (
            <div key={page._id} style={card}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                  {page.title}
                </h3>
                <p style={{ fontSize: 13, color: muted }}>
                  {page.description || 'No description'}
                </p>
              </div>

              <div style={metaRow}>
                <span style={badge}>{page.contentType.toUpperCase()}</span>
                <span style={badgeSecondary}>
                  {page.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ fontSize: 12, color: muted, marginBottom: 12 }}>
                Created: {new Date(page.createdAt).toLocaleDateString()}
              </div>

              <div style={actions}>
                <button
                  onClick={() => window.open(getLandingPageUrl(page))}
                  style={linkBtn}
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(page)}
                  style={{
                    ...secondaryBtn,
                    background: '#fef3c7',
                    color: '#d97706'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(page._id, page.isActive)}
                  style={secondaryBtn}
                >
                  {page.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(page._id)}
                  style={dangerBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
};

/* ---------------- FORM ---------------- */

const AddLandingPageForm: React.FC<any> = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    contentType: 'html',
    content: '',
    contentUrl: '',
    tags: ''
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/landing-pages', {
      ...form,
      tags: form.tags.split(',').map(t => t.trim())
    });
    onSuccess();
  };

  return (
    
    <form onSubmit={submit} style={formCard}>
      <h2 style={{ marginBottom: 16 }}>Create Landing Page</h2>

      <input placeholder="Name" style={inputStyle} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Title" style={inputStyle} onChange={e => setForm({ ...form, title: e.target.value })} />
      <textarea placeholder="Description" style={textarea} onChange={e => setForm({ ...form, description: e.target.value })} />

      <select style={inputStyle} onChange={e => setForm({ ...form, contentType: e.target.value })}>
        <option value="html">HTML</option>
        <option value="iframe">Iframe</option>
        <option value="pdf">PDF</option>
      </select>

      {form.contentType === 'html' ? (
        <textarea placeholder="HTML Content" style={textareaLarge} onChange={e => setForm({ ...form, content: e.target.value })} />
      ) : (
        <input placeholder="Content URL" style={inputStyle} onChange={e => setForm({ ...form, contentUrl: e.target.value })} />
      )}

      <input placeholder="Tags (comma separated)" style={inputStyle} onChange={e => setForm({ ...form, tags: e.target.value })} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
        <button type="submit" style={primaryBtn}>Create</button>
      </div>
    </form>
  );
};

/* ---------------- STYLES ---------------- */

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 20
};

const card = {
  background: cardBg,
  border: `1px solid ${borderColor}`,
  borderRadius: 12,
  padding: 16
};

const metaRow = {
  display: 'flex',
  gap: 8,
  marginBottom: 12
};

const badge = {
  background: '#eff6ff',
  color: primary,
  padding: '4px 10px',
  borderRadius: 20,
  fontSize: 11
};

const badgeSecondary = {
  background: '#f3f4f6',
  padding: '4px 10px',
  borderRadius: 20,
  fontSize: 11
};

const actions = {
  display: 'flex',
  gap: 8
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${borderColor}`,
  fontSize: 14,
  width: '100%'
};

const textarea = { ...inputStyle, minHeight: 70 };
const textareaLarge = { ...inputStyle, minHeight: 160, fontFamily: 'monospace' };

const primaryBtn = {
  background: primary,
  color: '#fff',
  padding: '10px 16px',
  borderRadius: 8,
  marginBottom: 12,
  border: 'none',
  cursor: 'pointer',
  width: '450px',
};

const secondaryBtn = {
  background: '#f3f4f6',
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  color:'#4b4a4a62',
};

const dangerBtn = {
  background: '#fee2e2',
  color: '#b91c1c',
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none'
};

const linkBtn = {
  background: '#eff6ff',
  color: primary,
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none'
};

const formCard: React.CSSProperties = {
  background: cardBg,
  border: `1px solid ${borderColor}`,
  borderRadius: 12,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  width: '100%'
};

const emptyState: React.CSSProperties = {
  background: cardBg,
  border: `1px dashed ${borderColor}`,
  padding: 40,
  borderRadius: 12,
  textAlign: 'center',
  color: muted
};

export default LandingPagesList;
