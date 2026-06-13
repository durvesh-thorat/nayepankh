import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  
  // Selected Profile
  const [selectedVol, setSelectedVol] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/volunteers?limit=100';
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (cityFilter) url += `&city=${encodeURIComponent(cityFilter)}`;
      if (availFilter) url += `&availability=${encodeURIComponent(availFilter)}`;
      
      const res = await api.get(url);
      setVolunteers(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchVolunteers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, cityFilter, availFilter]);

  const handleView = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/admin/volunteers/${id}`);
      setSelectedVol(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };
  
  const handleDeactivate = async (id) => {
    if(!window.confirm("Are you sure you want to deactivate this volunteer?")) return;
    
    try {
      await api.put(`/api/admin/volunteers/${id}/deactivate`);
      fetchVolunteers(); // Refresh list
      if(selectedVol && selectedVol.id === id) {
        setSelectedVol(prev => ({...prev, is_active: false}));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to deactivate");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Volunteer Network</h1>
          <p className="admin-page-subtitle">Manage and track your {total} registered volunteers.</p>
        </div>
      </div>
      
      <div className="admin-filters">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="form-control"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        >
          <option value="">All Cities</option>
          <option value="Kanpur">Kanpur</option>
          <option value="Ghaziabad">Ghaziabad</option>
          <option value="Delhi">Delhi</option>
          <option value="Mumbai">Mumbai</option>
        </select>
        <select 
          className="form-control"
          value={availFilter}
          onChange={(e) => setAvailFilter(e.target.value)}
        >
          <option value="">Any Availability</option>
          <option value="Weekdays">Weekdays</option>
          <option value="Weekends">Weekends</option>
          <option value="Both">Both</option>
        </select>
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="admin-card" style={{padding: 0, overflow: 'hidden'}}>
          <div className="data-table-wrap" style={{border: 'none', borderRadius: 0}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Skills</th>
                  <th>Availability</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{fontWeight: 500}}>{v.full_name}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)'}}>{v.email}</div>
                    </td>
                    <td>{v.city || '-'}</td>
                    <td>
                      <div style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {v.skills || '-'}
                      </div>
                    </td>
                    <td>{v.availability || '-'}</td>
                    <td>
                      <span className={v.is_active ? "status-pill status-active" : "status-pill status-inactive"}></span>
                      {v.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td>
                      <button onClick={() => handleView(v.id)} className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.85rem', marginRight: '8px'}}>View</button>
                    </td>
                  </tr>
                ))}
                {volunteers.length === 0 && (
                  <tr><td colSpan="6" className="empty-state">No volunteers found matching your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Slide-in panel for Details */}
      {selectedVol && (
        <div className="slide-panel-overlay" onClick={(e) => { if (e.target.classList.contains('slide-panel-overlay')) setSelectedVol(null); }}>
          <div className="slide-panel">
            <div className="slide-panel-header">
              <h2>Volunteer Profile</h2>
              <button className="close-btn" onClick={() => setSelectedVol(null)}>&times;</button>
            </div>
            <div className="slide-panel-body">
              {detailLoading ? <LoadingSpinner /> : (
                <>
                  <div style={{marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px'}}>
                    <div style={{width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontFamily: 'var(--font-heading)'}}>
                      {selectedVol.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{fontSize: '2rem', margin: 0}}>{selectedVol.full_name}</h3>
                      <p style={{color: 'var(--color-text-secondary)', margin: '4px 0 0 0'}}>Registered {new Date(selectedVol.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px'}}>
                    <div>
                      <div className="form-label">Email</div>
                      <div style={{fontWeight: 500}}>{selectedVol.email}</div>
                    </div>
                    <div>
                      <div className="form-label">Phone</div>
                      <div style={{fontWeight: 500}}>{selectedVol.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <div className="form-label">City</div>
                      <div style={{fontWeight: 500}}>{selectedVol.city}</div>
                    </div>
                    <div>
                      <div className="form-label">Status</div>
                      <span className={`badge ${selectedVol.is_active ? 'badge-green' : 'badge-grey'}`}>
                        {selectedVol.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                    <div style={{gridColumn: '1 / -1'}}>
                      <div className="form-label">Declared Skills</div>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                        {selectedVol.skills ? selectedVol.skills.split(',').map(s => (
                          <span key={s} className="badge badge-grey">{s.trim()}</span>
                        )) : '-'}
                      </div>
                    </div>
                  </div>
                  
                  <h3 style={{fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px'}}>Assignment History</h3>
                  
                  {selectedVol.assignments && selectedVol.assignments.length > 0 ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                      {selectedVol.assignments.map(a => (
                        <div key={a.id} style={{padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                            <strong style={{fontSize: '1.1rem'}}>{a.campaign.title}</strong>
                            <span className={`badge ${a.status === 'COMPLETED' ? 'badge-green' : (a.status === 'CANCELLED' ? 'badge-grey' : 'badge-saffron')}`}>
                              {a.status}
                            </span>
                          </div>
                          <div style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem'}}>
                            Assigned on {new Date(a.assigned_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{color: 'var(--color-text-secondary)'}}>No assignments found for this volunteer.</p>
                  )}
                </>
              )}
            </div>
            <div className="slide-panel-footer">
              {selectedVol && selectedVol.is_active && (
                <button onClick={() => handleDeactivate(selectedVol.id)} className="btn btn-outline" style={{borderColor: 'var(--color-error)', color: 'var(--color-error)'}}>Deactivate User</button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVolunteers;
