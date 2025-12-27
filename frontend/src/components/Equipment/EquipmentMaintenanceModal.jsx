import { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, User } from 'lucide-react';
import { equipmentAPI } from '../../services/mockBackend';

const EquipmentMaintenanceModal = ({ equipment, onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        setLoading(true);
        // This mock function will be replaced by real API call
        const response = await equipmentAPI.getMaintenanceRequests(equipment.id);
        if (response.success) {
          setRequests(response.data);
        }
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceRequests();
  }, [equipment.id]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'New': 'badge badge-new',
      'In Progress': 'badge badge-in-progress',
      'Repaired': 'badge badge-repaired',
      'Scrap': 'badge badge-scrap'
    };
    return statusClasses[status] || 'badge';
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      'High': 'badge badge-high',
      'Medium': 'badge badge-medium',
      'Low': 'badge badge-low'
    };
    return priorityClasses[priority] || 'badge';
  };

  const openRequests = requests.filter(r => r.status !== 'Repaired' && r.status !== 'Scrap');
  const closedRequests = requests.filter(r => r.status === 'Repaired' || r.status === 'Scrap');

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
      <div className="card" style={{ width: '900px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="card-title">Maintenance Requests</h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                {equipment.name} - {equipment.serialNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '16px' }}>Loading maintenance requests...</p>
            </div>
          ) : (
            <>
              {/* Equipment Info */}
              <div className="card mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <strong>Category:</strong> {equipment.category}
                    </div>
                    <div>
                      <strong>Department:</strong> {equipment.department}
                    </div>
                    <div>
                      <strong>Location:</strong> {equipment.location}
                    </div>
                    <div>
                      <strong>Assigned Employee:</strong> {equipment.assignedEmployee || 'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card">
                  <div className="card-body text-center">
                    <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>{openRequests.length}</h4>
                    <p style={{ margin: 0, color: '#6b7280' }}>Open Requests</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <h4 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>{closedRequests.length}</h4>
                    <p style={{ margin: 0, color: '#6b7280' }}>Completed</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>{requests.length}</h4>
                    <p style={{ margin: 0, color: '#6b7280' }}>Total Requests</p>
                  </div>
                </div>
              </div>

              {/* Open Requests */}
              {openRequests.length > 0 && (
                <div className="mb-3">
                  <h4 style={{ marginBottom: '16px', color: '#ef4444' }}>
                    Open Requests ({openRequests.length})
                  </h4>
                  <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Assigned To</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {openRequests.map((request) => (
                            <tr key={request.id}>
                              <td>
                                <strong>{request.subject}</strong>
                                <br />
                                <small className="text-muted">{request.description}</small>
                              </td>
                              <td>
                                <span className={`badge ${request.requestType === 'Corrective' ? 'badge-high' : 'badge-medium'}`}>
                                  {request.requestType}
                                </span>
                              </td>
                              <td>
                                <span className={getStatusBadge(request.status)}>
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                <span className={getPriorityBadge(request.priority)}>
                                  {request.priority}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <User size={14} className="mr-2" />
                                  {request.assignedTechnician || 'Unassigned'}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Calendar size={14} className="mr-2" />
                                  {new Date(request.createdDate).toLocaleDateString()}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Requests */}
              {closedRequests.length > 0 && (
                <div className="mb-3">
                  <h4 style={{ marginBottom: '16px', color: '#22c55e' }}>
                    Completed Requests ({closedRequests.length})
                  </h4>
                  <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Completed By</th>
                            <th>Hours Spent</th>
                            <th>Completed Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {closedRequests.map((request) => (
                            <tr key={request.id}>
                              <td>
                                <strong>{request.subject}</strong>
                                <br />
                                <small className="text-muted">{request.description}</small>
                              </td>
                              <td>
                                <span className={`badge ${request.requestType === 'Corrective' ? 'badge-high' : 'badge-medium'}`}>
                                  {request.requestType}
                                </span>
                              </td>
                              <td>
                                <span className={getStatusBadge(request.status)}>
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <User size={14} className="mr-2" />
                                  {request.assignedTechnician}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Clock size={14} className="mr-2" />
                                  {request.hoursSpent}h
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Calendar size={14} className="mr-2" />
                                  {request.completedDate ? new Date(request.completedDate).toLocaleDateString() : '-'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* No Requests */}
              {requests.length === 0 && (
                <div className="text-center" style={{ padding: '40px' }}>
                  <p className="text-muted">No maintenance requests found for this equipment</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card-header" style={{ borderTop: '1px solid #eee' }}>
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-primary">
              <Plus size={16} className="mr-2" />
              Create New Request
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentMaintenanceModal;