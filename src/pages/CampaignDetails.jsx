import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinStatus, setJoinStatus] = useState({ state: 'idle', msg: '' });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await api.get(`/api/campaigns/${id}`);
        setCampaign(response.data);
      } catch (err) {
        console.error('Failed to load campaign', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [id]);

  const handleJoin = async () => {
    setJoinStatus({ state: 'loading', msg: '' });
    try {
      await api.post(`/api/campaigns/${id}/join`);
      setJoinStatus({ state: 'success', msg: 'Successfully joined! See you there.' });
      setCampaign(prev => ({ ...prev, slots_filled: prev.slots_filled + 1 }));
    } catch (err) {
      if (err.response?.status === 409) {
        setJoinStatus({ state: 'error', msg: 'You have already joined this campaign.' });
      } else {
        setJoinStatus({ state: 'error', msg: err.response?.data?.detail || 'Failed to join campaign' });
      }
    }
  };

  const getCampaignTypeDisplay = (type) => {
    const map = {
      'FOOD_DRIVE': { label: 'Food Drive', colorClass: 'badge-saffron' },
      'CLOTHES_DISTRIBUTION': { label: 'Clothes Distribution', colorClass: 'badge-teal' },
      'EDUCATION': { label: 'Education', colorClass: 'badge-green' },
      'SANITARY_AID': { label: 'Sanitary Aid', colorClass: 'badge-grey' },
    };
    return map[type] || { label: type, colorClass: 'badge-grey' };
  };

  if (loading) return <><Navbar /><LoadingSpinner /><Footer /></>;
  if (!campaign) return <><Navbar /><div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Campaign not found or inactive.</div><Footer /></>;

  const typeConfig = getCampaignTypeDisplay(campaign.campaign_type);
  const isFull = campaign.slots_filled >= campaign.slots_total;
  const progressPercent = Math.min(100, Math.max(0, (campaign.slots_filled / campaign.slots_total) * 100));

  return (
    <div className="page-transition">
      <Navbar />
      
      <div className="cd-hero">
        <div className="cd-container">
          <div><span className={`badge ${typeConfig.colorClass}`}>{typeConfig.label}</span></div>
          <h1 className="cd-title">{campaign.title}</h1>
          <div className="cd-meta">
            <span>{campaign.city}</span>
            <span>•</span>
            <span>{new Date(campaign.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
      
      <div className="cd-content-split">
        <div className="cd-main">
          <div style={{
            width: '100%', 
            height: '400px', 
            backgroundColor: '#e8e8e4', 
            borderRadius: '12px',
            marginBottom: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic'
          }}>
            [Photo: Campaign specific documentary style placeholder]
          </div>
          
          <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '24px'}}>About This Initiative</h2>
          <div style={{fontSize: '1.1rem', color: 'var(--color-text-primary)', lineHeight: 1.8}}>
            {campaign.description.split('\n').map((paragraph, idx) => (
              <p key={idx} style={{marginBottom: '16px'}}>{paragraph}</p>
            ))}
          </div>
          
          <div style={{marginTop: '64px', paddingTop: '48px', borderTop: '1px solid var(--color-border)'}}>
            <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '16px'}}>About NayePankh Foundation</h3>
            <p style={{color: 'var(--color-text-secondary)'}}>
              Founded in 2021 by Prashant Shukla, NayePankh Foundation is a UP Govt Registered NGO committed to uplifting the marginalized sections of society through food distribution, education, and hygiene awareness. "Think global, Act local."
            </p>
          </div>
        </div>
        
        <div className="cd-sidebar">
          <div className="join-box">
            <h3 className="join-box-title">Volunteer for this Campaign</h3>
            
            <div className="join-progress">
              <div className="campaign-progress-text" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                <span><strong>{campaign.slots_filled}</strong> volunteers joined</span>
                <span><strong>{campaign.slots_total - campaign.slots_filled}</strong> spots left</span>
              </div>
              <div className="campaign-progress-bar" style={{height: '8px'}}>
                <div className="campaign-progress-fill" style={{width: `${progressPercent}%`}}></div>
              </div>
            </div>
            
            {joinStatus.state === 'success' ? (
              <div style={{textAlign: 'center', padding: '24px 0'}}>
                <div style={{fontSize: '3rem', marginBottom: '16px'}}>✅</div>
                <h4 style={{fontSize: '1.25rem', marginBottom: '8px'}}>You're on the list!</h4>
                <p style={{color: 'var(--color-text-secondary)', marginBottom: '24px'}}>{joinStatus.msg}</p>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{width: '100%'}}>Go to Dashboard</button>
              </div>
            ) : (
              <>
                <button 
                  className="btn btn-primary submit-btn" 
                  onClick={handleJoin}
                  disabled={isFull || joinStatus.state === 'loading'}
                  style={{marginTop: 0, marginBottom: '24px'}}
                >
                  {joinStatus.state === 'loading' ? 'Joining...' : (isFull ? 'Campaign is Full' : 'Join Now')}
                </button>
                
                {joinStatus.state === 'error' && (
                  <div className="inline-error" style={{marginTop: 0, marginBottom: '24px'}}>{joinStatus.msg}</div>
                )}
                
                <div style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'center'}}>
                  <p style={{marginBottom: '8px'}}><strong>WHO IS JOINING</strong></p>
                  <p>Join {campaign.slots_filled} other compassionate individuals making a difference in {campaign.city}.</p>
                </div>
              </>
            )}
            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CampaignDetails;
