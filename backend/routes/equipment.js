const express = require('express');
const Equipment = require('../models/Equipment');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All equipment routes require authentication
router.use(authenticateToken);

// Get all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.getAll();
    
    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment'
    });
  }
});

// Get equipment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment'
    });
  }
});

// Create new equipment
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      serialNumber, 
      department, 
      assignedEmployee, 
      maintenanceTeamId, 
      purchaseDate, 
      warrantyExpiry, 
      location 
    } = req.body;

    console.log('Creating equipment with data:', req.body);

    // Validation
    if (!name || !serialNumber || !department || !assignedEmployee || !maintenanceTeamId || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, serial number, department, assigned technician, maintenance team, and location are required'
      });
    }

    // Find or create department
    console.log('Finding department:', department);
    let departmentRecord = await Equipment.findDepartmentByName(department);
    if (!departmentRecord) {
      console.log('Department not found, creating:', department);
      departmentRecord = await Equipment.createDepartment(department);
    }
    console.log('Department record:', departmentRecord);

    // Find assigned employee by name
    console.log('Finding user:', assignedEmployee);
    const assignedEmployeeRecord = await Equipment.findUserByName(assignedEmployee);
    console.log('User record:', assignedEmployeeRecord);
    
    if (!assignedEmployeeRecord) {
      return res.status(400).json({
        success: false,
        message: `User '${assignedEmployee}' not found. Please ensure the technician exists in the system.`
      });
    }

    // Create equipment
    const equipmentData = {
      name,
      serialNumber,
      departmentId: departmentRecord.id,
      assignedEmployeeId: assignedEmployeeRecord.id,
      maintenanceTeamId: parseInt(maintenanceTeamId),
      purchaseDate,
      warrantyExpiry,
      location
    };

    console.log('Creating equipment with processed data:', equipmentData);
    const newEquipment = await Equipment.create(equipmentData);
    
    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: newEquipment
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Equipment with this serial number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: error.message
    });
  }
});

// Update equipment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      serialNumber, 
      department, 
      assignedEmployee, 
      maintenanceTeamId, 
      purchaseDate, 
      warrantyExpiry, 
      location,
      status
    } = req.body;

    // Check if equipment exists
    const existingEquipment = await Equipment.findById(id);
    if (!existingEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Validation
    if (!name || !serialNumber || !department || !assignedEmployee || !maintenanceTeamId || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, serial number, department, assigned technician, maintenance team, and location are required'
      });
    }

    // Find or create department
    let departmentRecord = await Equipment.findDepartmentByName(department);
    if (!departmentRecord) {
      departmentRecord = await Equipment.createDepartment(department);
    }

    // Find assigned employee by name
    const assignedEmployeeRecord = await Equipment.findUserByName(assignedEmployee);
    if (!assignedEmployeeRecord) {
      return res.status(400).json({
        success: false,
        message: `User '${assignedEmployee}' not found. Please ensure the technician exists in the system.`
      });
    }

    // Update equipment
    const equipmentData = {
      name,
      serialNumber,
      departmentId: departmentRecord.id,
      assignedEmployeeId: assignedEmployeeRecord.id,
      maintenanceTeamId: parseInt(maintenanceTeamId),
      purchaseDate,
      warrantyExpiry,
      location,
      status: status || 'Active'
    };

    const updatedEquipment = await Equipment.update(id, equipmentData);
    
    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: updatedEquipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Equipment with this serial number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment'
    });
  }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if equipment exists
    const existingEquipment = await Equipment.findById(id);
    if (!existingEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const deleted = await Equipment.delete(id);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Equipment deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete equipment'
      });
    }
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment'
    });
  }
});

// Get dropdown data (departments, teams, users)
router.get('/data/dropdowns', async (req, res) => {
  try {
    console.log('Getting dropdown data...');
    
    const departments = await Equipment.getDepartments();
    console.log('Departments:', departments);
    
    const maintenanceTeams = await Equipment.getMaintenanceTeams();
    console.log('Maintenance Teams:', maintenanceTeams);
    
    const users = await Equipment.getUsers();
    console.log('Users:', users);
    
    res.status(200).json({
      success: true,
      data: {
        departments,
        maintenanceTeams,
        users
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

module.exports = router;