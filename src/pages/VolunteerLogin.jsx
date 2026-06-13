import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../styles/Auth.css';

const VolunteerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/api/auth/volunteer/login', formData);
      const { access_token, volunteer } = response.data;
      
      login(access_token, volunteer, 'volunteer');
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-transition">
      <div className="auth-left text-teal">
        <div className="auth-logo">
          <Link to="/">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" />
          </Link>
        </div>
        <div className="auth-quote-wrap">
          <div className="auth-quote">"It's that easy to bring a Smile on Their Faces."</div>
          <div className="auth-author">— NayePankh Foundation</div>
        </div>
        <div className="auth-stat">
          <strong>12+</strong>
          <span>Cities covered across India</span>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to your volunteer dashboard to manage your campaigns.</p>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
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
            <label className="form-label" style={{display: 'flex', justifyContent: 'space-between'}}>
              Password
              <span style={{color: 'var(--color-primary)', fontSize: '0.85rem', cursor: 'pointer'}}>Forgot password?</span>
            </label>
            <div className="password-input-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                className={`form-control ${errors.password ? 'error-border' : ''}`}
                value={formData.password} 
                onChange={handleChange}
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
          
          {apiError && <div className="inline-error">{apiError}</div>}
          
          <button type="submit" className="btn btn-primary submit-btn" disabled={loading} style={{marginTop: '32px'}}>
            {loading ? 'Logging in...' : 'Login securely'}
          </button>
          
          <div className="auth-link-text">
            New here? <Link to="/register">Register as a volunteer</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerLogin;
