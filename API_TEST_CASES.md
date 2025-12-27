# 🧪 GearGuard API Test Cases

## 📋 Test Environment Setup
- **Base URL**: `http://localhost:5000/api`
- **Database**: MySQL `gearguard`
- **Authentication**: JWT Bearer Token

---

## 🔐 Authentication API Tests

### Test Case 1: User Registration
**Endpoint**: `POST /auth/signup`

**Test Data**:
```json
{
  "name": "John Technician",
  "email": "john.tech@gearguard.com",
  "password": "password123",
  "role": "technician",
  "department": "Maintenance"
}
```

**Expected Result**: 
- Status: `201 Created`
- Response includes user data and JWT token
- User stored in database with hashed password

**Validation Points**:
- ✅ User created successfully
- ✅ Password is hashed (not plain text)
- ✅ JWT token is valid
- ✅ Role assigned correctly

---

### Test Case 2: User Login
**Endpoint**: `POST /auth/signin`

**Test Data**:
```json
{
  "email": "john.tech@gearguard.com",
  "password": "password123"
}
```

**Expected Result**:
- Status: `200 OK`
- Response includes user data and JWT token
- Token can be used for protected routes

---

### Test Case 3: Get Form Data
**Endpoint**: `GET /auth/form-data`

**Expected Result**:
- Status: `200 OK`
- Returns roles and departments arrays
- Data matches database content

---

### Test Case 4: Invalid Login
**Endpoint**: `POST /auth/signin`

**Test Data**:
```json
{
  "email": "john.tech@gearguard.com",
  "password": "wrongpassword"
}
```

**Expected Result**:
- Status: `401 Unauthorized`
- Error message: "Invalid email or password"

---

### Test Case 5: Duplicate Registration
**Endpoint**: `POST /auth/signup`

**Test Data**: (Same as Test Case 1)

**Expected Result**:
- Status: `409 Conflict`
- Error message: "User with this email already exists"

---

## 🔧 Equipment API Tests

### Test Case 6: Get Dropdown Data
**Endpoint**: `GET /equipment/data/dropdowns`
**Headers**: `Authorization: Bearer {token}`

**Expected Result**:
- Status: `200 OK`
- Returns departments, maintenanceTeams, and users
- All arrays contain valid data

---

### Test Case 7: Create Equipment (Valid)
**Endpoint**: `POST /equipment`
**Headers**: `Authorization: Bearer {token}`

**Test Data**:
```json
{
  "name": "CNC Machine X1",
  "serialNumber": "CNC-2024-001",
  "department": "Production",
  "assignedEmployee": "John Technician",
  "maintenanceTeamId": 1,
  "purchaseDate": "2024-01-15",
  "warrantyExpiry": "2026-01-15",
  "location": "Production Floor A"
}
```

**Expected Result**:
- Status: `201 Created`
- Equipment created with all fields
- Assigned employee linked correctly
- Department created/linked correctly

---

### Test Case 8: Create Equipment (Missing Required Fields)
**Endpoint**: `POST /equipment`
**Headers**: `Authorization: Bearer {token}`

**Test Data**:
```json
{
  "name": "Incomplete Machine"
}
```

**Expected Result**:
- Status: `400 Bad Request`
- Error message about required fields

---

### Test Case 9: Create Equipment (Invalid User)
**Endpoint**: `POST /equipment`
**Headers**: `Authorization: Bearer {token}`

**Test Data**:
```json
{
  "name": "Test Machine",
  "serialNumber": "TM-002",
  "department": "Production",
  "assignedEmployee": "Non Existent User",
  "maintenanceTeamId": 1,
  "location": "Floor A"
}
```

**Expected Result**:
- Status: `400 Bad Request`
- Error message: "User 'Non Existent User' not found"

---

### Test Case 10: Create Equipment (Duplicate Serial Number)
**Endpoint**: `POST /equipment`
**Headers**: `Authorization: Bearer {token}`

**Test Data**: (Same serial number as Test Case 7)

**Expected Result**:
- Status: `409 Conflict`
- Error message: "Equipment with this serial number already exists"

---

### Test Case 11: Get All Equipment
**Endpoint**: `GET /equipment`
**Headers**: `Authorization: Bearer {token}`

**Expected Result**:
- Status: `200 OK`
- Returns array of equipment
- Each item has all required fields
- Relationships populated (department, user, team names)

---

### Test Case 12: Get Equipment by ID (Valid)
**Endpoint**: `GET /equipment/1`
**Headers**: `Authorization: Bearer {token}`

**Expected Result**:
- Status: `200 OK`
- Returns single equipment object
- All relationships populated

---

### Test Case 13: Get Equipment by ID (Invalid)
**Endpoint**: `GET /equipment/999`
**Headers**: `Authorization: Bearer {token}`

**Expected Result**:
- Status: `404 Not Found`
- Error message: "Equipment not found"

---

### Test Case 14: Update Equipment (Valid)
**Endpoint**: `PUT /equipment/1`
**Headers**: `Authorization: Bearer {token}`

**Test Data**:
```json
{
  "name": "Updated CNC Machine X1",
  "serialNumber": "CNC-2024-001",
  "department": "Production",
  "assignedEmployee": "John Technician",
  "maintenanceTeamId": 2,
  "purchaseDate": "2024-01-15",
  "warrantyExpiry": "2026-01-15",
  "location": "Production Floor B",
  "status": "Active"
}
```

**Expected Result**:
- Status: `200 OK`
- Equipment updated successfully
- Changes reflected in database

---

### Test Case 15: Delete Equipment (Valid)
**Endpoint**: `DELETE /equipment/1`
**Headers**: `Authorization: Bearer {token}`

**Expected Result**:
- Status: `200 OK`
- Equipment deleted from database
- Subsequent GET returns 404

---

### Test Case 16: Unauthorized Access
**Endpoint**: `GET /equipment`
**Headers**: (No Authorization header)

**Expected Result**:
- Status: `401 Unauthorized`
- Error message: "Access token required"

---

### Test Case 17: Invalid Token
**Endpoint**: `GET /equipment`
**Headers**: `Authorization: Bearer invalid_token`

**Expected Result**:
- Status: `403 Forbidden`
- Error message: "Invalid or expired token"

---

## 🔍 Edge Cases & Security Tests

### Test Case 18: SQL Injection Attempt
**Endpoint**: `POST /equipment`
**Headers**: `Authorization: Bearer {token}`

**Test Data**:
```json
{
  "name": "'; DROP TABLE equipment; --",
  "serialNumber": "SQL-001",
  "department": "Production",
  "assignedEmployee": "John Technician",
  "maintenanceTeamId": 1,
  "location": "Floor A"
}
```

**Expected Result**:
- Status: `201 Created` (but no SQL injection occurs)
- Equipment created with the malicious string as name
- Database remains intact

---

### Test Case 19: Large Data Input
**Endpoint**: `POST /equipment`
**Headers**: `Authorization: Bearer {token}`

**Test Data**:
```json
{
  "name": "A".repeat(200),
  "serialNumber": "LARGE-001",
  "department": "Production",
  "assignedEmployee": "John Technician",
  "maintenanceTeamId": 1,
  "location": "Floor A"
}
```

**Expected Result**:
- Status: `400 Bad Request` or `201 Created` (depending on validation)
- Proper handling of oversized data

---

### Test Case 20: Special Characters
**Endpoint**: `POST /equipment`
**Headers**: `Authorization: Bearer {token}`

**Test Data**:
```json
{
  "name": "Machine with Special Chars: @#$%^&*()",
  "serialNumber": "SPEC-001",
  "department": "Production",
  "assignedEmployee": "John Technician",
  "maintenanceTeamId": 1,
  "location": "Floor A"
}
```

**Expected Result**:
- Status: `201 Created`
- Special characters handled properly
- Data stored and retrieved correctly

---

## 📊 Performance Tests

### Test Case 21: Concurrent Requests
**Test**: Send 10 simultaneous equipment creation requests

**Expected Result**:
- All requests processed
- No data corruption
- Proper error handling for duplicates

---

### Test Case 22: Large Dataset Retrieval
**Test**: Create 100+ equipment items, then GET all

**Expected Result**:
- Response time < 2 seconds
- All data returned correctly
- No memory issues

---

## 🛠️ Automated Test Script

Here's a Node.js script to run these tests:

```javascript
// Run with: node run-api-tests.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function runAllTests() {
  console.log('🧪 Starting API Tests...\n');
  
  try {
    // Test 1: User Registration
    await testUserRegistration();
    
    // Test 2: User Login
    await testUserLogin();
    
    // Test 3: Equipment CRUD
    await testEquipmentCRUD();
    
    // Test 4: Error Cases
    await testErrorCases();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

async function testUserRegistration() {
  console.log('Testing user registration...');
  // Implementation here
}

// ... other test functions

runAllTests();
```

---

## 📝 Test Checklist

### Authentication Tests
- [ ] User registration with valid data
- [ ] User registration with invalid data
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials
- [ ] Duplicate email registration
- [ ] Get form data endpoint
- [ ] Protected route access with valid token
- [ ] Protected route access with invalid token

### Equipment Tests
- [ ] Get dropdown data
- [ ] Create equipment with valid data
- [ ] Create equipment with missing fields
- [ ] Create equipment with invalid user
- [ ] Create equipment with duplicate serial
- [ ] Get all equipment
- [ ] Get equipment by valid ID
- [ ] Get equipment by invalid ID
- [ ] Update equipment
- [ ] Delete equipment

### Security Tests
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Authorization checks
- [ ] Input validation
- [ ] Rate limiting (if implemented)

### Performance Tests
- [ ] Response time under load
- [ ] Memory usage with large datasets
- [ ] Concurrent request handling

---

## 🎯 Success Criteria

**API is considered working if**:
- All CRUD operations function correctly
- Authentication and authorization work
- Error handling is appropriate
- Data validation prevents bad input
- Security measures are effective
- Performance is acceptable

**Ready for production when**:
- All test cases pass
- Security tests pass
- Performance benchmarks met
- Error logging implemented
- Documentation complete