import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wrench, Search } from 'lucide-react';
import { equipmentAPI } from '../services/equipmentService';
import EquipmentForm from '../components/Equipment/EquipmentForm';
import EquipmentMaintenanceModal from '../components/Equipment/EquipmentMaintenanceModal';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getAll();
      if (response.success) {
        setEquipment(response.data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEquipment(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        const response = await equipmentAPI.delete(id);
        if (response.success) {
          setEquipment(equipment.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingEquipment) {
        response = await equipmentAPI.update(editingEquipment.id, formData);
      } else {
        response = await equipmentAPI.create(formData);
      }

      if (response.success) {
        await fetchEquipment(); // Refresh the list
        setShowForm(false);
        setEditingEquipment(null);
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleMaintenanceClick = (item) => {
    setSelectedEquipment(item);
    setShowMaintenanceModal(true);
  };

  // Filter equipment based on search and department
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || item.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = [...new Set(equipment.map(item => item.department))];

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading equipment...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Equipment Management</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} className="mr-2" />
          Add Equipment
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Search Equipment</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, serial number, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Filter by Department</label>
              <select
                className="form-control"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Equipment List ({filteredEquipment.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filteredEquipment.length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p className="text-muted">
                {searchTerm || filterDepartment ? 'No equipment matches your filters' : 'No equipment found'}
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment Name</th>
                  <th>Serial Number</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Assigned Technician</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <br />
                      <small className="text-muted">{item.category}</small>
                    </td>
                    <td>{item.serialNumber}</td>
                    <td>{item.department}</td>
                    <td>{item.location}</td>
                    <td>{item.assignedEmployee || 'Unassigned'}</td>
                    <td>
                      <span className={`badge ${item.status === 'Active' ? 'badge-repaired' : 'badge-scrap'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex" style={{ gap: '8px' }}>
                        {/* Smart Maintenance Button */}
                        <button
                          className="btn btn-warning"
                          onClick={() => handleMaintenanceClick(item)}
                          title="View Maintenance Requests"
                          style={{ padding: '6px 12px' }}
                        >
                          <Wrench size={14} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(item)}
                          style={{ padding: '6px 12px' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(item.id)}
                          style={{ padding: '6px 12px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Equipment Form Modal */}
      {showForm && (
        <EquipmentForm
          equipment={editingEquipment}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingEquipment(null);
          }}
        />
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedEquipment && (
        <EquipmentMaintenanceModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
};

export default Equipment;