const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = null;
let testEquipmentId = null;

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function to run a test
async function runTest(testName, testFunction) {
  totalTests++;
  try {
    console.log(`\n🧪 ${testName}`);
    await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    failedTests++;
  }
}

// Helper function to make authenticated requests
const authRequest = (config) => ({
  ...config,
  headers: {
    ...config.headers,
    Authorization: `Bearer ${authToken}`
  }
});

async function runAllTests() {
  console.log('🚀 Starting GearGuard API Test Suite');
  console.log('=====================================\n');

  // Authentication Tests
  await runTest('User Registration', testUserRegistration);
  await runTest('User Login', testUserLogin);
  await runTest('Get Form Data', testGetFormData);
  await runTest('Invalid Login', testInvalidLogin);
  await runTest('Duplicate Registration', testDuplicateRegistration);

  // Equipment Tests
  await runTest('Get Dropdown Data', testGetDropdownData);
  await runTest('Create Equipment (Valid)', testCreateEquipment);
  await runTest('Get All Equipment', testGetAllEquipment);
  await runTest('Get Equipment by ID', testGetEquipmentById);
  await runTest('Update Equipment', testUpdateEquipment);
  await runTest('Create Equipment (Missing Fields)', testCreateEquipmentMissingFields);
  await runTest('Create Equipment (Invalid User)', testCreateEquipmentInvalidUser);
  await runTest('Create Equipment (Duplicate Serial)', testCreateEquipmentDuplicateSerial);
  await runTest('Get Equipment (Invalid ID)', testGetEquipmentInvalidId);
  await runTest('Delete Equipment', testDeleteEquipment);

  // Security Tests
  await runTest('Unauthorized Access', testUnauthorizedAccess);
  await runTest('Invalid Token', testInvalidToken);
  await runTest('SQL Injection Prevention', testSQLInjection);

  // Print Results
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Please review the issues above.`);
  }
}

// Authentication Test Functions
async function testUserRegistration() {
  const userData = {
    name: 'Test User API',
    email: 'testapi@gearguard.com',
    password: 'password123',
    role: 'technician',
    department: 'Maintenance'
  };

  const response = await axios.post(`${BASE_URL}/auth/signup`, userData);
  
  if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
  if (!response.data.success) throw new Error('Response success should be true');
  if (!response.data.data.token) throw new Error('Token not returned');
  if (!response.data.data.user.id) throw new Error('User ID not returned');

  authToken = response.data.data.token;
  testUserId = response.data.data.user.id;
}

async function testUserLogin() {
  const loginData = {
    email: 'testapi@gearguard.com',
    password: 'password123'
  };

  const response = await axios.post(`${BASE_URL}/auth/signin`, loginData);
  
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.success) throw new Error('Login should be successful');
  if (!response.data.data.token) throw new Error('Token not returned');

  authToken = response.data.data.token; // Update token
}

async function testGetFormData() {
  const response = await axios.get(`${BASE_URL}/auth/form-data`);
  
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.success) throw new Error('Response should be successful');
  if (!Array.isArray(response.data.data.roles)) throw new Error('Roles should be an array');
  if (!Array.isArray(response.data.data.departments)) throw new Error('Departments should be an array');
}

async function testInvalidLogin() {
  const loginData = {
    email: 'testapi@gearguard.com',
    password: 'wrongpassword'
  };

  try {
    await axios.post(`${BASE_URL}/auth/signin`, loginData);
    throw new Error('Should have failed with invalid credentials');
  } catch (error) {
    if (error.response?.status !== 401) {
      throw new Error(`Expected 401, got ${error.response?.status}`);
    }
  }
}

async function testDuplicateRegistration() {
  const userData = {
    name: 'Duplicate User',
    email: 'testapi@gearguard.com', // Same email as before
    password: 'password123',
    role: 'technician'
  };

  try {
    await axios.post(`${BASE_URL}/auth/signup`, userData);
    throw new Error('Should have failed with duplicate email');
  } catch (error) {
    if (error.response?.status !== 409) {
      throw new Error(`Expected 409, got ${error.response?.status}`);
    }
  }
}

// Equipment Test Functions
async function testGetDropdownData() {
  const response = await axios.get(`${BASE_URL}/equipment/data/dropdowns`, authRequest({}));
  
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.success) throw new Error('Response should be successful');
  if (!Array.isArray(response.data.data.departments)) throw new Error('Departments should be an array');
  if (!Array.isArray(response.data.data.maintenanceTeams)) throw new Error('Maintenance teams should be an array');
  if (!Array.isArray(response.data.data.users)) throw new Error('Users should be an array');
}

async function testCreateEquipment() {
  const equipmentData = {
    name: 'Test API Machine',
    serialNumber: 'API-TEST-001',
    department: 'Production',
    assignedEmployee: 'Test User API',
    maintenanceTeamId: 1,
    purchaseDate: '2024-01-15',
    warrantyExpiry: '2026-01-15',
    location: 'Test Floor A'
  };

  const response = await axios.post(`${BASE_URL}/equipment`, equipmentData, authRequest({}));
  
  if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
  if (!response.data.success) throw new Error('Equipment creation should be successful');
  if (!response.data.data.id) throw new Error('Equipment ID not returned');

  testEquipmentId = response.data.data.id;
}

async function testGetAllEquipment() {
  const response = await axios.get(`${BASE_URL}/equipment`, authRequest({}));
  
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.success) throw new Error('Response should be successful');
  if (!Array.isArray(response.data.data)) throw new Error('Equipment data should be an array');
  if (response.data.data.length === 0) throw new Error('Should have at least one equipment item');
}

async function testGetEquipmentById() {
  if (!testEquipmentId) throw new Error('No test equipment ID available');

  const response = await axios.get(`${BASE_URL}/equipment/${testEquipmentId}`, authRequest({}));
  
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.success) throw new Error('Response should be successful');
  if (response.data.data.id !== testEquipmentId) throw new Error('Wrong equipment returned');
}

async function testUpdateEquipment() {
  if (!testEquipmentId) throw new Error('No test equipment ID available');

  const updateData = {
    name: 'Updated Test API Machine',
    serialNumber: 'API-TEST-001',
    department: 'Production',
    assignedEmployee: 'Test User API',
    maintenanceTeamId: 1,
    location: 'Updated Test Floor B',
    status: 'Active'
  };

  const response = await axios.put(`${BASE_URL}/equipment/${testEquipmentId}`, updateData, authRequest({}));
  
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.success) throw new Error('Equipment update should be successful');
  if (response.data.data.location !== 'Updated Test Floor B') throw new Error('Equipment not updated correctly');
}

async function testCreateEquipmentMissingFields() {
  const incompleteData = {
    name: 'Incomplete Machine'
    // Missing required fields
  };

  try {
    await axios.post(`${BASE_URL}/equipment`, incompleteData, authRequest({}));
    throw new Error('Should have failed with missing fields');
  } catch (error) {
    if (error.response?.status !== 400) {
      throw new Error(`Expected 400, got ${error.response?.status}`);
    }
  }
}

async function testCreateEquipmentInvalidUser() {
  const equipmentData = {
    name: 'Invalid User Machine',
    serialNumber: 'INVALID-001',
    department: 'Production',
    assignedEmployee: 'Non Existent User',
    maintenanceTeamId: 1,
    location: 'Floor A'
  };

  try {
    await axios.post(`${BASE_URL}/equipment`, equipmentData, authRequest({}));
    throw new Error('Should have failed with invalid user');
  } catch (error) {
    if (error.response?.status !== 400) {
      throw new Error(`Expected 400, got ${error.response?.status}`);
    }
  }
}

async function testCreateEquipmentDuplicateSerial() {
  const equipmentData = {
    name: 'Duplicate Serial Machine',
    serialNumber: 'API-TEST-001', // Same as first equipment
    department: 'Production',
    assignedEmployee: 'Test User API',
    maintenanceTeamId: 1,
    location: 'Floor A'
  };

  try {
    await axios.post(`${BASE_URL}/equipment`, equipmentData, authRequest({}));
    throw new Error('Should have failed with duplicate serial number');
  } catch (error) {
    if (error.response?.status !== 409) {
      throw new Error(`Expected 409, got ${error.response?.status}`);
    }
  }
}

async function testGetEquipmentInvalidId() {
  try {
    await axios.get(`${BASE_URL}/equipment/999999`, authRequest({}));
    throw new Error('Should have failed with invalid ID');
  } catch (error) {
    if (error.response?.status !== 404) {
      throw new Error(`Expected 404, got ${error.response?.status}`);
    }
  }
}

async function testDeleteEquipment() {
  if (!testEquipmentId) throw new Error('No test equipment ID available');

  const response = await axios.delete(`${BASE_URL}/equipment/${testEquipmentId}`, authRequest({}));
  
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.success) throw new Error('Equipment deletion should be successful');

  // Verify it's deleted
  try {
    await axios.get(`${BASE_URL}/equipment/${testEquipmentId}`, authRequest({}));
    throw new Error('Equipment should be deleted');
  } catch (error) {
    if (error.response?.status !== 404) {
      throw new Error('Equipment should return 404 after deletion');
    }
  }
}

// Security Test Functions
async function testUnauthorizedAccess() {
  try {
    await axios.get(`${BASE_URL}/equipment`);
    throw new Error('Should have failed without authorization');
  } catch (error) {
    if (error.response?.status !== 401) {
      throw new Error(`Expected 401, got ${error.response?.status}`);
    }
  }
}

async function testInvalidToken() {
  try {
    await axios.get(`${BASE_URL}/equipment`, {
      headers: { Authorization: 'Bearer invalid_token_here' }
    });
    throw new Error('Should have failed with invalid token');
  } catch (error) {
    if (error.response?.status !== 403) {
      throw new Error(`Expected 403, got ${error.response?.status}`);
    }
  }
}

async function testSQLInjection() {
  const maliciousData = {
    name: "'; DROP TABLE equipment; --",
    serialNumber: 'SQL-INJECT-001',
    department: 'Production',
    assignedEmployee: 'Test User API',
    maintenanceTeamId: 1,
    location: 'Floor A'
  };

  const response = await axios.post(`${BASE_URL}/equipment`, maliciousData, authRequest({}));
  
  if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
  if (!response.data.success) throw new Error('Equipment creation should be successful');
  
  // Verify the malicious string was stored as data, not executed
  if (response.data.data.name !== maliciousData.name) {
    throw new Error('Malicious string should be stored as data');
  }

  // Clean up
  await axios.delete(`${BASE_URL}/equipment/${response.data.data.id}`, authRequest({}));
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test suite crashed:', error);
  process.exit(1);
});