import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Admin.css';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  
  return (
    <>
      <div className="admin-mobile-warning">
        <div className="admin-mobile-warning-content">
          <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '16px'}}>Desktop Required</h2>
          <p style={{color: 'var(--color-text-secondary)', marginBottom: '24px'}}>The administrative portal is designed for desktop viewing to manage complex data tables and reports.</p>
          <button onClick={logout} className="btn btn-outline" style={{width: '100%'}}>Logout</button>
        </div>
      </div>
      
      <div className="admin-layout page-transition">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh Foundation" />
          </div>
          
          <nav className="admin-nav">
            <NavLink to="/admin" end className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-nav-icon">📊</span> Dashboard
            </NavLink>
            <NavLink to="/admin/volunteers" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-nav-icon">👥</span> Volunteers
            </NavLink>
            <NavLink to="/admin/campaigns" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-nav-icon">📋</span> Campaigns
            </NavLink>
            <NavLink to="/admin/reports" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-nav-icon">📈</span> Impact Reports
            </NavLink>
            
            <div style={{marginTop: 'auto', paddingTop: '24px'}}>
              <button 
                onClick={logout} 
                className="admin-nav-item" 
                style={{width: '100%', textAlign: 'left'}}
              >
                <span className="admin-nav-icon">🚪</span> Secure Logout
              </button>
            </div>
          </nav>
        </aside>
        
        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/api/admin/reports/summary');
        setSummary(response.data);
      } catch (err) {
        console.error('Failed to load admin summary', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, []);

  if (loading || !summary) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Good morning, Admin</h1>
          <p className="admin-page-subtitle">Here's the current operational overview for NayePankh Foundation.</p>
        </div>
      </div>
      
      <div className="stats-row">
        <div className="stat-card" style={{borderLeftColor: 'var(--color-primary)'}}>
          <div className="stat-value">{summary.total_volunteers}</div>
          <div className="stat-label">Total Volunteers</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: 'var(--color-secondary)'}}>
          <div className="stat-value">{summary.active_campaigns}</div>
          <div className="stat-label">Active Campaigns</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: 'var(--color-success)'}}>
          <div className="stat-value">{summary.total_assignments}</div>
          <div className="stat-label">Total Assignments</div>
        </div>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'}}>
        <div className="admin-card">
          <h2 className="admin-card-title">Recent Registrations</h2>
          <div className="data-table-wrap" style={{border: 'none', boxShadow: 'none'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent_registrations.map(vol => (
                  <tr key={vol.id}>
                    <td style={{fontWeight: 500}}>{vol.full_name}</td>
                    <td>{vol.city || 'N/A'}</td>
                    <td>{new Date(vol.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {summary.recent_registrations.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign: 'center', color: 'var(--color-text-secondary)'}}>No recent registrations</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="admin-card">
          <h2 className="admin-card-title">Assignments by Type</h2>
          <div style={{paddingTop: '16px'}}>
            {Object.entries(summary.assignments_by_type).map(([type, count]) => {
              const total = Object.values(summary.assignments_by_type).reduce((a,b) => a+b, 0);
              const percent = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div className="bar-chart-item" key={type}>
                  <div className="bar-chart-label">
                    <span>{type.replace('_', ' ')}</span>
                    <span style={{fontFamily: 'var(--font-heading)', fontWeight: 600}}>{count}</span>
                  </div>
                  <div className="admin-progress-bar">
                    <div className="admin-progress-fill" style={{width: `${percent}%`}}></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(summary.assignments_by_type).length === 0 && (
              <div style={{textAlign: 'center', color: 'var(--color-text-secondary)', padding: '24px 0'}}>
                No assignment data available
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export { AdminLayout };
export default AdminDashboard;
