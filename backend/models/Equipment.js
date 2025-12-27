const { pool } = require('../config/database');
const User = require('./User');

class Equipment {
  // Create equipment table if it doesn't exist (using your schema)
  static async createTable() {
    const createEquipmentTableQuery = `
      CREATE TABLE IF NOT EXISTS equipment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        serial_number VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100),
        department_id INT NOT NULL,
        assigned_employee_id INT,
        maintenance_team_id INT NOT NULL,
        purchase_date DATE,
        warranty_expiry DATE,
        location VARCHAR(150),
        status ENUM('active', 'scrapped') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (assigned_employee_id) REFERENCES users(id),
        FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id)
      )
    `;

    // Create departments table
    const createDepartmentsTableQuery = `
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `;

    // Create maintenance_teams table
    const createMaintenanceTeamsTableQuery = `
      CREATE TABLE IF NOT EXISTS maintenance_teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await pool.execute(createDepartmentsTableQuery);
      await pool.execute(createMaintenanceTeamsTableQuery);
      await pool.execute(createEquipmentTableQuery);
      console.log('✅ Equipment tables ready');
    } catch (error) {
      console.error('❌ Error creating equipment tables:', error.message);
      throw error;
    }
  }

  // Get all equipment with related data
  static async getAll() {
    const selectQuery = `
      SELECT 
        e.*,
        d.name as department_name,
        u.name as assigned_employee_name,
        mt.name as maintenance_team_name
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.assigned_employee_id = u.id
      LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
      ORDER BY e.created_at DESC
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery);
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        serialNumber: row.serial_number,
        department: row.department_name,
        departmentId: row.department_id,
        assignedEmployee: row.assigned_employee_name,
        assignedEmployeeId: row.assigned_employee_id,
        maintenanceTeam: row.maintenance_team_name,
        maintenanceTeamId: row.maintenance_team_id,
        purchaseDate: row.purchase_date,
        warrantyExpiry: row.warranty_expiry,
        location: row.location,
        status: row.status === 'active' ? 'Active' : 'Scrapped',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get equipment by ID
  static async findById(id) {
    const selectQuery = `
      SELECT 
        e.*,
        d.name as department_name,
        u.name as assigned_employee_name,
        mt.name as maintenance_team_name
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.assigned_employee_id = u.id
      LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
      WHERE e.id = ?
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery, [id]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        serialNumber: row.serial_number,
        department: row.department_name,
        departmentId: row.department_id,
        assignedEmployee: row.assigned_employee_name,
        assignedEmployeeId: row.assigned_employee_id,
        maintenanceTeam: row.maintenance_team_name,
        maintenanceTeamId: row.maintenance_team_id,
        purchaseDate: row.purchase_date,
        warrantyExpiry: row.warranty_expiry,
        location: row.location,
        status: row.status === 'active' ? 'Active' : 'Scrapped',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new equipment
  static async create(equipmentData) {
    const { 
      name, 
      serialNumber, 
      departmentId, 
      assignedEmployeeId, 
      maintenanceTeamId, 
      purchaseDate, 
      warrantyExpiry, 
      location 
    } = equipmentData;
    
    const insertQuery = `
      INSERT INTO equipment (
        name, serial_number, department_id, assigned_employee_id, 
        maintenance_team_id, purchase_date, warranty_expiry, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await pool.execute(insertQuery, [
        name, 
        serialNumber, 
        departmentId, 
        assignedEmployeeId, 
        maintenanceTeamId, 
        purchaseDate || null, 
        warrantyExpiry || null, 
        location
      ]);
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Update equipment
  static async update(id, equipmentData) {
    const { 
      name, 
      serialNumber, 
      departmentId, 
      assignedEmployeeId, 
      maintenanceTeamId, 
      purchaseDate, 
      warrantyExpiry, 
      location,
      status
    } = equipmentData;
    
    const updateQuery = `
      UPDATE equipment SET 
        name = ?, 
        serial_number = ?, 
        department_id = ?, 
        assigned_employee_id = ?, 
        maintenance_team_id = ?, 
        purchase_date = ?, 
        warranty_expiry = ?, 
        location = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      const equipmentStatus = status === 'Active' ? 'active' : 'scrapped';
      await pool.execute(updateQuery, [
        name, 
        serialNumber, 
        departmentId, 
        assignedEmployeeId, 
        maintenanceTeamId, 
        purchaseDate || null, 
        warrantyExpiry || null, 
        location,
        equipmentStatus,
        id
      ]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete equipment
  static async delete(id) {
    const deleteQuery = 'DELETE FROM equipment WHERE id = ?';
    
    try {
      const [result] = await pool.execute(deleteQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all departments
  static async getDepartments() {
    const selectQuery = 'SELECT * FROM departments ORDER BY name';
    
    try {
      const [rows] = await pool.execute(selectQuery);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all maintenance teams
  static async getMaintenanceTeams() {
    const selectQuery = 'SELECT * FROM maintenance_teams ORDER BY name';
    
    try {
      const [rows] = await pool.execute(selectQuery);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (technicians)
  static async getUsers() {
    return await User.getAllWithRoles();
  }

  // Find user by name (for assigned employee lookup)
  static async findUserByName(name) {
    return await User.findByName(name);
  }

  // Find department by name
  static async findDepartmentByName(name) {
    const selectQuery = 'SELECT * FROM departments WHERE name = ?';
    
    try {
      const [rows] = await pool.execute(selectQuery, [name]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create department if it doesn't exist
  static async createDepartment(name) {
    const insertQuery = 'INSERT INTO departments (name) VALUES (?)';
    
    try {
      const [result] = await pool.execute(insertQuery, [name]);
      return { id: result.insertId, name };
    } catch (error) {
      throw error;
    }
  }

  // Seed initial data
  static async seedInitialData() {
    try {
      // Seed departments
      const departments = [
        'Production', 'IT', 'Logistics', 'Maintenance', 
        'Quality Control', 'Administration'
      ];
      
      for (const deptName of departments) {
        const existing = await this.findDepartmentByName(deptName);
        if (!existing) {
          await this.createDepartment(deptName);
        }
      }

      // Seed maintenance teams (only 3 specific teams)
      // Clear all teams first (if no foreign key constraints)
      try {
        await pool.execute('DELETE FROM maintenance_teams');
      } catch (error) {
        // If delete fails due to foreign keys, just continue
        console.log('⚠️  Cannot clear teams (foreign key constraint), will update existing');
      }
      
      // Insert only the 3 teams we want
      const teams = ['Mechanical Team', 'Technical Team', 'Vehicle Team'];
      
      for (const teamName of teams) {
        const checkQuery = 'SELECT * FROM maintenance_teams WHERE name = ?';
        const [existing] = await pool.execute(checkQuery, [teamName]);
        
        if (existing.length === 0) {
          const insertQuery = 'INSERT INTO maintenance_teams (name) VALUES (?)';
          await pool.execute(insertQuery, [teamName]);
        }
      }

      console.log('✅ Initial equipment data seeded (3 teams configured)');
    } catch (error) {
      console.error('❌ Error seeding initial data:', error.message);
    }
  }
}

module.exports = Equipment;