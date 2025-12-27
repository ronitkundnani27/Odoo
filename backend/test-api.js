const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
};

async function testAPI() {
  try {
    console.log('🧪 Testing GearGuard API...\n');

    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: Sign Up
    console.log('\n2. Testing signup...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('✅ Signup successful:', signupResponse.data.message);
    console.log('   User:', signupResponse.data.data.user);
    
    const token = signupResponse.data.data.token;

    // Test 3: Sign In
    console.log('\n3. Testing signin...');
    const signinResponse = await axios.post(`${BASE_URL}/auth/signin`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Signin successful:', signinResponse.data.message);
    console.log('   User:', signinResponse.data.data.user);

    // Test 4: Get Profile (Protected Route)
    console.log('\n4. Testing protected profile endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.data.user);

    // Test 5: Logout
    console.log('\n5. Testing logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Logout successful:', logoutResponse.data.message);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run tests
testAPI();