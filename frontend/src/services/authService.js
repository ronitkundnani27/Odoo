// Mock Authentication Service - This will be replaced by real API calls

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock users database
let users = [
  {
    id: 1,
    email: 'admin@gearguard.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    department: 'Administration'
  },
  {
    id: 2,
    email: 'tech@gearguard.com',
    password: 'tech123',
    name: 'John Technician',
    role: 'technician',
    department: 'Maintenance'
  },
  {
    id: 3,
    email: 'manager@gearguard.com',
    password: 'manager123',
    name: 'Sarah Manager',
    role: 'manager',
    department: 'Operations'
  }
];

// Current session
let currentUser = null;
let authToken = null;

// Helper functions
const generateToken = () => {
  return 'mock_token_' + Math.random().toString(36).substr(2, 9);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Authentication API
export const authAPI = {
  // Login
  async login(email, password) {
    await delay();
    
    if (!email || !password) {
      return { 
        success: false, 
        error: 'Email and password are required' 
      };
    }

    if (!validateEmail(email)) {
      return { 
        success: false, 
        error: 'Please enter a valid email address' 
      };
    }

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { 
        success: false, 
        error: 'Invalid email or password' 
      };
    }

    // Generate token and set current user
    authToken = generateToken();
    currentUser = { ...user };
    delete currentUser.password; // Don't include password in response

    // Store in localStorage for persistence
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return { 
      success: true, 
      data: { 
        user: currentUser, 
        token: authToken 
      } 
    };
  },

  // Register
  async register(userData) {
    await delay();
    
    const { email, password, name, role = 'technician', department } = userData;

    // Validation
    if (!email || !password || !name) {
      return { 
        success: false, 
        error: 'Email, password, and name are required' 
      };
    }

    if (!validateEmail(email)) {
      return { 
        success: false, 
        error: 'Please enter a valid email address' 
      };
    }

    if (password.length < 6) {
      return { 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      };
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { 
        success: false, 
        error: 'User with this email already exists' 
      };
    }

    // Create new user
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      email,
      password,
      name,
      role,
      department: department || 'General'
    };

    users.push(newUser);

    // Don't auto-login after registration
    return { 
      success: true, 
      data: { 
        message: 'Account created successfully. Please login with your credentials.',
        email: email
      } 
    };
  },

  // Logout
  async logout() {
    await delay(200);
    
    currentUser = null;
    authToken = null;
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    return { success: true };
  },

  // Get current user
  getCurrentUser() {
    // Try to restore from localStorage
    if (!currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        currentUser = JSON.parse(storedUser);
        authToken = storedToken;
      }
    }
    
    return currentUser;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  // Get auth token
  getToken() {
    if (!authToken) {
      authToken = localStorage.getItem('authToken');
    }
    return authToken;
  },

  // Verify token (simulate server verification)
  async verifyToken(token) {
    await delay(200);
    
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token === storedToken && storedUser) {
      currentUser = JSON.parse(storedUser);
      authToken = token;
      return { success: true, data: { user: currentUser } };
    }
    
    return { success: false, error: 'Invalid token' };
  }
};

// Export current user for components
export const getCurrentUser = () => authAPI.getCurrentUser();