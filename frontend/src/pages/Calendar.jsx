import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle, Settings, Wrench } from 'lucide-react';
import { maintenanceRequestAPI } from '../services/maintenanceRequestService';
import { equipmentAPI } from '../services/equipmentService';
import RequestForm from '../components/Requests/RequestForm';

const Calendar = () => {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all'); // all, maintenance, warranty

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Combine requests and equipment into calendar events
    generateCalendarEvents();
  }, [requests, equipment, filterType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch maintenance requests
      const requestsResponse = await maintenanceRequestAPI.getAll();
      if (requestsResponse.success) {
        setRequests(requestsResponse.data);
      }
      
      // Fetch equipment for warranty dates
      const equipmentResponse = await equipmentAPI.getAll();
      if (equipmentResponse.success) {
        setEquipment(equipmentResponse.data);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarEvents = () => {
    const events = [];

    // Add maintenance request events
    if (filterType === 'all' || filterType === 'maintenance') {
      requests.forEach(req => {
        if (req.scheduledDate) {
          events.push({
            id: `req-${req.id}`,
            type: 'maintenance',
            date: req.scheduledDate,
            title: req.subject,
            subtitle: req.equipmentName,
            status: req.status,
            requestType: req.requestType,
            priority: req.priority,
            data: req
          });
        }
      });
    }

    // Add equipment warranty expiry events
    if (filterType === 'all' || filterType === 'warranty') {
      equipment.forEach(eq => {
        if (eq.warrantyExpiry) {
          const expiryDate = new Date(eq.warrantyExpiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          
          events.push({
            id: `warranty-${eq.id}`,
            type: 'warranty',
            date: eq.warrantyExpiry,
            title: `Warranty Expiry`,
            subtitle: eq.name,
            isExpiring: daysUntilExpiry <= 30 && daysUntilExpiry >= 0,
            isExpired: daysUntilExpiry < 0,
            data: eq
          });
        }
      });
    }

    setCalendarEvents(events);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await maintenanceRequestAPI.create(formData);
      if (response.success) {
        await fetchData(); // Refresh the calendar
        setShowForm(false);
        setSelectedDate(null);
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return calendarEvents.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    calendarDays.push(date);
  }

  const getEventColor = (event) => {
    if (event.type === 'warranty') {
      if (event.isExpired) return '#ef4444'; // Red for expired
      if (event.isExpiring) return '#f59e0b'; // Orange for expiring soon
      return '#8b5cf6'; // Purple for warranty
    }
    
    // Maintenance request colors by status
    switch (event.status) {
      case 'New': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Repaired': return '#10b981';
      case 'Scrap': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEventIcon = (event) => {
    if (event.type === 'warranty') {
      return event.isExpired || event.isExpiring ? AlertTriangle : Settings;
    }
    return Wrench;
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Maintenance Calendar</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Schedule Maintenance
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div className="card">
          <div className="card-body text-center">
            <Wrench size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 4px 0', color: '#3b82f6' }}>
              {requests.filter(r => r.scheduledDate).length}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Scheduled Maintenance</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <Settings size={24} color="#8b5cf6" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 4px 0', color: '#8b5cf6' }}>
              {equipment.filter(e => e.warrantyExpiry).length}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Equipment with Warranty</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <AlertTriangle size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 4px 0', color: '#f59e0b' }}>
              {equipment.filter(e => {
                if (!e.warrantyExpiry) return false;
                const expiryDate = new Date(e.warrantyExpiry);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
              }).length}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Warranties Expiring Soon</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <CalendarIcon size={24} color="#10b981" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 4px 0', color: '#10b981' }}>
              {calendarEvents.length}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Total Events</p>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center" style={{ gap: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => navigateMonth(-1)}
                style={{ padding: '8px 12px' }}
              >
                <ChevronLeft size={16} />
              </button>
              
              <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center' }}>
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              
              <button
                className="btn btn-secondary"
                onClick={() => navigateMonth(1)}
                style={{ padding: '8px 12px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="d-flex align-items-center" style={{ gap: '12px' }}>
              {/* Filter Buttons */}
              <div className="btn-group">
                <button
                  className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterType('all')}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  All
                </button>
                <button
                  className={`btn ${filterType === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterType('maintenance')}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  <Wrench size={14} style={{ marginRight: '4px' }} />
                  Maintenance
                </button>
                <button
                  className={`btn ${filterType === 'warranty' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterType('warranty')}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  <Settings size={14} style={{ marginRight: '4px' }} />
                  Warranty
                </button>
              </div>

              <button className="btn btn-secondary" onClick={goToToday}>
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card">
        <div className="card-body" style={{ padding: '20px' }}>
          {/* Days of week header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '1px',
            marginBottom: '10px'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day}
                style={{ 
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  backgroundColor: '#f8f9fa',
                  color: '#6b7280'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '1px',
            backgroundColor: '#e5e7eb'
          }}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div 
                    key={index}
                    style={{ 
                      minHeight: '120px',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                );
              }

              const dayEvents = getEventsForDate(date);
              const isToday = isCurrentMonth && date.getDate() === today.getDate();
              const isPast = date < today;

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  style={{
                    minHeight: '120px',
                    backgroundColor: 'white',
                    padding: '8px',
                    cursor: 'pointer',
                    border: isToday ? '2px solid #3b82f6' : 'none',
                    opacity: isPast ? 0.6 : 1,
                    position: 'relative'
                  }}
                  className="calendar-day"
                >
                  <div style={{ 
                    fontWeight: isToday ? '700' : '500',
                    color: isToday ? '#3b82f6' : '#374151',
                    marginBottom: '4px'
                  }}>
                    {date.getDate()}
                  </div>

                  {/* Events for this date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayEvents.slice(0, 3).map((event) => {
                      const EventIcon = getEventIcon(event);
                      return (
                        <div
                          key={event.id}
                          style={{
                            backgroundColor: getEventColor(event) + '20',
                            color: getEventColor(event),
                            padding: '3px 5px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title={`${event.title} - ${event.subtitle}`}
                        >
                          <EventIcon size={10} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {event.title}
                          </span>
                        </div>
                      );
                    })}
                    
                    {dayEvents.length > 3 && (
                      <div style={{
                        fontSize: '10px',
                        color: '#6b7280',
                        textAlign: 'center',
                        marginTop: '2px'
                      }}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-body">
          <h5 style={{ marginBottom: '12px' }}>Legend</h5>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Maintenance Status */}
            <div>
              <h6 style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Maintenance Status</h6>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className="d-flex align-items-center">
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: '#3b82f6', 
                    borderRadius: '3px',
                    marginRight: '6px'
                  }} />
                  <span style={{ fontSize: '13px' }}>New</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: '#f59e0b', 
                    borderRadius: '3px',
                    marginRight: '6px'
                  }} />
                  <span style={{ fontSize: '13px' }}>In Progress</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: '#10b981', 
                    borderRadius: '3px',
                    marginRight: '6px'
                  }} />
                  <span style={{ fontSize: '13px' }}>Completed</span>
                </div>
              </div>
            </div>

            {/* Warranty Status */}
            <div>
              <h6 style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Warranty</h6>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className="d-flex align-items-center">
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: '#8b5cf6', 
                    borderRadius: '3px',
                    marginRight: '6px'
                  }} />
                  <span style={{ fontSize: '13px' }}>Active</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: '#f59e0b', 
                    borderRadius: '3px',
                    marginRight: '6px'
                  }} />
                  <span style={{ fontSize: '13px' }}>Expiring Soon</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: '#ef4444', 
                    borderRadius: '3px',
                    marginRight: '6px'
                  }} />
                  <span style={{ fontSize: '13px' }}>Expired</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedDate(null);
          }}
          defaultDate={selectedDate ? formatDate(selectedDate) : ''}
          defaultType="Preventive"
        />
      )}

      <style jsx>{`
        .calendar-day:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default Calendar;