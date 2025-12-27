import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { requestsAPI } from '../services/mockBackend';
import RequestForm from '../components/Requests/RequestForm';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getAll();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRequest(null);
    setShowForm(true);
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const response = await requestsAPI.delete(id);
        if (response.success) {
          setRequests(requests.filter(req => req.id !== id));
        }
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingRequest) {
        response = await requestsAPI.update(editingRequest.id, formData);
      } else {
        response = await requestsAPI.create(formData);
      }

      if (response.success) {
        await fetchRequests(); // Refresh the list
        setShowForm(false);
        setEditingRequest(null);
      }
    } catch (error) {
      console.error('Error saving request:', error);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || request.status === filterStatus;
    const matchesType = !filterType || request.requestType === filterType;
    const matchesPriority = !filterPriority || request.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

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

  const getTypeBadge = (type) => {
    return type === 'Corrective' ? 'badge badge-high' : 'badge badge-medium';
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Maintenance Requests</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} className="mr-2" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Search Requests</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by subject, description, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Repaired">Repaired</option>
                <option value="Scrap">Scrap</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type</label>
              <select
                className="form-control"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Corrective">Corrective</option>
                <option value="Preventive">Preventive</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || filterStatus || filterType || filterPriority) && (
            <div style={{ marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                  setFilterType('');
                  setFilterPriority('');
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Requests List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Requests List ({filteredRequests.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filteredRequests.length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p className="text-muted">
                {searchTerm || filterStatus || filterType || filterPriority 
                  ? 'No requests match your filters' 
                  : 'No maintenance requests found'
                }
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Equipment</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.subject}</strong>
                      <br />
                      <small className="text-muted">{request.description}</small>
                    </td>
                    <td>{request.equipmentName}</td>
                    <td>
                      <span className={getTypeBadge(request.requestType)}>
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
                    <td>{request.assignedTechnician || 'Unassigned'}</td>
                    <td>{new Date(request.createdDate).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex" style={{ gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(request)}
                          style={{ padding: '6px 12px' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(request.id)}
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

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          request={editingRequest}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default Requests;