import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Users, Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { equipmentAPI, teamsAPI, requestsAPI } from '../services/mockBackend';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    totalTeams: 0,
    totalRequests: 0,
    newRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [equipmentRes, teamsRes, requestsRes] = await Promise.all([
          equipmentAPI.getAll(),
          teamsAPI.getAll(),
          requestsAPI.getAll()
        ]);

        if (equipmentRes.success && teamsRes.success && requestsRes.success) {
          const requests = requestsRes.data;
          
          setStats({
            totalEquipment: equipmentRes.data.length,
            totalTeams: teamsRes.data.length,
            totalRequests: requests.length,
            newRequests: requests.filter(r => r.status === 'New').length,
            inProgressRequests: requests.filter(r => r.status === 'In Progress').length,
            completedRequests: requests.filter(r => r.status === 'Repaired').length
          });

          // Get recent requests (last 5)
          const sortedRequests = requests
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .slice(0, 5);
          setRecentRequests(sortedRequests);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>{stats.totalEquipment}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Total Equipment</p>
              </div>
              <Settings size={32} color="#3b82f6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>{stats.totalTeams}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Maintenance Teams</p>
              </div>
              <Users size={32} color="#10b981" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>{stats.newRequests}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>New Requests</p>
              </div>
              <AlertTriangle size={32} color="#f59e0b" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>{stats.inProgressRequests}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>In Progress</p>
              </div>
              <Clock size={32} color="#ef4444" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>{stats.completedRequests}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Completed</p>
              </div>
              <CheckCircle size={32} color="#22c55e" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>{stats.totalRequests}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Total Requests</p>
              </div>
              <Wrench size={32} color="#8b5cf6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="card-title">Recent Maintenance Requests</h3>
            <Link to="/requests" className="btn btn-primary">
              View All Requests
            </Link>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {recentRequests.length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p className="text-muted">No maintenance requests found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Equipment</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.subject}</strong>
                      <br />
                      <small className="text-muted">{request.description}</small>
                    </td>
                    <td>{request.equipmentName}</td>
                    <td>{request.teamName}</td>
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
                    <td>{new Date(request.createdDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <Link to="/equipment" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-body text-center">
            <Settings size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
            <h4>Manage Equipment</h4>
            <p className="text-muted">Add and manage company assets</p>
          </div>
        </Link>

        <Link to="/teams" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-body text-center">
            <Users size={48} color="#10b981" style={{ marginBottom: '16px' }} />
            <h4>Manage Teams</h4>
            <p className="text-muted">Organize maintenance teams</p>
          </div>
        </Link>

        <Link to="/kanban" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-body text-center">
            <Wrench size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
            <h4>Kanban Board</h4>
            <p className="text-muted">Track request progress</p>
          </div>
        </Link>

        <Link to="/calendar" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-body text-center">
            <Clock size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
            <h4>Schedule View</h4>
            <p className="text-muted">Plan preventive maintenance</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;