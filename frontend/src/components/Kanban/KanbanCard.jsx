import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Calendar, Clock, AlertTriangle, Settings } from 'lucide-react';

const KanbanCard = ({ request, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRequestTypeColor = (type) => {
    return type === 'Corrective' ? '#ef4444' : '#3b82f6';
  };

  const isOverdue = () => {
    if (!request.scheduledDate) return false;
    const scheduled = new Date(request.scheduledDate);
    const today = new Date();
    return scheduled < today && request.status !== 'Repaired' && request.status !== 'Scrap';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card"
      style={{
        ...style,
        cursor: 'grab',
        backgroundColor: 'white',
        border: isOverdue() ? '2px solid #ef4444' : '1px solid #e5e7eb',
        boxShadow: isDragging || isSortableDragging ? '0 10px 25px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="card-body" style={{ padding: '12px' }}>
        {/* Priority and Type Indicators */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span 
            className="badge"
            style={{ 
              backgroundColor: getPriorityColor(request.priority) + '20',
              color: getPriorityColor(request.priority),
              fontSize: '10px',
              padding: '2px 6px'
            }}
          >
            {request.priority}
          </span>
          <span 
            className="badge"
            style={{ 
              backgroundColor: getRequestTypeColor(request.requestType) + '20',
              color: getRequestTypeColor(request.requestType),
              fontSize: '10px',
              padding: '2px 6px'
            }}
          >
            {request.requestType}
          </span>
        </div>

        {/* Overdue Warning */}
        {isOverdue() && (
          <div 
            style={{ 
              backgroundColor: '#fef2f2', 
              color: '#dc2626', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '11px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertTriangle size={12} />
            Overdue
          </div>
        )}

        {/* Request Title */}
        <h5 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '14px', 
          fontWeight: '600',
          lineHeight: '1.3'
        }}>
          {request.subject}
        </h5>

        {/* Description */}
        <p style={{ 
          margin: '0 0 12px 0', 
          fontSize: '12px', 
          color: '#6b7280',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {request.description}
        </p>

        {/* Equipment */}
        <div className="d-flex align-items-center mb-2">
          <Settings size={12} color="#6b7280" />
          <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>
            {request.equipmentName}
          </span>
        </div>

        {/* Assigned Technician */}
        <div className="d-flex align-items-center mb-2">
          <User size={12} color="#6b7280" />
          <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>
            {request.assignedTechnician || 'Unassigned'}
          </span>
        </div>

        {/* Dates */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Calendar size={12} color="#6b7280" />
            <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '4px' }}>
              {request.scheduledDate 
                ? new Date(request.scheduledDate).toLocaleDateString()
                : new Date(request.createdDate).toLocaleDateString()
              }
            </span>
          </div>
          
          {request.hoursSpent > 0 && (
            <div className="d-flex align-items-center">
              <Clock size={12} color="#6b7280" />
              <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '4px' }}>
                {request.hoursSpent}h
              </span>
            </div>
          )}
        </div>

        {/* Team Badge */}
        <div style={{ marginTop: '8px' }}>
          <span 
            className="badge"
            style={{ 
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontSize: '10px',
              padding: '2px 6px'
            }}
          >
            {request.teamName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;