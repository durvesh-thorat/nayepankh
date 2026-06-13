import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../styles/Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    
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
      const response = await api.post('/api/auth/admin/login', formData);
      const { access_token, role } = response.data;
      
      login(access_token, { email: formData.email }, role);
      navigate('/admin');
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page page-transition">
      <div className="admin-login-card">
        <div className="admin-logo-wrap">
          <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh Foundation" />
        </div>
        
        <h1 className="admin-title">Admin Access</h1>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <input 
              type="email" 
              name="email" 
              className={`form-control ${errors.email ? 'error-border' : ''}`}
              value={formData.email} 
              onChange={handleChange}
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input 
              type="password" 
              name="password" 
              className={`form-control ${errors.password ? 'error-border' : ''}`}
              value={formData.password} 
              onChange={handleChange}
            />
            {errors.password && <span className="form-error-msg">{errors.password}</span>}
          </div>
          
          {apiError && <div className="inline-error">{apiError}</div>}
          
          <button type="submit" className="btn btn-secondary submit-btn" disabled={loading} style={{marginTop: '24px'}}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
        <Link to="/login" className="admin-footer-link">
          Volunteer portal &rarr;
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
