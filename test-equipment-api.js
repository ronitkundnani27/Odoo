const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function testEquipmentAPI() {
  try {
    console.log('🧪 Testing Equipment API...\n');

    // Step 1: Create a user (technician)
    console.log('1. Creating a technician user...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'John Technician',
      email: 'john.tech@gearguard.com',
      password: 'password123',
      role: 'technician',
      department: 'Maintenance'
    });

    if (signupResponse.data.success) {
      authToken = signupResponse.data.data.token;
      console.log('✅ User created:', signupResponse.data.data.user.name);
    } else {
      console.log('❌ User creation failed:', signupResponse.data.message);
      return;
    }

    // Step 2: Get dropdown data
    console.log('\n2. Getting dropdown data...');
    const dropdownResponse = await axios.get(`${BASE_URL}/equipment/data/dropdowns`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (dropdownResponse.data.success) {
      console.log('✅ Dropdown data retrieved:');
      console.log('   - Departments:', dropdownResponse.data.data.departments.length);
      console.log('   - Teams:', dropdownResponse.data.data.maintenanceTeams.length);
      console.log('   - Users:', dropdownResponse.data.data.users.length);
      console.log('   - Categories:', dropdownResponse.data.data.categories.length);
    }

    // Step 3: Create equipment
    console.log('\n3. Creating equipment...');
    const equipmentData = {
      name: 'CNC Machine X1',
      serialNumber: 'CNC-2024-001',
      category: 'Manufacturing',
      department: 'Production',
      assignedEmployee: 'John Technician',
      maintenanceTeamId: 1,
      purchaseDate: '2024-01-15',
      warrantyExpiry: '2026-01-15',
      location: 'Production Floor A'
    };

    const createResponse = await axios.post(`${BASE_URL}/equipment`, equipmentData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (createResponse.data.success) {
      console.log('✅ Equipment created successfully:');
      console.log('   - ID:', createResponse.data.data.id);
      console.log('   - Name:', createResponse.data.data.name);
      console.log('   - Assigned to:', createResponse.data.data.assignedEmployee);
    }

    // Step 4: Get all equipment
    console.log('\n4. Getting all equipment...');
    const getAllResponse = await axios.get(`${BASE_URL}/equipment`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (getAllResponse.data.success) {
      console.log('✅ Equipment list retrieved:', getAllResponse.data.data.length, 'items');
    }

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
      if (error.response.data.error) {
        console.error('Error details:', error.response.data.error);
      }
    } else {
      console.error('Network error:', error.message);
    }
  }
}

// Run the test
testEquipmentAPI();