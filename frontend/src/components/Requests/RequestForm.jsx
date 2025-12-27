import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { equipmentAPI, teamsAPI } from '../../services/mockBackend';

const RequestForm = ({ request, onSubmit, onCancel, defaultDate = '', defaultType = 'Corrective' }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipmentId: '',
    requestType: defaultType,
    maintenanceTeamId: '',
    assignedTechnician: '',
    priority: 'Medium',
    scheduledDate: defaultDate,
    hoursSpent: 0,
    status: 'New'
  });
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [suggestedTeam, setSuggestedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [equipmentRes, teamsRes] = await Promise.all([
          equipmentAPI.getAll(),
          teamsAPI.getAll()
        ]);

        if (equipmentRes.success) setEquipment(equipmentRes.data);
        if (teamsRes.success) setTeams(teamsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
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
        maintenanceTeamId: request.maintenanceTeamId || '',
        assignedTechnician: request.assignedTechnician || '',
        priority: request.priority || 'Medium',
        scheduledDate: request.scheduledDate || '',
        hoursSpent: request.hoursSpent || 0,
        status: request.status || 'New'
      });
    }
  }, [request]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEquipmentChange = async (e) => {
    const equipmentId = parseInt(e.target.value);
    const selectedEquipment = equipment.find(eq => eq.id === equipmentId);
    
    setSelectedEquipment(selectedEquipment);
    
    if (selectedEquipment) {
      // Auto-detect team based on equipment category
      try {
        const teamResponse = await teamsAPI.getByCategory(selectedEquipment.category);
        if (teamResponse.success) {
          setSuggestedTeam(teamResponse.data);
          setFormData(prev => ({
            ...prev,
            equipmentId: equipmentId,
            maintenanceTeamId: teamResponse.data.id
          }));
        } else {
          // Fallback to equipment's assigned team
          setSuggestedTeam(null);
          setFormData(prev => ({
            ...prev,
            equipmentId: equipmentId,
            maintenanceTeamId: selectedEquipment.maintenanceTeamId || ''
          }));
        }
      } catch (error) {
        console.error('Error getting team by category:', error);
        // Fallback to equipment's assigned team
        setSuggestedTeam(null);
        setFormData(prev => ({
          ...prev,
          equipmentId: equipmentId,
          maintenanceTeamId: selectedEquipment.maintenanceTeamId || ''
        }));
      }
    } else {
      setSelectedEquipment(null);
      setSuggestedTeam(null);
      setFormData(prev => ({
        ...prev,
        equipmentId: equipmentId,
        maintenanceTeamId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        equipmentId: parseInt(formData.equipmentId),
        maintenanceTeamId: parseInt(formData.maintenanceTeamId),
        hoursSpent: parseFloat(formData.hoursSpent) || 0
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
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
                  {equipment.map(eq => (
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
                    <div><strong>Category:</strong> {selectedEquipment.category}</div>
                    <div><strong>Location:</strong> {selectedEquipment.location}</div>
                    {suggestedTeam && (
                      <div style={{ color: '#0369a1', fontWeight: '500' }}>
                        ✓ Auto-assigned to: {suggestedTeam.name}
                      </div>
                    )}
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
                  name="maintenanceTeamId"
                  className="form-control"
                  value={formData.maintenanceTeamId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <small className="text-muted">
                  {suggestedTeam 
                    ? `Auto-selected based on equipment category: ${selectedEquipment?.category}`
                    : 'Auto-filled based on selected equipment'
                  }
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
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

              <div className="form-group">
                <label className="form-label">Assigned Technician</label>
                <input
                  type="text"
                  name="assignedTechnician"
                  className="form-control"
                  value={formData.assignedTechnician}
                  onChange={handleChange}
                  placeholder="Technician name"
                />
              </div>

              {request && (
                <>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-control"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Repaired">Repaired</option>
                      <option value="Scrap">Scrap</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hours Spent</label>
                    <input
                      type="number"
                      name="hoursSpent"
                      className="form-control"
                      value={formData.hoursSpent}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      placeholder="0"
                    />
                  </div>
                </>
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