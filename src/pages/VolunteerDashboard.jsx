import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Dashboard.css';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, assignmentsRes, campaignsRes] = await Promise.all([
        api.get('/api/volunteers/me'),
        api.get('/api/volunteers/me/assignments'),
        api.get('/api/campaigns?is_active=true')
      ]);
      
      setProfile(profileRes.data);
      setAssignments(assignmentsRes.data);
      setAllCampaigns(campaignsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async (campaignId) => {
    setJoinError('');
    setJoinSuccess('');
    try {
      await api.post(`/api/campaigns/${campaignId}/join`);
      setJoinSuccess('Successfully joined campaign!');
      fetchData(); // Refresh data
    } catch (err) {
      setJoinError(err.response?.data?.detail || 'Failed to join campaign');
      setTimeout(() => setJoinError(''), 5000);
    }
  };

  const getCampaignTypeColor = (type) => {
    const map = {
      'FOOD_DRIVE': 'badge-saffron',
      'CLOTHES_DISTRIBUTION': 'badge-teal',
      'EDUCATION': 'badge-green',
      'SANITARY_AID': 'badge-grey',
    };
    return map[type] || 'badge-grey';
  };

  const getStatusColor = (status) => {
    if (status === 'UPCOMING') return 'badge-teal';
    if (status === 'COMPLETED') return 'badge-green';
    return 'badge-grey';
  };

  if (loading && !profile) return <><Navbar /><LoadingSpinner /><Footer /></>;

  const joinedCampaignIds = assignments.map(a => a.campaign_id);
  const availableCampaigns = allCampaigns.filter(c => !joinedCampaignIds.includes(c.id));

  // Compute stats
  const totalJoined = assignments.length;
  const completedCount = assignments.filter(a => a.status === 'COMPLETED').length;
  const upcomingCount = assignments.filter(a => a.status === 'UPCOMING').length;

  return (
    <div className="dashboard-page page-transition">
      <Navbar />
      
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome back, {profile?.full_name?.split(' ')[0]}</h1>
          <p>{profile?.city} • Member since {new Date(profile?.created_at).getFullYear()}</p>
        </header>
        
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{totalJoined}</div>
            <div className="stat-label">Campaigns Joined</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{upcomingCount}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Your Assignments</h2>
          </div>
          
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map(assignment => (
                    <tr key={assignment.id}>
                      <td style={{fontWeight: 500}}>{assignment.campaign.title}</td>
                      <td>
                        <span className={`badge ${getCampaignTypeColor(assignment.campaign.campaign_type)}`}>
                          {assignment.campaign.campaign_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{assignment.campaign.city}</td>
                      <td>{new Date(assignment.campaign.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/campaigns/${assignment.campaign.id}`} style={{color: 'var(--color-primary)', fontWeight: 500}}>
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        You haven't joined any campaigns yet. Browse below to get started.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Campaigns Near You</h2>
          </div>
          
          {joinError && <div className="inline-error" style={{marginBottom: '24px', marginTop: 0}}>{joinError}</div>}
          {joinSuccess && <div className="inline-error" style={{marginBottom: '24px', marginTop: 0, backgroundColor: 'rgba(45, 106, 79, 0.1)', color: 'var(--color-success)', borderColor: 'var(--color-success)'}}>{joinSuccess}</div>}

          <div className="campaigns-list">
            {availableCampaigns.length > 0 ? (
              availableCampaigns.map(campaign => (
                <div className="campaign-list-item" key={campaign.id}>
                  <div className="campaign-image" style={{backgroundColor: '#e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem'}}>[Placeholder]</span>
                  </div>
                  <div className="campaign-content" style={{padding: '32px'}}>
                    <div>
                      <span className={`badge ${getCampaignTypeColor(campaign.campaign_type)}`}>
                        {campaign.campaign_type.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="campaign-title" style={{fontSize: '1.5rem'}}>{campaign.title}</h3>
                    <div className="campaign-meta">
                      <span>{campaign.city}</span>
                      <span>•</span>
                      <span>{new Date(campaign.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="campaign-progress-wrap" style={{marginBottom: '16px'}}>
                      <div className="campaign-progress-text">
                        {campaign.slots_filled} of {campaign.slots_total} slots filled
                      </div>
                      <div className="campaign-progress-bar">
                        <div 
                          className="campaign-progress-fill" 
                          style={{width: `${Math.min(100, Math.max(0, (campaign.slots_filled / campaign.slots_total) * 100))}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div style={{display: 'flex', gap: '12px'}}>
                      <Link to={`/campaigns/${campaign.id}`} className="btn btn-outline" style={{padding: '8px 16px'}}>Details</Link>
                      <button 
                        className="btn btn-secondary" 
                        style={{padding: '8px 16px'}}
                        onClick={() => handleJoin(campaign.id)}
                        disabled={campaign.slots_filled >= campaign.slots_total}
                      >
                        {campaign.slots_filled >= campaign.slots_total ? 'Full' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px'}}>
                No active campaigns available to join right now.
              </div>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default VolunteerDashboard;
