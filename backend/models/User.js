const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create users table if it doesn't exist (using your schema)
  static async createTable() {
    // Create roles table
    const createRolesTableQuery = `
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `;

    // Create departments table
    const createDepartmentsTableQuery = `
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `;

    // Create maintenance_teams table (if not exists from Equipment model)
    const createMaintenanceTeamsTableQuery = `
      CREATE TABLE IF NOT EXISTS maintenance_teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create users table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Create user_roles junction table
    const createUserRolesTableQuery = `
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `;

    // Create team_members junction table
    const createTeamMembersTableQuery = `
      CREATE TABLE IF NOT EXISTS team_members (
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (team_id, user_id),
        FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    try {
      await pool.execute(createRolesTableQuery);
      await pool.execute(createDepartmentsTableQuery);
      await pool.execute(createMaintenanceTeamsTableQuery);
      await pool.execute(createUsersTableQuery);
      await pool.execute(createUserRolesTableQuery);
      await pool.execute(createTeamMembersTableQuery);
      console.log('✅ Users table ready');
    } catch (error) {
      console.error('❌ Error creating users table:', error.message);
      throw error;
    }
  }

  // Seed initial roles and departments
  static async seedInitialData() {
    try {
      // Seed roles
      const roles = ['admin', 'manager', 'technician', 'operator'];
      
      for (const roleName of roles) {
        const checkQuery = 'SELECT * FROM roles WHERE name = ?';
        const [existing] = await pool.execute(checkQuery, [roleName]);
        
        if (existing.length === 0) {
          const insertQuery = 'INSERT INTO roles (name) VALUES (?)';
          await pool.execute(insertQuery, [roleName]);
        }
      }

      // Seed departments
      const departments = [
        'Production', 'IT', 'Logistics', 'Maintenance', 
        'Quality Control', 'Administration', 'Operations', 'Engineering'
      ];
      
      for (const deptName of departments) {
        const checkQuery = 'SELECT * FROM departments WHERE name = ?';
        const [existing] = await pool.execute(checkQuery, [deptName]);
        
        if (existing.length === 0) {
          const insertQuery = 'INSERT INTO departments (name) VALUES (?)';
          await pool.execute(insertQuery, [deptName]);
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

      console.log('✅ Initial user data seeded (3 teams configured)');
    } catch (error) {
      console.error('❌ Error seeding initial user data:', error.message);
    }
  }

  // Get all roles
  static async getRoles() {
    const selectQuery = 'SELECT * FROM roles ORDER BY name';
    
    try {
      const [rows] = await pool.execute(selectQuery);
      return rows;
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

  // Find role by name
  static async findRoleByName(name) {
    const selectQuery = 'SELECT * FROM roles WHERE name = ?';
    
    try {
      const [rows] = await pool.execute(selectQuery, [name]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
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

  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'technician', teamId } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const insertQuery = `
      INSERT INTO users (name, email, password_hash) 
      VALUES (?, ?, ?)
    `;
    
    try {
      const [result] = await pool.execute(insertQuery, [name, email, hashedPassword]);
      const userId = result.insertId;

      // Find role by name
      const roleRecord = await this.findRoleByName(role);
      if (roleRecord) {
        // Assign role to user
        const insertRoleQuery = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)';
        await pool.execute(insertRoleQuery, [userId, roleRecord.id]);
      }

      // Assign team to user (required)
      if (teamId) {
        const insertTeamQuery = 'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)';
        await pool.execute(insertTeamQuery, [teamId, userId]);
      }

      // Get the created user with role and team info
      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email with roles and departments
  static async findByEmail(email) {
    const selectQuery = `
      SELECT 
        u.*,
        GROUP_CONCAT(r.name) as roles,
        d.name as department_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN departments d ON u.id = d.id
      WHERE u.email = ?
      GROUP BY u.id
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery, [email]);
      if (rows.length === 0) return null;
      
      const user = rows[0];
      return {
        ...user,
        roles: user.roles ? user.roles.split(',') : []
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by name
  static async findByName(name) {
    const selectQuery = `
      SELECT 
        u.*,
        GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.name = ?
      GROUP BY u.id
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery, [name]);
      if (rows.length === 0) return null;
      
      const user = rows[0];
      return {
        ...user,
        roles: user.roles ? user.roles.split(',') : []
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID with roles and team
  static async findById(id) {
    const selectQuery = `
      SELECT 
        u.id, u.name, u.email, u.avatar_url, u.is_active, u.created_at,
        GROUP_CONCAT(DISTINCT r.name) as roles,
        GROUP_CONCAT(DISTINCT mt.name) as teams
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN maintenance_teams mt ON tm.team_id = mt.id
      WHERE u.id = ?
      GROUP BY u.id
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery, [id]);
      if (rows.length === 0) return null;
      
      const user = rows[0];
      return {
        ...user,
        roles: user.roles ? user.roles.split(',') : [],
        role: user.roles ? user.roles.split(',')[0] : null, // Primary role
        teams: user.teams ? user.teams.split(',') : [],
        team: user.teams ? user.teams.split(',')[0] : null // Primary team
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all users with their roles (for equipment assignment)
  static async getAllWithRoles() {
    const selectQuery = `
      SELECT 
        u.id, u.name, u.email, u.is_active,
        GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.is_active = TRUE
      GROUP BY u.id
      ORDER BY u.name
    `;
    
    try {
      const [rows] = await pool.execute(selectQuery);
      return rows.map(user => ({
        ...user,
        roles: user.roles ? user.roles.split(',') : [],
        role: user.roles ? user.roles.split(',')[0] : null
      }));
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Assign role to user
  static async assignRole(userId, roleId) {
    const insertQuery = 'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)';
    
    try {
      await pool.execute(insertQuery, [userId, roleId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Remove role from user
  static async removeRole(userId, roleId) {
    const deleteQuery = 'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?';
    
    try {
      const [result] = await pool.execute(deleteQuery, [userId, roleId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;