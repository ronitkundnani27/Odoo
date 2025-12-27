// Mock Backend Service - This will be replaced by real API calls

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
let equipmentData = [
  {
    id: 1,
    name: "CNC Machine #1",
    serialNumber: "CNC-001-2023",
    purchaseDate: "2023-01-15",
    warrantyExpiry: "2025-01-15",
    location: "Production Floor A",
    department: "Production",
    assignedEmployee: "John Smith",
    maintenanceTeamId: 1,
    category: "Manufacturing",
    status: "Active"
  },
  {
    id: 2,
    name: "Server Rack #3",
    serialNumber: "SRV-003-2022",
    purchaseDate: "2022-06-10",
    warrantyExpiry: "2024-06-10",
    location: "Data Center",
    department: "IT",
    assignedEmployee: "Sarah Johnson",
    maintenanceTeamId: 2,
    category: "IT Equipment",
    status: "Active"
  },
  {
    id: 3,
    name: "Forklift #5",
    serialNumber: "FLT-005-2021",
    purchaseDate: "2021-03-20",
    warrantyExpiry: "2024-03-20",
    location: "Warehouse B",
    department: "Logistics",
    assignedEmployee: "Mike Wilson",
    maintenanceTeamId: 3,
    category: "Vehicle",
    status: "Active"
  },
  {
    id: 4,
    name: "Hydraulic Press #2",
    serialNumber: "HYD-002-2022",
    purchaseDate: "2022-08-15",
    warrantyExpiry: "2025-08-15",
    location: "Production Floor B",
    department: "Production",
    assignedEmployee: "Mark Johnson",
    maintenanceTeamId: 1,
    category: "Manufacturing",
    status: "Active"
  },
  {
    id: 5,
    name: "Drill Set Professional",
    serialNumber: "DRL-PRO-2023",
    purchaseDate: "2023-03-10",
    warrantyExpiry: "2026-03-10",
    location: "Tool Room",
    department: "Maintenance",
    assignedEmployee: "Tool Manager",
    maintenanceTeamId: 1,
    category: "Tool",
    status: "Active"
  },
  {
    id: 6,
    name: "Fire Extinguisher System",
    serialNumber: "FES-001-2021",
    purchaseDate: "2021-12-01",
    warrantyExpiry: "2024-12-01",
    location: "Building A - Main Floor",
    department: "Safety",
    assignedEmployee: "Safety Officer",
    maintenanceTeamId: 1,
    category: "Safety Equipment",
    status: "Active"
  },
  {
    id: 7,
    name: "Delivery Truck #3",
    serialNumber: "TRK-003-2022",
    purchaseDate: "2022-05-15",
    warrantyExpiry: "2025-05-15",
    location: "Fleet Parking",
    department: "Logistics",
    assignedEmployee: "Fleet Manager",
    maintenanceTeamId: 3,
    category: "Vehicle",
    status: "Active"
  }
];

let teamsData = [
  {
    id: 1,
    name: "Mechanical Team",
    description: "Handles mechanical equipment maintenance",
    members: ["John Doe", "Alice Brown", "Bob Miller"],
    specialties: ["CNC Machines", "Hydraulics", "Pneumatics", "Tools", "Facility Equipment"],
    categories: ["Manufacturing", "Tool", "Facility", "Safety Equipment"]
  },
  {
    id: 2,
    name: "Technical Team",
    description: "Manages IT infrastructure and equipment",
    members: ["Sarah Johnson", "Tom Davis", "Lisa Chen"],
    specialties: ["Servers", "Network Equipment", "Computers", "Software"],
    categories: ["IT Equipment"]
  },
  {
    id: 3,
    name: "Vehicle Team",
    description: "Maintains company vehicles and mobile equipment",
    members: ["Mike Wilson", "Dave Rodriguez", "Emma Taylor"],
    specialties: ["Forklifts", "Trucks", "Mobile Equipment", "Fleet Maintenance"],
    categories: ["Vehicle"]
  }
];

let requestsData = [
  {
    id: 1,
    subject: "CNC Machine making unusual noise",
    description: "Machine #1 is producing grinding sounds during operation",
    equipmentId: 1,
    equipmentName: "CNC Machine #1",
    requestType: "Corrective",
    maintenanceTeamId: 1,
    teamName: "Mechanical Team",
    assignedTechnician: "John Doe",
    status: "New",
    priority: "High",
    createdDate: "2024-12-26",
    scheduledDate: null,
    completedDate: null,
    hoursSpent: 0,
    createdBy: "Production Manager"
  },
  {
    id: 2,
    subject: "Server temperature monitoring",
    description: "Weekly temperature check and cleaning",
    equipmentId: 2,
    equipmentName: "Server Rack #3",
    requestType: "Preventive",
    maintenanceTeamId: 2,
    teamName: "Technical Team",
    assignedTechnician: "Sarah Johnson",
    status: "In Progress",
    priority: "Medium",
    createdDate: "2024-12-25",
    scheduledDate: "2024-12-28",
    completedDate: null,
    hoursSpent: 1.5,
    createdBy: "IT Manager"
  },
  {
    id: 3,
    subject: "Forklift brake inspection",
    description: "Monthly brake system inspection and adjustment",
    equipmentId: 3,
    equipmentName: "Forklift #5",
    requestType: "Preventive",
    maintenanceTeamId: 3,
    teamName: "Vehicle Team",
    assignedTechnician: "Mike Wilson",
    status: "Repaired",
    priority: "Medium",
    createdDate: "2024-12-20",
    scheduledDate: "2024-12-22",
    completedDate: "2024-12-22",
    hoursSpent: 2,
    createdBy: "Warehouse Manager"
  }
];

// Equipment API
export const equipmentAPI = {
  async getAll() {
    await delay();
    return { data: equipmentData, success: true };
  },

  async getById(id) {
    await delay();
    const equipment = equipmentData.find(eq => eq.id === parseInt(id));
    return equipment ? { data: equipment, success: true } : { error: "Equipment not found", success: false };
  },

  async create(equipment) {
    await delay();
    const newEquipment = {
      ...equipment,
      id: Math.max(...equipmentData.map(eq => eq.id)) + 1,
      status: "Active"
    };
    equipmentData.push(newEquipment);
    return { data: newEquipment, success: true };
  },

  async update(id, updates) {
    await delay();
    const index = equipmentData.findIndex(eq => eq.id === parseInt(id));
    if (index !== -1) {
      equipmentData[index] = { ...equipmentData[index], ...updates };
      return { data: equipmentData[index], success: true };
    }
    return { error: "Equipment not found", success: false };
  },

  async delete(id) {
    await delay();
    const index = equipmentData.findIndex(eq => eq.id === parseInt(id));
    if (index !== -1) {
      equipmentData.splice(index, 1);
      return { success: true };
    }
    return { error: "Equipment not found", success: false };
  },

  async getMaintenanceRequests(equipmentId) {
    await delay();
    const requests = requestsData.filter(req => req.equipmentId === parseInt(equipmentId));
    return { data: requests, success: true };
  }
};

// Teams API
export const teamsAPI = {
  async getAll() {
    await delay();
    return { data: teamsData, success: true };
  },

  async getById(id) {
    await delay();
    const team = teamsData.find(team => team.id === parseInt(id));
    return team ? { data: team, success: true } : { error: "Team not found", success: false };
  },

  async getByCategory(category) {
    await delay();
    const team = teamsData.find(team => team.categories && team.categories.includes(category));
    return team ? { data: team, success: true } : { error: "No team found for category", success: false };
  },

  async create(team) {
    await delay();
    const newTeam = {
      ...team,
      id: Math.max(...teamsData.map(t => t.id)) + 1
    };
    teamsData.push(newTeam);
    return { data: newTeam, success: true };
  },

  async update(id, updates) {
    await delay();
    const index = teamsData.findIndex(team => team.id === parseInt(id));
    if (index !== -1) {
      teamsData[index] = { ...teamsData[index], ...updates };
      return { data: teamsData[index], success: true };
    }
    return { error: "Team not found", success: false };
  },

  async delete(id) {
    await delay();
    const index = teamsData.findIndex(team => team.id === parseInt(id));
    if (index !== -1) {
      teamsData.splice(index, 1);
      return { success: true };
    }
    return { error: "Team not found", success: false };
  }
};

// Maintenance Requests API
export const requestsAPI = {
  async getAll() {
    await delay();
    return { data: requestsData, success: true };
  },

  async getById(id) {
    await delay();
    const request = requestsData.find(req => req.id === parseInt(id));
    return request ? { data: request, success: true } : { error: "Request not found", success: false };
  },

  async create(request) {
    await delay();
    const equipment = equipmentData.find(eq => eq.id === request.equipmentId);
    const team = teamsData.find(t => t.id === request.maintenanceTeamId);
    
    const newRequest = {
      ...request,
      id: Math.max(...requestsData.map(req => req.id)) + 1,
      equipmentName: equipment?.name || "Unknown Equipment",
      teamName: team?.name || "Unknown Team",
      status: "New",
      createdDate: new Date().toISOString().split('T')[0],
      hoursSpent: 0
    };
    requestsData.push(newRequest);
    return { data: newRequest, success: true };
  },

  async update(id, updates) {
    await delay();
    const index = requestsData.findIndex(req => req.id === parseInt(id));
    if (index !== -1) {
      requestsData[index] = { ...requestsData[index], ...updates };
      
      // Auto-complete logic
      if (updates.status === "Repaired" && !requestsData[index].completedDate) {
        requestsData[index].completedDate = new Date().toISOString().split('T')[0];
      }
      
      return { data: requestsData[index], success: true };
    }
    return { error: "Request not found", success: false };
  },

  async delete(id) {
    await delay();
    const index = requestsData.findIndex(req => req.id === parseInt(id));
    if (index !== -1) {
      requestsData.splice(index, 1);
      return { success: true };
    }
    return { error: "Request not found", success: false };
  },

  async updateStatus(id, status) {
    return this.update(id, { status });
  }
};