const { pool } = require('../config/database');

class MaintenanceRequest {
  // Create tables if they don't exist
  static async createTables() {
    const createRequestStatusesTable = `
      CREATE TABLE IF NOT EXISTS request_statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `;

    const createMaintenanceRequestsTable = `
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        equipment_id INT NOT NULL,
        team_id INT NOT NULL,
        request_type ENUM('Corrective', 'Preventive') NOT NULL,
        status_id INT NOT NULL,
        assigned_to INT,
        created_by INT NOT NULL,
        scheduled_date DATE,
        started_at DATETIME,
        completed_at DATETIME,
        duration_hours DECIMAL(5,2),
        is_overdue BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (team_id) REFERENCES maintenance_teams(id),
        FOREIGN KEY (status_id) REFERENCES request_statuses(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `;

    try {
      await pool.execute(createRequestStatusesTable);
      await pool.execute(createMaintenanceRequestsTable);
      console.log('✅ Maintenance requests tables ready');
    } catch (error) {
      console.error('❌ Error creating maintenance requests tables:', error.message);
      throw error;
    }
  }

  // Seed initial statuses
  static async seedInitialData() {
    try {
      const statuses = ['New', 'In Progress', 'Repaired', 'Scrap'];
      
      for (const statusName of statuses) {
        const checkQuery = 'SELECT * FROM request_statuses WHERE name = ?';
        const [existing] = await pool.execute(checkQuery, [statusName]);
        
        if (existing.length === 0) {
          const insertQuery = 'INSERT INTO request_statuses (name) VALUES (?)';
          await pool.execute(insertQuery, [statusName]);
        }
      }

      console.log('✅ Initial request statuses seeded');
    } catch (error) {
      console.error('❌ Error seeding request statuses:', error.message);
    }
  }

  // Get all maintenance requests with related data
  static async getAll() {
    const selectQuery = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        mt.name as team_name,
        rs.name as status_name,
        u_assigned.name as assigned_to_name,
        u_created.name as created_by_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN request_statuses rs ON mr.status_id = rs.id
      LEFT JOIN users u_assigned ON mr.assigned_to = u_assigned.id
      LEFT JOIN users u_created ON mr.created_by = u_created.id
      ORDER BY mr.created_at DESC
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery);
      return rows.map(row => ({
        id: row.id,
        subject: row.subject,
        description: row.description,
        equipmentId: row.equipment_id,
        equipmentName: row.equipment_name,
        equipmentSerial: row.equipment_serial,
        teamId: row.team_id,
        teamName: row.team_name,
        requestType: row.request_type,
        statusId: row.status_id,
        status: row.status_name,
        assignedTo: row.assigned_to,
        assignedTechnician: row.assigned_to_name,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        scheduledDate: row.scheduled_date,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationHours: row.duration_hours,
        isOverdue: row.is_overdue,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get request by ID
  static async findById(id) {
    const selectQuery = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        mt.name as team_name,
        rs.name as status_name,
        u_assigned.name as assigned_to_name,
        u_created.name as created_by_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN request_statuses rs ON mr.status_id = rs.id
      LEFT JOIN users u_assigned ON mr.assigned_to = u_assigned.id
      LEFT JOIN users u_created ON mr.created_by = u_created.id
      WHERE mr.id = ?
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery, [id]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        subject: row.subject,
        description: row.description,
        equipmentId: row.equipment_id,
        equipmentName: row.equipment_name,
        teamId: row.team_id,
        teamName: row.team_name,
        requestType: row.request_type,
        statusId: row.status_id,
        status: row.status_name,
        assignedTo: row.assigned_to,
        assignedTechnician: row.assigned_to_name,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        scheduledDate: row.scheduled_date,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationHours: row.duration_hours,
        isOverdue: row.is_overdue,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new maintenance request
  static async create(requestData) {
    const { 
      subject, 
      description, 
      equipmentId, 
      teamId, 
      requestType, 
      statusId, 
      assignedTo, 
      createdBy,
      scheduledDate
    } = requestData;
    
    const insertQuery = `
      INSERT INTO maintenance_requests (
        subject, description, equipment_id, team_id, request_type, 
        status_id, assigned_to, created_by, scheduled_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await pool.execute(insertQuery, [
        subject, 
        description, 
        equipmentId, 
        teamId, 
        requestType, 
        statusId, 
        assignedTo || null, 
        createdBy,
        scheduledDate || null
      ]);
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Update maintenance request
  static async update(id, requestData) {
    const { 
      subject, 
      description, 
      equipmentId, 
      teamId, 
      requestType, 
      statusId, 
      assignedTo,
      scheduledDate,
      startedAt,
      completedAt,
      durationHours
    } = requestData;
    
    const updateQuery = `
      UPDATE maintenance_requests SET 
        subject = ?, 
        description = ?, 
        equipment_id = ?, 
        team_id = ?, 
        request_type = ?, 
        status_id = ?, 
        assigned_to = ?,
        scheduled_date = ?,
        started_at = ?,
        completed_at = ?,
        duration_hours = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      await pool.execute(updateQuery, [
        subject, 
        description, 
        equipmentId, 
        teamId, 
        requestType, 
        statusId, 
        assignedTo || null,
        scheduledDate || null,
        startedAt || null,
        completedAt || null,
        durationHours || null,
        id
      ]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete maintenance request
  static async delete(id) {
    const deleteQuery = 'DELETE FROM maintenance_requests WHERE id = ?';
    
    try {
      const [result] = await pool.execute(deleteQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all request statuses
  static async getStatuses() {
    const selectQuery = 'SELECT * FROM request_statuses ORDER BY id';
    
    try {
      const [rows] = await pool.execute(selectQuery);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Find status by name
  static async findStatusByName(name) {
    const selectQuery = 'SELECT * FROM request_statuses WHERE name = ?';
    
    try {
      const [rows] = await pool.execute(selectQuery, [name]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MaintenanceRequest;