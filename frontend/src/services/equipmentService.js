import api from './api';

// Equipment API service that connects to the real backend
export const equipmentAPI = {
  // Get all equipment
  async getAll() {
    try {
      const response = await api.get('/equipment');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to fetch equipment'
        };
      }
    } catch (error) {
      console.error('Get equipment error:', error);
      
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

  // Get equipment by ID
  async getById(id) {
    try {
      const response = await api.get(`/equipment/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Equipment not found'
        };
      }
    } catch (error) {
      console.error('Get equipment by ID error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch equipment'
      };
    }
  },

  // Create new equipment
  async create(equipmentData) {
    try {
      const response = await api.post('/equipment', equipmentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to create equipment'
        };
      }
    } catch (error) {
      console.error('Create equipment error:', error);
      
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

  // Update equipment
  async update(id, equipmentData) {
    try {
      const response = await api.put(`/equipment/${id}`, equipmentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to update equipment'
        };
      }
    } catch (error) {
      console.error('Update equipment error:', error);
      
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

  // Delete equipment
  async delete(id) {
    try {
      const response = await api.delete(`/equipment/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to delete equipment'
        };
      }
    } catch (error) {
      console.error('Delete equipment error:', error);
      
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

  // Get dropdown data (departments, teams, users)
  async getDropdownData() {
    try {
      const response = await api.get('/equipment/data/dropdowns');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to fetch dropdown data'
        };
      }
    } catch (error) {
      console.error('Get dropdown data error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch dropdown data'
      };
    }
  }
};

export default equipmentAPI;