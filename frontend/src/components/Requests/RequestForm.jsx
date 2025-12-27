import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { maintenanceRequestAPI } from '../../services/maintenanceRequestService';

const RequestForm = ({ request, onSubmit, onCancel, defaultDate = '', defaultType = 'Corrective' }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipmentId: '',
    requestType: defaultType,
    teamId: '',
    assignedTo: '',
    scheduledDate: defaultDate,
    status: 'New'
  });
  const [dropdownData, setDropdownData] = useState({
    equipment: [],
    maintenanceTeams: [],
    users: [],
    statuses: []
  });
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const response = await maintenanceRequestAPI.getDropdownData();

        if (response.success) {
          setDropdownData(response.data);
        } else {
          setError('Failed to load form data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();

    // Pre-fill form if editing
    if (request) {
      setFormData({
        subject: request.subject || '',
        description: request.description || '',
        equipmentId: request.equipmentId || '',
        requestType: request.requestType || 'Corrective',
        teamId: request.teamId || '',
        assignedTo: request.assignedTo || '',
        scheduledDate: request.scheduledDate || '',
        status: request.status || 'New'
      });

      // Set selected equipment for editing
      if (request.equipmentId && dropdownData.equipment.length > 0) {
        const equipment = dropdownData.equipment.find(eq => eq.id === request.equipmentId);
        setSelectedEquipment(equipment);
      }
    }
  }, [request]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleEquipmentChange = (e) => {
    const equipmentId = parseInt(e.target.value);
    const equipment = dropdownData.equipment.find(eq => eq.id === equipmentId);
    
    setSelectedEquipment(equipment);
    
    if (equipment) {
      // Auto-fill maintenance team from equipment's assigned team
      setFormData(prev => ({
        ...prev,
        equipmentId: equipmentId,
        teamId: equipment.maintenanceTeamId || ''
      }));
    } else {
      setSelectedEquipment(null);
      setFormData(prev => ({
        ...prev,
        equipmentId: equipmentId,
        teamId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to save request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
        <div className="card" style={{ padding: '40px' }}>
          <div className="text-center">
            <div className="spinner"></div>
            <p style={{ marginTop: '16px' }}>Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="card" style={{ width: '700px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="card-title">
              {request ? 'Edit Maintenance Request' : 'Create New Maintenance Request'}
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
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the maintenance request"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Equipment *</label>
                <select
                  name="equipmentId"
                  className="form-control"
                  value={formData.equipmentId}
                  onChange={handleEquipmentChange}
                  required
                >
                  <option value="">Select Equipment</option>
                  {dropdownData.equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} - {eq.serialNumber}
                    </option>
                  ))}
                </select>
                {selectedEquipment && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    backgroundColor: '#f0f9ff', 
                    border: '1px solid #bae6fd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <div><strong>Location:</strong> {selectedEquipment.location}</div>
                    <div><strong>Department:</strong> {selectedEquipment.department}</div>
                    <div style={{ color: '#0369a1', fontWeight: '500' }}>
                      ✓ Auto-assigned team: {selectedEquipment.maintenanceTeam}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Request Type *</label>
                <select
                  name="requestType"
                  className="form-control"
                  value={formData.requestType}
                  onChange={handleChange}
                  required
                >
                  <option value="Corrective">Corrective (Breakdown)</option>
                  <option value="Preventive">Preventive (Scheduled)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Team *</label>
                <select
                  name="teamId"
                  className="form-control"
                  value={formData.teamId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Team</option>
                  {dropdownData.maintenanceTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <small className="text-muted">
                  Auto-filled based on selected equipment
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Technician</label>
                <select
                  name="assignedTo"
                  className="form-control"
                  value={formData.assignedTo}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {dropdownData.users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {formData.requestType === 'Preventive' && (
                <div className="form-group">
                  <label className="form-label">Scheduled Date *</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    className="form-control"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required={formData.requestType === 'Preventive'}
                  />
                </div>
              )}

              {request && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {dropdownData.statuses.map(status => (
                      <option key={status.id} value={status.name}>{status.name}</option>
                    ))}
                  </select>
                </div>
              )}
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
                  request ? 'Update Request' : 'Create Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;