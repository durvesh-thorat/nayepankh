import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../styles/Auth.css';

const SKILL_OPTIONS = [
  'Teaching', 'Medical Aid', 'Logistics', 'Cooking', 
  'Photography', 'Social Media', 'Fundraising', 'Event Management'
];

const VolunteerRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    availability: 'Both'
  });
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (!formData.city) newErrors.city = 'Please select a city';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: selectedSkills.join(', ')
      };
      
      const response = await api.post('/api/auth/volunteer/register', payload);
      const { access_token, volunteer } = response.data;
      
      login(access_token, volunteer, 'volunteer');
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-transition">
      <div className="auth-left">
        <div className="auth-logo">
          <Link to="/">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh Foundation" />
          </Link>
        </div>
        <div className="auth-quote-wrap">
          <div className="auth-quote">"If we all do something, then together there is no problem that we cannot solve!"</div>
          <div className="auth-author">— Prashant Shukla</div>
        </div>
        <div className="auth-stat">
          <strong>2,00,000+</strong>
          <span>Lives impacted since 2021</span>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-header">
          <h1>Join the Mission</h1>
          <p>Register as a volunteer and start making an impact in your city.</p>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="full_name" 
              className={`form-control ${errors.full_name ? 'error-border' : ''}`}
              value={formData.full_name} 
              onChange={handleChange}
              placeholder="YOUR FULL NAME"
            />
            {errors.full_name && <span className="form-error-msg">{errors.full_name}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email" 
                className={`form-control ${errors.email ? 'error-border' : ''}`}
                value={formData.email} 
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input 
                type="tel" 
                name="phone" 
                className="form-control"
                value={formData.phone} 
                onChange={handleChange}
                placeholder="+91"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                className={`form-control ${errors.password ? 'error-border' : ''}`}
                value={formData.password} 
                onChange={handleChange}
                placeholder="Min. 6 characters"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {errors.password && <span className="form-error-msg">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">City</label>
            <select 
              name="city" 
              className={`form-control ${errors.city ? 'error-border' : ''}`}
              value={formData.city} 
              onChange={handleChange}
            >
              <option value="">Select your city</option>
              <option value="Kanpur">Kanpur</option>
              <option value="Ghaziabad">Ghaziabad</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Other">Other</option>
            </select>
            {errors.city && <span className="form-error-msg">{errors.city}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Your Skills</label>
            <div className="skills-container">
              {SKILL_OPTIONS.map(skill => (
                <div 
                  key={skill}
                  className={`skill-pill ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group" style={{marginTop: '32px'}}>
            <label className="form-label">Availability</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="availability" 
                  value="Weekdays" 
                  checked={formData.availability === 'Weekdays'}
                  onChange={handleChange}
                />
                Weekdays
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="availability" 
                  value="Weekends" 
                  checked={formData.availability === 'Weekends'}
                  onChange={handleChange}
                />
                Weekends
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="availability" 
                  value="Both" 
                  checked={formData.availability === 'Both'}
                  onChange={handleChange}
                />
                Both
              </label>
            </div>
          </div>
          
          {apiError && <div className="inline-error">{apiError}</div>}
          
          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Complete Registration'}
          </button>
          
          <div className="auth-link-text">
            Already a volunteer? <Link to="/login">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerRegister;
