import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const TeamForm = ({ team, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [''],
    specialties: [''],
    categories: []
  });
  const [loading, setLoading] = useState(false);

  const availableCategories = [
    'Manufacturing',
    'IT Equipment',
    'Vehicle',
    'Tool',
    'Facility',
    'Safety Equipment'
  ];

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        members: team.members.length > 0 ? [...team.members] : [''],
        specialties: team.specialties.length > 0 ? [...team.specialties] : [''],
        categories: team.categories || []
      });
    }
  }, [team]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Filter out empty strings
      const submitData = {
        ...formData,
        members: formData.members.filter(member => member.trim() !== ''),
        specialties: formData.specialties.filter(specialty => specialty.trim() !== ''),
        categories: formData.categories
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

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
              {team ? 'Edit Team' : 'Add New Team'}
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
            <div className="form-group">
              <label className="form-label">Team Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Mechanical Team"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the team's responsibilities"
                rows="3"
              />
            </div>

            {/* Team Members */}
            <div className="form-group">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label">Team Members</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => addArrayItem('members')}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  <Plus size={12} className="mr-1" />
                  Add Member
                </button>
              </div>
              {formData.members.map((member, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={member}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'members')}
                    placeholder="Member name"
                  />
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger ml-2"
                      onClick={() => removeArrayItem(index, 'members')}
                      style={{ padding: '6px 8px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Specialties */}
            <div className="form-group">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label">Specialties</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => addArrayItem('specialties')}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  <Plus size={12} className="mr-1" />
                  Add Specialty
                </button>
              </div>
              {formData.specialties.map((specialty, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={specialty}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'specialties')}
                    placeholder="e.g., CNC Machines, Hydraulics"
                  />
                  {formData.specialties.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger ml-2"
                      onClick={() => removeArrayItem(index, 'specialties')}
                      style={{ padding: '6px 8px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Equipment Categories */}
            <div className="form-group">
              <label className="form-label">Equipment Categories</label>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Select the equipment categories this team can handle:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {availableCategories.map(category => (
                  <label key={category} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      style={{ marginRight: '8px' }}
                      disabled={loading}
                    />
                    <span style={{ fontSize: '14px' }}>{category}</span>
                  </label>
                ))}
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
                  team ? 'Update Team' : 'Create Team'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamForm;