import { useState, useEffect } from 'react';
import { Plus, Filter, User, Calendar, Clock, AlertTriangle } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { maintenanceRequestAPI } from '../services/maintenanceRequestService';
import KanbanColumn from '../components/Kanban/KanbanColumn';
import KanbanCard from '../components/Kanban/KanbanCard';
import RequestForm from '../components/Requests/RequestForm';

const KanbanBoard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [filterTeam, setFilterTeam] = useState('');

  const columns = [
    { id: 'New', title: 'New', color: '#3b82f6' },
    { id: 'In Progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'Repaired', title: 'Repaired', color: '#10b981' },
    { id: 'Scrap', title: 'Scrap', color: '#ef4444' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await maintenanceRequestAPI.getAll();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active request
    const activeRequest = requests.find(req => req.id === parseInt(activeId));
    if (!activeRequest) return;

    // Determine the new status
    let newStatus = overId;
    
    // If dropped on a card, get the column status
    if (!columns.find(col => col.id === overId)) {
      const overRequest = requests.find(req => req.id === parseInt(overId));
      if (overRequest) {
        newStatus = overRequest.status;
      }
    }

    // Update the request status if it changed
    if (activeRequest.status !== newStatus) {
      try {
        // Update status in database using optimized endpoint
        const response = await maintenanceRequestAPI.updateStatus(activeRequest.id, newStatus);
        
        if (response.success) {
          // Update local state with new status
          setRequests(prev => prev.map(req => 
            req.id === activeRequest.id 
              ? { ...req, status: newStatus }
              : req
          ));
          
          console.log(`✅ Request #${activeRequest.id} moved to ${newStatus}`);
        }
      } catch (error) {
        console.error('Error updating request status:', error);
        // Optionally show error notification to user
        alert('Failed to update request status. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await maintenanceRequestAPI.create(formData);
      if (response.success) {
        await fetchRequests(); // Refresh the list
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesTeam = !filterTeam || request.teamName === filterTeam;
    return matchesTeam;
  });

  // Group requests by status
  const requestsByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredRequests.filter(req => req.status === column.id);
    return acc;
  }, {});

  // Get unique teams for filters
  const teams = [...new Set(requests.map(req => req.teamName).filter(Boolean))];

  const activeRequest = requests.find(req => req.id === parseInt(activeId));

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading kanban board...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Kanban Board</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center" style={{ gap: '16px' }}>
            <Filter size={16} color="#6b7280" />
            <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
              <select
                className="form-control"
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            {filterTeam && (
              <button
                className="btn btn-secondary"
                onClick={() => setFilterTeam('')}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px',
          minHeight: '600px'
        }}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              requests={requestsByStatus[column.id]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && activeRequest ? (
            <KanbanCard request={activeRequest} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginTop: '24px'
      }}>
        {columns.map((column) => (
          <div key={column.id} className="card">
            <div className="card-body text-center">
              <h3 style={{ margin: '0 0 8px 0', color: column.color }}>
                {requestsByStatus[column.id].length}
              </h3>
              <p style={{ margin: 0, color: '#6b7280' }}>{column.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;