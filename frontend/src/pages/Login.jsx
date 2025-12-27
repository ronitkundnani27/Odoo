import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/';

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Pre-fill email if provided
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'admin@gearguard.com', password: 'admin123', role: 'Admin' },
    { email: 'tech@gearguard.com', password: 'tech123', role: 'Technician' },
    { email: 'manager@gearguard.com', password: 'manager123', role: 'Manager' }
  ];

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setError('');
    setSuccessMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo/Header */}
        <div className="text-center mb-3">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Settings size={32} color="#3b82f6" style={{ marginRight: '12px' }} />
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: '700',
              color: '#1f2937'
            }}>
              GearGuard
            </h1>
          </div>
          <p style={{ 
            margin: 0, 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Maintenance Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-center">Sign In</h2>
          </div>
          <div className="card-body">
            {successMessage && (
              <div style={{
                backgroundColor: '#f0fdf4',
                color: '#166534',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
                border: '1px solid #bbf7d0'
              }}>
                {successMessage}
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
                border: '1px solid #fecaca'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner mr-2"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                Don't have an account?
              </p>
              <Link 
                to="/register" 
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '16px' }}>Demo Credentials</h3>
          </div>
          <div className="card-body">
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              Click to use demo credentials:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fillDemoCredentials(cred.email, cred.password)}
                  disabled={loading}
                  style={{ 
                    fontSize: '12px',
                    padding: '6px 12px',
                    textAlign: 'left'
                  }}
                >
                  <strong>{cred.role}:</strong> {cred.email}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;