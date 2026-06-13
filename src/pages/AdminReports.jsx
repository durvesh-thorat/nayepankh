import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/api/admin/reports/summary');
        setReport(response.data);
      } catch (err) {
        console.error('Failed to load report data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, []);

  if (loading || !report) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  // Format type name safely
  const formatType = (t) => t ? t.replace('_', ' ') : 'UNKNOWN';

  // Find max count for cities scaling
  const maxCityCount = report.top_cities?.length > 0 
    ? Math.max(...report.top_cities.map(c => c.count)) 
    : 1;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Impact Report</h1>
          <p className="admin-page-subtitle">Real-time data from NayePankh volunteer operations.</p>
        </div>
      </div>
      
      <div className="stats-row" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
        <div className="stat-card" style={{borderLeftColor: 'var(--color-primary)'}}>
          <div className="stat-value">{report.total_volunteers}</div>
          <div className="stat-label">Total Volunteers</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: 'var(--color-secondary)'}}>
          <div className="stat-value">{report.active_campaigns}</div>
          <div className="stat-label">Active Deployments</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: 'var(--color-success)'}}>
          <div className="stat-value">{report.total_assignments}</div>
          <div className="stat-label">Assignments Made</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: 'var(--color-text-primary)'}}>
          <div className="stat-value">{Object.keys(report.assignments_by_type).length}</div>
          <div className="stat-label">Campaign Types</div>
        </div>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px'}}>
        <div className="admin-card">
          <h2 className="admin-card-title">Mobilization by Campaign Type</h2>
          
          <div style={{paddingTop: '24px'}}>
            {Object.entries(report.assignments_by_type).length > 0 ? (
              Object.entries(report.assignments_by_type)
                .sort((a,b) => b[1] - a[1])
                .map(([type, count]) => {
                  const total = Object.values(report.assignments_by_type).reduce((a,b) => a+b, 0);
                  const percent = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={type} style={{marginBottom: '32px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                        <strong style={{fontSize: '1.1rem'}}>{formatType(type)}</strong>
                        <div>
                          <span style={{fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600}}>{count}</span>
                          <span style={{color: 'var(--color-text-secondary)', marginLeft: '8px', fontSize: '0.9rem'}}>vols</span>
                        </div>
                      </div>
                      <div style={{height: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', overflow: 'hidden'}}>
                        <div style={{height: '100%', backgroundColor: 'var(--color-secondary)', width: `${percent}%`, transition: 'width 1s ease'}}></div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="empty-state">No campaign data recorded yet.</div>
            )}
          </div>
        </div>
        
        <div className="admin-card">
          <h2 className="admin-card-title">Top Mobilized Hubs</h2>
          
          <div style={{paddingTop: '16px'}}>
            {report.top_cities?.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                {report.top_cities.map((hub, index) => (
                  <div key={hub.city} className="metric-row">
                    <div className="metric-rank">0{index + 1}.</div>
                    <div className="metric-name">{hub.city}</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                      <div style={{width: '60px', height: '4px', backgroundColor: 'var(--color-bg)', overflow: 'hidden', borderRadius: '2px'}}>
                        <div style={{height: '100%', backgroundColor: 'var(--color-primary)', width: `${(hub.count / maxCityCount) * 100}%`}}></div>
                      </div>
                      <div className="metric-val">{hub.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No city data available</div>
            )}
          </div>
        </div>
      </div>
      
      <div style={{textAlign: 'center', padding: '32px 0', borderTop: '1px solid var(--color-border)', marginTop: '32px'}}>
        <p style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem'}}>
          Report generated securely at {new Date().toLocaleTimeString()}. This data updates in real-time from your backend database.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
