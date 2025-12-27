# 🔧 Maintenance Requests API - Complete Implementation

## ✅ What's Been Implemented

### Backend (Node.js + MySQL)
- ✅ MaintenanceRequest model with full CRUD operations
- ✅ Request statuses table (New, In Progress, Repaired, Scrap)
- ✅ Complete API endpoints for maintenance requests
- ✅ JWT authentication on all routes
- ✅ Relationships with equipment, teams, and users
- ✅ Auto-seeding of initial data

### Frontend (React)
- ✅ Real API service for maintenance requests
- ✅ Updated Requests page to use real database
- ✅ Dynamic dropdown data from API
- ✅ Full CRUD operations integrated

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api/maintenance-requests`

All endpoints require JWT authentication header:
```
Authorization: Bearer YOUR_TOKEN
```

### 1. Get All Maintenance Requests
**GET** `/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subject": "Machine malfunction",
      "description": "CNC machine not starting",
      "equipmentId": 1,
      "equipmentName": "CNC Machine X1",
      "teamId": 1,
      "teamName": "Mechanical Team",
      "requestType": "Corrective",
      "statusId": 1,
      "status": "New",
      "assignedTo": 2,
      "assignedTechnician": "John Technician",
      "createdBy": 1,
      "createdByName": "Admin User",
      "scheduledDate": "2024-12-28",
      "createdAt": "2024-12-27T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Maintenance Request by ID
**GET** `/:id`

### 3. Create Maintenance Request
**POST** `/`

**Request Body:**
```json
{
  "subject": "Equipment Maintenance Required",
  "description": "Regular maintenance check needed",
  "equipmentId": 1,
  "teamId": 1,
  "requestType": "Preventive",
  "status": "New",
  "assignedTo": 2,
  "scheduledDate": "2024-12-30"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {...}
}
```

### 4. Update Maintenance Request
**PUT** `/:id`

**Request Body:**
```json
{
  "subject": "Updated Subject",
  "description": "Updated description",
  "equipmentId": 1,
  "teamId": 1,
  "requestType": "Corrective",
  "status": "In Progress",
  "assignedTo": 2,
  "scheduledDate": "2024-12-30",
  "startedAt": "2024-12-27T10:00:00",
  "completedAt": null,
  "durationHours": null
}
```

### 5. Delete Maintenance Request
**DELETE** `/:id`

### 6. Get Dropdown Data
**GET** `/data/dropdowns`

**Response:**
```json
{
  "success": true,
  "data": {
    "equipment": [...],
    "maintenanceTeams": [...],
    "users": [...],
    "statuses": [
      {"id": 1, "name": "New"},
      {"id": 2, "name": "In Progress"},
      {"id": 3, "name": "Repaired"},
      {"id": 4, "name": "Scrap"}
    ]
  }
}
```

## 📊 Database Schema

### maintenance_requests table
```sql
- id (INT, PRIMARY KEY)
- subject (VARCHAR(255), NOT NULL)
- description (TEXT)
- equipment_id (INT, FOREIGN KEY)
- team_id (INT, FOREIGN KEY)
- request_type (ENUM: 'Corrective', 'Preventive')
- status_id (INT, FOREIGN KEY)
- assigned_to (INT, FOREIGN KEY to users)
- created_by (INT, FOREIGN KEY to users)
- scheduled_date (DATE)
- started_at (DATETIME)
- completed_at (DATETIME)
- duration_hours (DECIMAL)
- is_overdue (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### request_statuses table
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR(50), UNIQUE)
```

Auto-seeded statuses:
- New
- In Progress
- Repaired
- Scrap

## 🧪 Testing the API

### Step 1: Login to get token
```bash
POST http://localhost:5000/api/auth/signin
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Step 2: Get dropdown data
```bash
GET http://localhost:5000/api/maintenance-requests/data/dropdowns
Headers: Authorization: Bearer YOUR_TOKEN
```

### Step 3: Create a maintenance request
```bash
POST http://localhost:5000/api/maintenance-requests
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "subject": "Test Maintenance Request",
  "description": "Testing the API",
  "equipmentId": 1,
  "teamId": 1,
  "requestType": "Corrective",
  "status": "New",
  "scheduledDate": "2024-12-30"
}
```

### Step 4: Get all requests
```bash
GET http://localhost:5000/api/maintenance-requests
Headers: Authorization: Bearer YOUR_TOKEN
```

## 🌐 Frontend Usage

### In your React components:
```javascript
import { maintenanceRequestAPI } from '../services/maintenanceRequestService';

// Get all requests
const response = await maintenanceRequestAPI.getAll();

// Create request
const newRequest = await maintenanceRequestAPI.create({
  subject: "Machine Issue",
  equipmentId: 1,
  teamId: 1,
  requestType: "Corrective",
  status: "New"
});

// Update request
const updated = await maintenanceRequestAPI.update(requestId, {...});

// Delete request
await maintenanceRequestAPI.delete(requestId);

// Get dropdown data
const dropdowns = await maintenanceRequestAPI.getDropdownData();
```

## 🎯 Features

### ✅ Implemented
- Full CRUD operations
- JWT authentication
- Equipment relationship
- Team assignment
- User assignment (assigned_to and created_by)
- Request types (Corrective/Preventive)
- Status management
- Scheduled dates
- Filtering and search (frontend)
- Real-time data from database

### 🔄 Data Flow
1. User logs in → Gets JWT token
2. Token stored in localStorage
3. All API requests include token
4. Backend validates token
5. Database operations performed
6. Data returned to frontend
7. UI updates with real data

## 🚀 Ready to Use!

Your Maintenance Requests system is now fully functional with:
- ✅ Real database storage
- ✅ Complete CRUD operations
- ✅ User authentication
- ✅ Equipment relationships
- ✅ Team assignments
- ✅ Status tracking
- ✅ Dynamic dropdowns

Navigate to the Requests page in your application and start creating maintenance requests!