# GearGuard API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Sign Up
**POST** `/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "technician",
  "department": "Maintenance"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "technician",
      "roles": ["technician"]
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Sign In
**POST** `/auth/signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get Profile (Protected)
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": null,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Logout (Protected)
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Health Check
**GET** `/health`

**Response (200):**
```json
{
  "success": true,
  "message": "GearGuard API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
## Equipm
ent Endpoints

### 1. Get All Equipment (Protected)
**GET** `/equipment`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "CNC Machine",
      "serialNumber": "CNC001",
      "category": "Manufacturing",
      "department": "Production",
      "departmentId": 1,
      "assignedEmployee": "John Doe",
      "assignedEmployeeId": 2,
      "maintenanceTeam": "Mechanical Team",
      "maintenanceTeamId": 1,
      "purchaseDate": "2023-01-15",
      "warrantyExpiry": "2025-01-15",
      "location": "Production Floor A",
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Equipment by ID (Protected)
**GET** `/equipment/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "CNC Machine",
    "serialNumber": "CNC001",
    "category": "Manufacturing",
    "department": "Production",
    "assignedEmployee": "John Doe",
    "maintenanceTeam": "Mechanical Team",
    "purchaseDate": "2023-01-15",
    "warrantyExpiry": "2025-01-15",
    "location": "Production Floor A",
    "status": "Active"
  }
}
```

### 3. Create Equipment (Protected)
**POST** `/equipment`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "CNC Machine",
  "serialNumber": "CNC001",
  "category": "Manufacturing",
  "department": "Production",
  "assignedEmployee": "John Doe",
  "maintenanceTeamId": 1,
  "purchaseDate": "2023-01-15",
  "warrantyExpiry": "2025-01-15",
  "location": "Production Floor A"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Equipment created successfully",
  "data": {
    "id": 1,
    "name": "CNC Machine",
    "serialNumber": "CNC001",
    "category": "Manufacturing",
    "department": "Production",
    "assignedEmployee": "John Doe",
    "maintenanceTeam": "Mechanical Team",
    "purchaseDate": "2023-01-15",
    "warrantyExpiry": "2025-01-15",
    "location": "Production Floor A",
    "status": "Active"
  }
}
```

### 4. Update Equipment (Protected)
**PUT** `/equipment/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated CNC Machine",
  "serialNumber": "CNC001",
  "category": "Manufacturing",
  "department": "Production",
  "assignedEmployee": "Jane Smith",
  "maintenanceTeamId": 1,
  "purchaseDate": "2023-01-15",
  "warrantyExpiry": "2025-01-15",
  "location": "Production Floor B",
  "status": "Active"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Equipment updated successfully",
  "data": {
    "id": 1,
    "name": "Updated CNC Machine",
    "serialNumber": "CNC001",
    "assignedEmployee": "Jane Smith",
    "location": "Production Floor B"
  }
}
```

### 5. Delete Equipment (Protected)
**DELETE** `/equipment/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Equipment deleted successfully"
}
```

### 6. Get Dropdown Data (Protected)
**GET** `/equipment/data/dropdowns`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "departments": [
      {"id": 1, "name": "Production"},
      {"id": 2, "name": "IT"}
    ],
    "maintenanceTeams": [
      {"id": 1, "name": "Mechanical Team"},
      {"id": 2, "name": "Electrical Team"}
    ],
    "users": [
      {"id": 1, "name": "John Doe", "email": "john@example.com"},
      {"id": 2, "name": "Jane Smith", "email": "jane@example.com"}
    ]
  }
}
```

## Equipment Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Name, serial number, department, assigned technician, maintenance team, and location are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Equipment not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Equipment with this serial number already exists"
}
```
### 5. 
Get Form Data for Registration
**GET** `/auth/form-data`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roles": [
      {"id": 1, "name": "admin"},
      {"id": 2, "name": "manager"},
      {"id": 3, "name": "technician"},
      {"id": 4, "name": "operator"}
    ],
    "departments": [
      {"id": 1, "name": "Production"},
      {"id": 2, "name": "IT"},
      {"id": 3, "name": "Logistics"},
      {"id": 4, "name": "Maintenance"},
      {"id": 5, "name": "Quality Control"},
      {"id": 6, "name": "Administration"},
      {"id": 7, "name": "Operations"},
      {"id": 8, "name": "Engineering"}
    ]
  }
}
```