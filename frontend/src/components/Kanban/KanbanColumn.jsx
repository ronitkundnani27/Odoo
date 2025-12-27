import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ column, requests }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="card" style={{ height: 'fit-content', minHeight: '500px' }}>
      <div 
        className="card-header" 
        style={{ 
          backgroundColor: column.color, 
          color: 'white',
          borderBottom: 'none'
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            {column.title}
          </h4>
          <span 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {requests.length}
          </span>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className="card-body"
        style={{ 
          padding: '16px',
          minHeight: '450px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <SortableContext 
          items={requests.map(req => req.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requests.map((request) => (
              <KanbanCard key={request.id} request={request} />
            ))}
            {requests.length === 0 && (
              <div 
                style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}
              >
                No requests in {column.title.toLowerCase()}
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;