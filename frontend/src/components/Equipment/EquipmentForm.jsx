import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { teamsAPI } from '../../services/mockBackend';

const EquipmentForm = ({ equipment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
    location: '',
    department: '',
    assignedEmployee: '',
    maintenanceTeamId: '',
    category: ''
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load teams for dropdown
    const fetchTeams = async () => {
      try {
        const response = await teamsAPI.getAll();
        if (response.success) {
          setTeams(response.data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();

    // Pre-fill form if editing
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        serialNumber: equipment.serialNumber || '',
        purchaseDate: equipment.purchaseDate || '',
        warrantyExpiry: equipment.warrantyExpiry || '',
        location: equipment.location || '',
        department: equipment.department || '',
        assignedEmployee: equipment.assignedEmployee || '',
        maintenanceTeamId: equipment.maintenanceTeamId || '',
        category: equipment.category || ''
      });
    }
  }, [equipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert maintenanceTeamId to number
      const submitData = {
        ...formData,
        maintenanceTeamId: parseInt(formData.maintenanceTeamId) || null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Production',
    'IT',
    'Logistics',
    'Maintenance',
    'Quality Control',
    'Administration'
  ];

  const categories = [
    'Manufacturing',
    'IT Equipment',
    'Vehicle',
    'Tool',
    'Facility',
    'Safety Equipment'
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="card-title">
              {equipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Equipment Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serial Number *</label>
                <input
                  type="text"
                  name="serialNumber"
                  className="form-control"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Date *</label>
                <input
                  type="date"
                  name="purchaseDate"
                  className="form-control"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warranty Expiry</label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  className="form-control"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Production Floor A"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Employee</label>
                <input
                  type="text"
                  name="assignedEmployee"
                  className="form-control"
                  value={formData.assignedEmployee}
                  onChange={handleChange}
                  placeholder="Employee name"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Maintenance Team *</label>
                <select
                  name="maintenanceTeamId"
                  className="form-control"
                  value={formData.maintenanceTeamId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Maintenance Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-between" style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner mr-2"></span>
                    Saving...
                  </>
                ) : (
                  equipment ? 'Update Equipment' : 'Create Equipment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentForm;