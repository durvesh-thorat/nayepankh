import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    campaign_type: 'FOOD_DRIVE',
    description: '',
    city: '',
    date: '',
    slots_total: 10
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/campaigns?is_active=true');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openNewPanel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      campaign_type: 'FOOD_DRIVE',
      description: '',
      city: '',
      date: new Date().toISOString().split('T')[0],
      slots_total: 10
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (campaign) => {
    setEditingId(campaign.id);
    setFormData({
      title: campaign.title,
      campaign_type: campaign.campaign_type,
      description: campaign.description || '',
      city: campaign.city || '',
      date: new Date(campaign.date).toISOString().split('T')[0],
      slots_total: campaign.slots_total
    });
    setIsPanelOpen(true);
  };

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'slots_total' ? parseInt(value, 10) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString()
      };
      
      if (editingId) {
        await api.put(`/api/admin/campaigns/${editingId}`, payload);
      } else {
        await api.post('/api/admin/campaigns', payload);
      }
      
      handleClose();
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      alert('Failed to save campaign');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to deactivate this campaign?")) return;
    try {
      await api.delete(`/api/admin/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      alert('Failed to delete campaign');
    }
  };

  const getTypeColor = (type) => {
    const map = {
      'FOOD_DRIVE': 'badge-saffron',
      'CLOTHES_DISTRIBUTION': 'badge-teal',
      'EDUCATION': 'badge-green',
      'SANITARY_AID': 'badge-grey',
    };
    return map[type] || 'badge-grey';
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Drive Operations</h1>
          <p className="admin-page-subtitle">Manage ground operations and required volunteer capacity.</p>
        </div>
        <button onClick={openNewPanel} className="btn btn-primary">+ New Campaign</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="admin-card" style={{padding: 0, overflow: 'hidden'}}>
          <div className="data-table-wrap" style={{border: 'none', borderRadius: 0}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Location &amp; Date</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td style={{fontWeight: 500, maxWidth: '300px'}}>{c.title}</td>
                    <td>
                      <span className={`badge ${getTypeColor(c.campaign_type)}`}>
                        {c.campaign_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div>{c.city}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)'}}>{new Date(c.date).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <div style={{width: '60px', height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden'}}>
                          <div style={{height: '100%', backgroundColor: 'var(--color-primary)', width: `${Math.min(100, (c.slots_filled/c.slots_total)*100)}%`}}></div>
                        </div>
                        <span style={{fontSize: '0.85rem'}}>{c.slots_filled}/{c.slots_total}</span>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => openEditPanel(c)} className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.85rem', marginRight: '8px'}}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.85rem', borderColor: 'var(--color-error)', color: 'var(--color-error)'}}>End</button>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td colSpan="5" className="empty-state">No active campaigns. Create one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-in Panel for Create/Edit */}
      {isPanelOpen && (
        <div className="slide-panel-overlay" onClick={handleClose}>
          <div className="slide-panel" onClick={e => e.stopPropagation()}>
            <div className="slide-panel-header">
              <h2>{editingId ? 'Edit Campaign' : 'Publish New Campaign'}</h2>
              <button className="close-btn" onClick={handleClose}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
              <div className="slide-panel-body">
                <div className="form-group">
                  <label className="form-label">Campaign Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    className="form-control" 
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div style={{display: 'flex', gap: '20px'}}>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Type</label>
                    <select name="campaign_type" className="form-control" value={formData.campaign_type} onChange={handleChange}>
                      <option value="FOOD_DRIVE">Food Drive</option>
                      <option value="CLOTHES_DISTRIBUTION">Clothes Distribution</option>
                      <option value="EDUCATION">Education</option>
                      <option value="SANITARY_AID">Sanitary Aid</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">City Focus</label>
                    <input 
                      type="text" 
                      name="city" 
                      className="form-control" 
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '20px'}}>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Event Date</label>
                    <input 
                      type="date" 
                      name="date" 
                      className="form-control" 
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Volunteer Slots Needed</label>
                    <input 
                      type="number" 
                      name="slots_total" 
                      min="1"
                      max="500"
                      className="form-control" 
                      value={formData.slots_total}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mission Brief / Description</label>
                  <textarea 
                    name="description" 
                    className="form-control" 
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    style={{resize: 'vertical'}}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="slide-panel-footer">
                <button type="button" className="btn btn-outline" onClick={handleClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Publish Campaign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCampaigns;
