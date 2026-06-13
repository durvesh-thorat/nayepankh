import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Landing.css';

const Landing = () => {
  const mockCampaigns = [
    {
      id: "1",
      title: "Ration Distribution Drive — Kanpur West",
      type: "FOOD_DRIVE",
      city: "Kanpur",
      date: "July 15, 2026",
      slotsFilled: 12,
      slotsTotal: 30,
      description: "Distributing monthly ration kits to 200 families in Kanpur's Govindnagar area. Volunteers needed for packing and distribution.",
      imageDesc: "Volunteers distributing food packets to families, documentary style, warm afternoon light"
    },
    {
      id: "2",
      title: "Hygiene Awareness Camp — Ghaziabad Schools",
      type: "SANITARY_AID",
      city: "Ghaziabad",
      date: "July 22, 2026",
      slotsFilled: 8,
      slotsTotal: 20,
      description: "Running hygiene awareness sessions in 3 government schools. Volunteers with communication skills preferred.",
      imageDesc: "Volunteer explaining hygiene concepts using charts in a classroom setting, candid photography"
    },
    {
      id: "3",
      title: "Weekend Education Camp — Class 6-8",
      type: "EDUCATION",
      city: "Kanpur",
      date: "July 28, 2026",
      slotsFilled: 5,
      slotsTotal: 15,
      description: "Teaching basic Math and English to underprivileged students. Any graduate can volunteer — materials provided.",
      imageDesc: "Volunteer helping a student with homework on a desk, soft natural lighting"
    }
  ];

  const getCampaignTypeDisplay = (type) => {
    const map = {
      'FOOD_DRIVE': { label: 'Food Drive', colorClass: 'badge-saffron' },
      'CLOTHES_DISTRIBUTION': { label: 'Clothes Distribution', colorClass: 'badge-teal' },
      'EDUCATION': { label: 'Education', colorClass: 'badge-green' },
      'SANITARY_AID': { label: 'Sanitary Aid', colorClass: 'badge-grey' },
    };
    return map[type] || { label: type, colorClass: 'badge-grey' };
  };

  return (
    <div className="page-transition">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <span className="hero-label">UP GOVT. REGISTERED NGO</span>
            <h1 className="hero-heading">Give Wings to Those Who Need It Most</h1>
            <p className="hero-subtext">
              Since 2021, NayePankh has uplifted 2,00,000+ lives across Kanpur, Ghaziabad, and beyond — through food drives, education camps, and hygiene awareness.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">Volunteer With Us</Link>
              <a href="#campaigns" className="btn btn-outline">See Active Campaigns</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat-item">
                <strong>2L+</strong> Lives
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <strong>500+</strong> Volunteers
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <strong>12+</strong> Cities
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-image-placeholder">
              <span>[Photo: Volunteers distributing food packets to a line of families at a Kanpur street, warm afternoon light, candid]</span>
              
              <div className="hero-floating-card">
                <span className="badge badge-saffron">Latest Campaign</span>
                <h4>Ration Drive Kanpur</h4>
                <p>Slots filling fast</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Bar */}
      <section className="impact-bar">
        <div className="impact-container">
          <div className="impact-item">
            <div className="impact-number">50,000+</div>
            <div className="impact-label">Food Packets</div>
          </div>
          <div className="impact-item">
            <div className="impact-number">15,000+</div>
            <div className="impact-label">Sanitary Kits</div>
          </div>
          <div className="impact-item">
            <div className="impact-number">8,000+</div>
            <div className="impact-label">Children Educated</div>
          </div>
          <div className="impact-item">
            <div className="impact-number">25,000+</div>
            <div className="impact-label">Clothes Donated</div>
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      <section id="campaigns" className="campaigns-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Active Campaigns</h2>
            <p className="section-subtitle">On the ground, right now</p>
          </div>
          
          <div className="campaigns-list">
            {mockCampaigns.map((campaign) => (
              <div className="campaign-list-item" key={campaign.id}>
                <div className="campaign-image" style={{backgroundColor: '#e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center'}}>
                  <span style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem'}}>
                    [Photo: {campaign.imageDesc}]
                  </span>
                </div>
                <div className="campaign-content">
                  <div>
                    <span className={`badge ${getCampaignTypeDisplay(campaign.type).colorClass}`}>
                      {getCampaignTypeDisplay(campaign.type).label}
                    </span>
                  </div>
                  <h3 className="campaign-title">{campaign.title}</h3>
                  <div className="campaign-meta">
                    <span>{campaign.city}</span>
                    <span>•</span>
                    <span>{campaign.date}</span>
                  </div>
                  <p className="campaign-description">{campaign.description}</p>
                  
                  <div className="campaign-progress-wrap">
                    <div className="campaign-progress-text">
                      {campaign.slotsFilled} of {campaign.slotsTotal} slots filled
                    </div>
                    <div className="campaign-progress-bar">
                      <div 
                        className="campaign-progress-fill" 
                        style={{width: `${Math.min(100, Math.max(0, (campaign.slotsFilled / campaign.slotsTotal) * 100))}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <Link to={`/campaigns/${campaign.id}`} className="btn btn-secondary">Join This Campaign</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container how-it-works-content">
          <div className="hiw-left">
            <h2>How do I get involved?</h2>
          </div>
          <div className="hiw-right">
            <ol className="hiw-steps">
              <li>
                <div className="hiw-step-number">01</div>
                <div className="hiw-step-text">
                  <h3>Register as a Volunteer</h3>
                  <p>Takes less than 30 seconds to join our mission.</p>
                </div>
              </li>
              <li>
                <div className="hiw-step-number">02</div>
                <div className="hiw-step-text">
                  <h3>Browse campaigns</h3>
                  <p>Find open campaigns near you that match your skills.</p>
                </div>
              </li>
              <li>
                <div className="hiw-step-number">03</div>
                <div className="hiw-step-text">
                  <h3>Join with one click</h3>
                  <p>Secure your slot immediately on the dashboard.</p>
                </div>
              </li>
              <li>
                <div className="hiw-step-number">04</div>
                <div className="hiw-step-text">
                  <h3>Show up & serve</h3>
                  <p>Make a real impact on the ground where it counts.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="founder-quote">
        <div className="quote-container">
          <div className="quote-mark">“</div>
          <blockquote className="quote-text">
            If we all do something, then together there is no problem that we cannot solve!
          </blockquote>
          <div className="quote-author">
            — Prashant Shukla, <br/>Founder & President, NayePankh Foundation
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
