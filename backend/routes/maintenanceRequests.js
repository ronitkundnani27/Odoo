const express = require('express');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Equipment = require('../models/Equipment');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get dropdown data for request form (must be before /:id route)
router.get('/data/dropdowns', async (req, res) => {
  try {
    console.log('Getting request form dropdown data...');
    
    const equipment = await Equipment.getAll();
    const maintenanceTeams = await Equipment.getMaintenanceTeams();
    const users = await Equipment.getUsers();
    const statuses = await MaintenanceRequest.getStatuses();
    
    res.status(200).json({
      success: true,
      data: {
        equipment,
        maintenanceTeams,
        users,
        statuses
      }
    });
  } catch (error) {
    console.error('Get dropdown data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dropdown data',
      error: error.message
    });
  }
});

// Get all maintenance requests
router.get('/', async (req, res) => {
  try {
    const requests = await MaintenanceRequest.getAll();
    
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance requests'
    });
  }
});

// Get maintenance request by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await MaintenanceRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get maintenance request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance request'
    });
  }
});

// Update maintenance request status only (for Kanban drag-and-drop)
// IMPORTANT: This must be before GET /:id route to avoid route conflicts
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating request ${id} status to: ${status}`);

    // Check if request exists
    const existingRequest = await MaintenanceRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Find status by name
    const statusRecord = await MaintenanceRequest.findStatusByName(status);
    if (!statusRecord) {
      return res.status(400).json({
        success: false,
        message: `Status '${status}' not found`
      });
    }

    // Update only the status
    const { pool } = require('../config/database');
    const updateQuery = `
      UPDATE maintenance_requests 
      SET status_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.execute(updateQuery, [statusRecord.id, id]);
    
    const updatedRequest = await MaintenanceRequest.findById(id);
    
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

// Create new maintenance request
router.post('/', async (req, res) => {
  try {
    const { 
      subject, 
      description, 
      equipmentId, 
      teamId, 
      requestType, 
      status,
      assignedTo,
      scheduledDate
    } = req.body;

    console.log('Creating maintenance request with data:', req.body);

    // Validation
    if (!subject || !equipmentId || !teamId || !requestType || !status) {
      return res.status(400).json({
        success: false,
        message: 'Subject, equipment, team, request type, and status are required'
      });
    }

    // Find status by name
    const statusRecord = await MaintenanceRequest.findStatusByName(status);
    if (!statusRecord) {
      return res.status(400).json({
        success: false,
        message: `Status '${status}' not found`
      });
    }

    // Get current user ID from JWT token
    const createdBy = req.user.id;

    // Create maintenance request
    const requestData = {
      subject,
      description,
      equipmentId: parseInt(equipmentId),
      teamId: parseInt(teamId),
      requestType,
      statusId: statusRecord.id,
      assignedTo: assignedTo ? parseInt(assignedTo) : null,
      createdBy,
      scheduledDate
    };

    console.log('Creating request with processed data:', requestData);
    const newRequest = await MaintenanceRequest.create(requestData);
    
    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: newRequest
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance request',
      error: error.message
    });
  }
});

// Update maintenance request
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      subject, 
      description, 
      equipmentId, 
      teamId, 
      requestType, 
      status,
      assignedTo,
      scheduledDate,
      startedAt,
      completedAt,
      durationHours
    } = req.body;

    // Check if request exists
    const existingRequest = await MaintenanceRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Validation
    if (!subject || !equipmentId || !teamId || !requestType || !status) {
      return res.status(400).json({
        success: false,
        message: 'Subject, equipment, team, request type, and status are required'
      });
    }

    // Find status by name
    const statusRecord = await MaintenanceRequest.findStatusByName(status);
    if (!statusRecord) {
      return res.status(400).json({
        success: false,
        message: `Status '${status}' not found`
      });
    }

    // Update maintenance request
    const requestData = {
      subject,
      description,
      equipmentId: parseInt(equipmentId),
      teamId: parseInt(teamId),
      requestType,
      statusId: statusRecord.id,
      assignedTo: assignedTo ? parseInt(assignedTo) : null,
      scheduledDate,
      startedAt,
      completedAt,
      durationHours
    };

    const updatedRequest = await MaintenanceRequest.update(id, requestData);
    
    res.status(200).json({
      success: true,
      message: 'Maintenance request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance request'
    });
  }
});

// Delete maintenance request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const existingRequest = await MaintenanceRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    const deleted = await MaintenanceRequest.delete(id);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Maintenance request deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete maintenance request'
      });
    }
  } catch (error) {
    console.error('Delete maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete maintenance request'
    });
  }
});

module.exports = router;
