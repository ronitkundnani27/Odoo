import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Settings, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/authService';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'technician',
    teamId: ''
  });
  const [dropdownData, setDropdownData] = useState({
    roles: [],
    teams: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const navigate = useNavigate();

  // Fetch roles and departments on component mount
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await api.get('/auth/form-data');
        if (response.data.success) {
          setDropdownData(response.data.data);
          // Set default role if available
          if (response.data.data.roles.length > 0) {
            const defaultRole = response.data.data.roles.find(r => r.name === 'technician') || response.data.data.roles[0];
            setFormData(prev => ({ ...prev, role: defaultRole.name }));
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('Failed to load registration form data. Please refresh the page.');
      }
    };

    fetchFormData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Use authAPI directly instead of useAuth register
      const result = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        teamId: formData.teamId ? parseInt(formData.teamId) : null
      });

      if (result.success) {
        // Don't auto-login, just show success message
        setRegisteredEmail(formData.email);
        setSuccess(true);
        // Clear the form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'technician',
          teamId: ''
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { 
        message: `Account created successfully! Please login with your credentials.`,
        email: registeredEmail 
      } 
    });
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
      <div style={{ width: '100%', maxWidth: '500px' }}>
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
            Create your account
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-center">
              {success ? 'Registration Successful!' : 'Sign Up'}
            </h2>
          </div>
          <div className="card-body">
            {success ? (
              // Success message
              <div className="text-center">
                <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '16px', color: '#10b981' }}>Account Created Successfully!</h3>
                <p style={{ marginBottom: '24px', color: '#6b7280' }}>
                  Your account has been created with email: <strong>{registeredEmail}</strong>
                </p>
                <p style={{ marginBottom: '24px', color: '#6b7280' }}>
                  Please login with your new credentials to access GearGuard.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleGoToLogin}
                  style={{ width: '100%' }}
                >
                  Go to Login
                </button>
              </div>
            ) : (
              // Registration form
              <>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Email Address *</label>
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
                      <label className="form-label">Role *</label>
                      <select
                        name="role"
                        className="form-control"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      >
                        {dropdownData.roles.map(role => (
                          <option key={role.id} value={role.name}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Team *</label>
                      <select
                        name="teamId"
                        className="form-control"
                        value={formData.teamId}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Team</option>
                        {dropdownData.teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter password"
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
                      <small className="text-muted">Minimum 6 characters</small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          className="form-control"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          required
                          disabled={loading}
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', marginTop: '20px' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner mr-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-2" />
                        Create Account
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
                    Already have an account?
                  </p>
                  <Link 
                    to="/login" 
                    className="btn btn-secondary"
                    style={{ textDecoration: 'none' }}
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;