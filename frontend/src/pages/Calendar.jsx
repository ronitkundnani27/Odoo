import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { requestsAPI } from '../services/mockBackend';
import RequestForm from '../components/Requests/RequestForm';

const Calendar = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getAll();
      if (response.success) {
        // Filter only preventive requests with scheduled dates
        const preventiveRequests = response.data.filter(
          req => req.requestType === 'Preventive' && req.scheduledDate
        );
        setRequests(preventiveRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await requestsAPI.create(formData);
      if (response.success) {
        await fetchRequests(); // Refresh the calendar
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

  const getRequestsForDate = (date) => {
    const dateStr = formatDate(date);
    return requests.filter(req => req.scheduledDate === dateStr);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Repaired': return '#10b981';
      case 'Scrap': return '#ef4444';
      default: return '#6b7280';
    }
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

            <button className="btn btn-secondary" onClick={goToToday}>
              Today
            </button>
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

              const dayRequests = getRequestsForDate(date);
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

                  {/* Requests for this date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayRequests.slice(0, 3).map((request) => (
                      <div
                        key={request.id}
                        style={{
                          backgroundColor: getStatusColor(request.status) + '20',
                          color: getStatusColor(request.status),
                          padding: '2px 4px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={`${request.subject} - ${request.equipmentName}`}
                      >
                        {request.subject}
                      </div>
                    ))}
                    
                    {dayRequests.length > 3 && (
                      <div style={{
                        fontSize: '10px',
                        color: '#6b7280',
                        textAlign: 'center',
                        marginTop: '2px'
                      }}>
                        +{dayRequests.length - 3} more
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
          <h5 style={{ marginBottom: '12px' }}>Status Legend</h5>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div className="d-flex align-items-center">
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '3px',
                marginRight: '8px'
              }} />
              <span style={{ fontSize: '14px' }}>New</span>
            </div>
            <div className="d-flex align-items-center">
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '3px',
                marginRight: '8px'
              }} />
              <span style={{ fontSize: '14px' }}>In Progress</span>
            </div>
            <div className="d-flex align-items-center">
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#10b981', 
                borderRadius: '3px',
                marginRight: '8px'
              }} />
              <span style={{ fontSize: '14px' }}>Completed</span>
            </div>
            <div className="d-flex align-items-center">
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#ef4444', 
                borderRadius: '3px',
                marginRight: '8px'
              }} />
              <span style={{ fontSize: '14px' }}>Scrap</span>
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