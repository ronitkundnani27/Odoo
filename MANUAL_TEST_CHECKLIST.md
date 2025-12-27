# 📋 Manual API Testing Checklist

## 🚀 Quick Start Testing

### Prerequisites
- ✅ Backend server running on `http://localhost:5000`
- ✅ MySQL database `gearguard` exists and is accessible
- ✅ Postman or similar API testing tool

---

## 🔐 Authentication Tests

### ✅ Test 1: User Registration
**URL**: `POST http://localhost:5000/api/auth/signup`
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "technician",
  "department": "Maintenance"
}
```
**Expected**: Status 201, returns user data and JWT token

### ✅ Test 2: User Login
**URL**: `POST http://localhost:5000/api/auth/signin`
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
**Expected**: Status 200, returns user data and JWT token
**Action**: Copy the token for next tests

---

## 🔧 Equipment Tests

### ✅ Test 3: Get Dropdown Data
**URL**: `GET http://localhost:5000/api/equipment/data/dropdowns`
**Headers**: `Authorization: Bearer YOUR_TOKEN_HERE`
**Expected**: Status 200, returns departments, teams, and users arrays

### ✅ Test 4: Create Equipment
**URL**: `POST http://localhost:5000/api/equipment`
**Headers**: 
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`
**Body**:
```json
{
  "name": "Test Machine",
  "serialNumber": "TM-001",
  "department": "Production",
  "assignedEmployee": "Test User",
  "maintenanceTeamId": 1,
  "purchaseDate": "2024-01-15",
  "warrantyExpiry": "2026-01-15",
  "location": "Floor A"
}
```
**Expected**: Status 201, returns created equipment data
**Action**: Note the equipment ID for next tests

### ✅ Test 5: Get All Equipment
**URL**: `GET http://localhost:5000/api/equipment`
**Headers**: `Authorization: Bearer YOUR_TOKEN_HERE`
**Expected**: Status 200, returns array with your created equipment

### ✅ Test 6: Get Equipment by ID
**URL**: `GET http://localhost:5000/api/equipment/1`
**Headers**: `Authorization: Bearer YOUR_TOKEN_HERE`
**Expected**: Status 200, returns single equipment object

### ✅ Test 7: Update Equipment
**URL**: `PUT http://localhost:5000/api/equipment/1`
**Headers**: 
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`
**Body**:
```json
{
  "name": "Updated Test Machine",
  "serialNumber": "TM-001",
  "department": "Production",
  "assignedEmployee": "Test User",
  "maintenanceTeamId": 2,
  "purchaseDate": "2024-01-15",
  "warrantyExpiry": "2026-01-15",
  "location": "Floor B",
  "status": "Active"
}
```
**Expected**: Status 200, returns updated equipment data

### ✅ Test 8: Delete Equipment
**URL**: `DELETE http://localhost:5000/api/equipment/1`
**Headers**: `Authorization: Bearer YOUR_TOKEN_HERE`
**Expected**: Status 200, success message

---

## ❌ Error Testing

### ✅ Test 9: Unauthorized Access
**URL**: `GET http://localhost:5000/api/equipment`
**Headers**: (No Authorization header)
**Expected**: Status 401, error message

### ✅ Test 10: Invalid Token
**URL**: `GET http://localhost:5000/api/equipment`
**Headers**: `Authorization: Bearer invalid_token`
**Expected**: Status 403, error message

### ✅ Test 11: Missing Required Fields
**URL**: `POST http://localhost:5000/api/equipment`
**Headers**: 
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`
**Body**:
```json
{
  "name": "Incomplete Machine"
}
```
**Expected**: Status 400, error about required fields

### ✅ Test 12: Invalid User Assignment
**URL**: `POST http://localhost:5000/api/equipment`
**Headers**: 
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`
**Body**:
```json
{
  "name": "Invalid User Machine",
  "serialNumber": "IU-001",
  "department": "Production",
  "assignedEmployee": "Non Existent User",
  "maintenanceTeamId": 1,
  "location": "Floor A"
}
```
**Expected**: Status 400, error about user not found

### ✅ Test 13: Duplicate Serial Number
**URL**: `POST http://localhost:5000/api/equipment`
**Headers**: 
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`
**Body**: (Use same serial number as Test 4)
**Expected**: Status 409, error about duplicate serial number

---

## 🎯 Success Criteria

**All tests pass if**:
- [ ] User can register and login successfully
- [ ] JWT tokens work for authentication
- [ ] Equipment can be created, read, updated, and deleted
- [ ] Dropdown data is returned correctly
- [ ] Error cases return appropriate status codes
- [ ] Data validation works properly
- [ ] User assignment validation works
- [ ] Serial number uniqueness is enforced

---

## 🐛 Common Issues & Solutions

### Issue: "User not found" when creating equipment
**Solution**: Make sure the `assignedEmployee` name exactly matches a user's name in the database

### Issue: "Invalid token" errors
**Solution**: 
1. Make sure you're using the latest token from login
2. Check that the token is properly formatted: `Bearer YOUR_TOKEN`
3. Tokens expire after 7 days

### Issue: "Equipment with this serial number already exists"
**Solution**: Use a unique serial number for each equipment creation test

### Issue: Database connection errors
**Solution**: 
1. Verify MySQL is running
2. Check database credentials in `.env` file
3. Ensure `gearguard` database exists

---

## 📊 Quick Test Commands (PowerShell)

```powershell
# 1. Register User
$body = @{name='Test User';email='test@example.com';password='password123';role='technician'} | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/signup' -Method POST -Body $body -ContentType 'application/json'
$token = $response.data.token

# 2. Create Equipment
$headers = @{Authorization="Bearer $token"}
$equipmentBody = @{name='Test Machine';serialNumber='TM-001';department='Production';assignedEmployee='Test User';maintenanceTeamId=1;location='Floor A'} | ConvertTo-Json
$equipment = Invoke-RestMethod -Uri 'http://localhost:5000/api/equipment' -Method POST -Body $equipmentBody -ContentType 'application/json' -Headers $headers

# 3. Get All Equipment
$allEquipment = Invoke-RestMethod -Uri 'http://localhost:5000/api/equipment' -Headers $headers
$allEquipment.data
```

---

## 🎉 Test Complete!

If all tests pass, your API is working correctly and ready for frontend integration!