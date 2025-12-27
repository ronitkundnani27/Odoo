// Script to reset maintenance teams to only 3 teams
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../config/database');

async function resetTeams() {
  try {
    console.log('🔄 Resetting maintenance teams...');

    // Get the IDs of the 3 teams we want to keep
    const [mechanicalTeam] = await pool.execute(
      "SELECT id FROM maintenance_teams WHERE name = 'Mechanical Team' LIMIT 1"
    );
    const [technicalTeam] = await pool.execute(
      "SELECT id FROM maintenance_teams WHERE name = 'Technical Team' LIMIT 1"
    );
    const [vehicleTeam] = await pool.execute(
      "SELECT id FROM maintenance_teams WHERE name = 'Vehicle Team' LIMIT 1"
    );

    if (!mechanicalTeam[0] || !technicalTeam[0] || !vehicleTeam[0]) {
      console.log('❌ Required teams not found. Creating them first...');
      
      // Create the 3 teams if they don't exist
      const teams = ['Mechanical Team', 'Technical Team', 'Vehicle Team'];
      for (const teamName of teams) {
        const [existing] = await pool.execute(
          'SELECT id FROM maintenance_teams WHERE name = ?',
          [teamName]
        );
        if (existing.length === 0) {
          await pool.execute(
            'INSERT INTO maintenance_teams (name) VALUES (?)',
            [teamName]
          );
          console.log(`✅ Created team: ${teamName}`);
        }
      }

      // Re-fetch the IDs
      const [mech] = await pool.execute(
        "SELECT id FROM maintenance_teams WHERE name = 'Mechanical Team' LIMIT 1"
      );
      const [tech] = await pool.execute(
        "SELECT id FROM maintenance_teams WHERE name = 'Technical Team' LIMIT 1"
      );
      const [veh] = await pool.execute(
        "SELECT id FROM maintenance_teams WHERE name = 'Vehicle Team' LIMIT 1"
      );

      const mechanicalId = mech[0].id;
      const technicalId = tech[0].id;
      const vehicleId = veh[0].id;

      console.log(`\n📋 Team IDs:`);
      console.log(`   Mechanical Team: ${mechanicalId}`);
      console.log(`   Technical Team: ${technicalId}`);
      console.log(`   Vehicle Team: ${vehicleId}\n`);

      // Update equipment that uses old teams
      const [equipmentResult] = await pool.execute(
        'UPDATE equipment SET maintenance_team_id = ? WHERE maintenance_team_id NOT IN (?, ?, ?)',
        [mechanicalId, mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Updated ${equipmentResult.affectedRows} equipment records`);

      // Update maintenance requests that use old teams
      const [requestsResult] = await pool.execute(
        'UPDATE maintenance_requests SET team_id = ? WHERE team_id NOT IN (?, ?, ?)',
        [mechanicalId, mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Updated ${requestsResult.affectedRows} maintenance request records`);

      // Remove team members from old teams
      const [membersResult] = await pool.execute(
        'DELETE FROM team_members WHERE team_id NOT IN (?, ?, ?)',
        [mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Removed ${membersResult.affectedRows} team member assignments`);

      // Delete old teams
      const [teamsResult] = await pool.execute(
        'DELETE FROM maintenance_teams WHERE id NOT IN (?, ?, ?)',
        [mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Deleted ${teamsResult.affectedRows} old teams`);

    } else {
      const mechanicalId = mechanicalTeam[0].id;
      const technicalId = technicalTeam[0].id;
      const vehicleId = vehicleTeam[0].id;

      console.log(`\n📋 Team IDs:`);
      console.log(`   Mechanical Team: ${mechanicalId}`);
      console.log(`   Technical Team: ${technicalId}`);
      console.log(`   Vehicle Team: ${vehicleId}\n`);

      // Update equipment that uses old teams
      const [equipmentResult] = await pool.execute(
        'UPDATE equipment SET maintenance_team_id = ? WHERE maintenance_team_id NOT IN (?, ?, ?)',
        [mechanicalId, mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Updated ${equipmentResult.affectedRows} equipment records`);

      // Update maintenance requests that use old teams
      const [requestsResult] = await pool.execute(
        'UPDATE maintenance_requests SET team_id = ? WHERE team_id NOT IN (?, ?, ?)',
        [mechanicalId, mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Updated ${requestsResult.affectedRows} maintenance request records`);

      // Remove team members from old teams
      const [membersResult] = await pool.execute(
        'DELETE FROM team_members WHERE team_id NOT IN (?, ?, ?)',
        [mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Removed ${membersResult.affectedRows} team member assignments`);

      // Delete old teams
      const [teamsResult] = await pool.execute(
        'DELETE FROM maintenance_teams WHERE id NOT IN (?, ?, ?)',
        [mechanicalId, technicalId, vehicleId]
      );
      console.log(`✅ Deleted ${teamsResult.affectedRows} old teams`);
    }

    // Verify the result
    const [finalTeams] = await pool.execute('SELECT * FROM maintenance_teams ORDER BY name');
    console.log(`\n✅ Final teams (${finalTeams.length}):`);
    finalTeams.forEach(team => {
      console.log(`   - ${team.name} (ID: ${team.id})`);
    });

    console.log('\n🎉 Teams reset successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting teams:', error);
    process.exit(1);
  }
}

resetTeams();
