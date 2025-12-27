import api from './api';

// Maintenance Request API service
export const maintenanceRequestAPI = {
  // Get all maintenance requests
  async getAll() {
    try {
      const response = await api.get('/maintenance-requests');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to fetch maintenance requests'
        };
      }
    } catch (error) {
      console.error('Get maintenance requests error:', error);
      
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

  // Get maintenance request by ID
  async getById(id) {
    try {
      const response = await api.get(`/maintenance-requests/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Maintenance request not found'
        };
      }
    } catch (error) {
      console.error('Get maintenance request by ID error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch maintenance request'
      };
    }
  },

  // Create new maintenance request
  async create(requestData) {
    try {
      const response = await api.post('/maintenance-requests', requestData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to create maintenance request'
        };
      }
    } catch (error) {
      console.error('Create maintenance request error:', error);
      
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

  // Update maintenance request
  async update(id, requestData) {
    try {
      const response = await api.put(`/maintenance-requests/${id}`, requestData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to update maintenance request'
        };
      }
    } catch (error) {
      console.error('Update maintenance request error:', error);
      
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

  // Delete maintenance request
  async delete(id) {
    try {
      const response = await api.delete(`/maintenance-requests/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to delete maintenance request'
        };
      }
    } catch (error) {
      console.error('Delete maintenance request error:', error);
      
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

  // Update maintenance request status only (for Kanban)
  async updateStatus(id, status) {
    try {
      const response = await api.patch(`/maintenance-requests/${id}/status`, { status });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to update status'
        };
      }
    } catch (error) {
      console.error('Update status error:', error);
      
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

  // Get dropdown data for request form
  async getDropdownData() {
    try {
      const response = await api.get('/maintenance-requests/data/dropdowns');
      
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

export default maintenanceRequestAPI;