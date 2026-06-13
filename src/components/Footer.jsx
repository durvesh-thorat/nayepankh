import { Link } from 'react-router-dom';
import '../styles/components.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img 
            src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" 
            alt="NayePankh Foundation Logo" 
          />
          <p>
            Think global, Act local. It's that easy to bring a Smile on Their Faces.
          </p>
        </div>
        
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/register">Volunteer With Us</Link></li>
            <li><a href="#campaigns">Active Campaigns</a></li>
            <li><Link to="/admin/login">Admin Access</Link></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Contact Us</h4>
          <ul className="footer-links">
            <li>Email: contact@nayepankh.com</li>
            <li>Phone: +91-8318500748</li>
            <li style={{ marginTop: '16px' }}>
              <strong>Follow Us</strong><br/>
              @nayepankhfoundation on Instagram, LinkedIn, Facebook
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        UP Govt. Registered | Indian Society Act 1860 | 80G & 12A Certified | NITI Aayog Affiliated
      </div>
    </footer>
  );
};

export default Footer;
