import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { teamsAPI } from '../services/mockBackend';
import TeamForm from '../components/Teams/TeamForm';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getAll();
      if (response.success) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTeam(null);
    setShowForm(true);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        const response = await teamsAPI.delete(id);
        if (response.success) {
          setTeams(teams.filter(team => team.id !== id));
        }
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingTeam) {
        response = await teamsAPI.update(editingTeam.id, formData);
      } else {
        response = await teamsAPI.create(formData);
      }

      if (response.success) {
        await fetchTeams(); // Refresh the list
        setShowForm(false);
        setEditingTeam(null);
      }
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading teams...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Maintenance Teams</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} className="mr-2" />
          Add Team
        </button>
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {teams.map((team) => (
          <div key={team.id} className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Users size={20} className="mr-2" color="#3b82f6" />
                  <h3 className="card-title">{team.name}</h3>
                </div>
                <div className="d-flex" style={{ gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(team)}
                    style={{ padding: '6px 12px' }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(team.id)}
                    style={{ padding: '6px 12px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                {team.description}
              </p>

              {/* Team Members */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Team Members ({team.members.length})
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {team.members.map((member, index) => (
                    <span key={index} className="badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Specialties
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {team.specialties.map((specialty, index) => (
                    <span key={index} className="badge" style={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '60px' }}>
            <Users size={48} color="#6b7280" style={{ marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No Teams Found</h3>
            <p className="text-muted" style={{ marginBottom: '24px' }}>
              Create your first maintenance team to get started
            </p>
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={16} className="mr-2" />
              Add First Team
            </button>
          </div>
        </div>
      )}

      {/* Team Form Modal */}
      {showForm && (
        <TeamForm
          team={editingTeam}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTeam(null);
          }}
        />
      )}
    </div>
  );
};

export default Teams;