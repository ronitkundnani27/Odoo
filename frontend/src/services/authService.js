import api from './api';

// Authentication API service that connects to the real backend
export const authAPI = {
  // Login
  async login(email, password) {
    try {
      const response = await api.post('/auth/signin', {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store in localStorage for persistence
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));

        return { 
          success: true, 
          data: { user, token } 
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.message) {
        return { 
          success: false, 
          error: error.response.data.message 
        };
      }
      
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  },

  // Register
  async register(userData) {
    try {
      const { name, email, password, role, department } = userData;
      
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        role,
        department
      });

      if (response.data.success) {
        // Don't auto-login, just return success message
        return { 
          success: true, 
          data: { 
            message: 'Account created successfully. Please login with your credentials.',
            email: email
          } 
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.message) {
        return { 
          success: false, 
          error: error.response.data.message 
        };
      }
      
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  },

  // Logout
  async logout() {
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }

    return { success: true };
  },

  // Get current user
  getCurrentUser() {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const user = this.getCurrentUser();
    const token = this.getToken();
    return !!(user && token);
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Verify token with server
  async verifyToken(token) {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        const user = response.data.data.user;
        // Update stored user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, data: { user } };
      } else {
        return { success: false, error: 'Invalid token' };
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: 'Token verification failed' };
    }
  },

  // Get user profile (protected route)
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        const user = response.data.data.user;
        // Update stored user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, data: { user } };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Failed to get user profile' };
    }
  }
};

// Export current user for components
export const getCurrentUser = () => authAPI.getCurrentUser();