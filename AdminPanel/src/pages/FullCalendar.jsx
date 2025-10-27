// Inline styles for demonstration. For production, move to a dedicated CSS file or module.

import React, { useState } from 'react';
import { FaRegCalendar, FaMapMarkerAlt, FaRegClock } from 'react-icons/fa';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import './FullCalendar.css';


const CalendarPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewAgenda, setViewAgenda] = useState(null); // for viewing agenda details
  const [selectedDate, setSelectedDate] = useState(null);
  const [agendaText, setAgendaText] = useState('');
    const [agendaStartTime, setAgendaStartTime] = useState('');
    const [agendaEndTime, setAgendaEndTime] = useState('');
  const [agendaLocation, setAgendaLocation] = useState('');
  const [agendaDesc, setAgendaDesc] = useState('');
  const [agendaColor, setAgendaColor] = useState('#60a5fa');
  const [editIndex, setEditIndex] = useState(null);
  const [events, setEvents] = useState([]);

  // When a date is clicked, open modal and prefill agenda if exists
  // List all agendas for the selected date
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setAgendaText('');
    setAgendaTime('');
    setAgendaLocation('');
    setAgendaDesc('');
    setAgendaColor('#60a5fa');
    setEditIndex(null);
    setModalOpen(true);
  };

  // Save agenda as an event for the selected date
  // Save or update agenda for the selected date
  const handleAgendaSave = () => {
    setEvents(prev => {
      const agendasForDate = prev.filter(e => e.start === selectedDate);
      const others = prev.filter(e => e.start !== selectedDate);
        let startStr = selectedDate + (agendaStartTime ? 'T' + agendaStartTime : '');
        let endStr = agendaEndTime ? (selectedDate + 'T' + agendaEndTime) : undefined;
        const newAgenda = {
          title: agendaText,
          start: startStr,
          end: endStr,
          allDay: !(agendaStartTime && agendaEndTime),
          extendedProps: {
            location: agendaLocation,
            description: agendaDesc,
            color: agendaColor
          },
          backgroundColor: agendaColor,
          borderColor: agendaColor,
        };
      let updated;
      if (editIndex !== null) {
        // Edit existing
        updated = [...agendasForDate];
        updated[editIndex] = newAgenda;
      } else {
        // Add new
        updated = [...agendasForDate, newAgenda];
      }
      return [...others, ...updated];
    });
    setModalOpen(false);
    setEditIndex(null);
  };

  // Edit an agenda for the selected date
  const handleAgendaEdit = (idx, agenda) => {
    setAgendaText(agenda.title);
      if (agenda && !agenda.allDay && agenda.start && agenda.end) {
        setAgendaStartTime(agenda.start.split('T')[1] || '');
        setAgendaEndTime(agenda.end.split('T')[1] || '');
      } else {
        setAgendaStartTime('');
        setAgendaEndTime('');
      }
    setAgendaLocation(agenda.extendedProps?.location || '');
    setAgendaDesc(agenda.extendedProps?.description || '');
    setAgendaColor(agenda.extendedProps?.color || '#60a5fa');
    setEditIndex(idx);
  };

  // Delete an agenda for the selected date
  const handleAgendaDelete = (idx) => {
    setEvents(prev => {
      const agendasForDate = prev.filter(e => e.start.startsWith(selectedDate));
      const others = prev.filter(e => !e.start.startsWith(selectedDate));
      agendasForDate.splice(idx, 1);
      return [...others, ...agendasForDate];
    });
    setEditIndex(null);
    setAgendaText('');
    setAgendaTime('');
    setAgendaLocation('');
    setAgendaDesc('');
    setAgendaColor('#60a5fa');
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Open modal for today or selected date
  const handleSetAgendaBtn = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = selectedDate || todayStr;
    const existing = events.find(e => e.start === dateStr);
    setSelectedDate(dateStr);
    setAgendaText(existing ? existing.title : '');
    setModalOpen(true);
  };

  // Show agenda details when an event is clicked
  const handleEventClick = (info) => {
    setViewAgenda(info.event);
  };

  return (
    <div className="full-calendar-container">
      <button
        style={{
          marginBottom: 18,
          background: '#0033a0',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 28px',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
          float: 'right'
        }}
        onClick={handleSetAgendaBtn}
      >
        Set Agenda
      </button>
      <div style={{ clear: 'both' }} />
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        height={700}
        contentHeight={650}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Agenda',
          day: 'Day'
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
      {/* View Agenda Modal */}
      {viewAgenda && (
        <div className="agenda-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewAgenda(null)}>
          <div className="agenda-modal-content" style={{ background: '#fff', borderRadius: '16px', maxWidth: 480, width: '95%', padding: '32px 28px', boxShadow: '0 8px 32px rgba(0,51,160,0.18)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewAgenda(null)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#0033a0', cursor: 'pointer', fontWeight: 700 }} aria-label="Close">×</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <FaRegCalendar style={{ color: '#0033a0', fontSize: 24, marginRight: 10 }} />
              <h2 style={{ color: '#0033a0', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em', textAlign: 'center', margin: 0 }}>Agenda Details</h2>
            </div>
            <div style={{ marginBottom: 12, textAlign: 'center', color: '#222', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {viewAgenda.start && (
                <>
                  <FaRegCalendar style={{ color: '#0033a0', fontSize: 16, marginRight: 4 }} />
                  <span>{viewAgenda.startStr.split('T')[0]}</span>
                </>
              )}
            </div>
            <div style={{ marginBottom: 10, fontWeight: 700, color: '#0033a0', fontSize: 17 }}>{viewAgenda.title}</div>
            {viewAgenda.extendedProps?.location && (
              <div style={{ fontSize: 15, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaMapMarkerAlt style={{ color: '#0033a0', fontSize: 14 }} />
                <span>{viewAgenda.extendedProps.location}</span>
              </div>
            )}
            {viewAgenda.extendedProps?.description && <div style={{ fontSize: 15, color: '#222', marginBottom: 6 }}>{viewAgenda.extendedProps.description}</div>}
            {viewAgenda.start && !viewAgenda.allDay && (
              <div style={{ fontSize: 15, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaRegClock style={{ color: '#0033a0', fontSize: 14 }} />
                <span>{viewAgenda.startStr.split('T')[1]}{viewAgenda.endStr ? ` - ${viewAgenda.endStr.split('T')[1]}` : ''}</span>
              </div>
            )}
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <span style={{ display: 'inline-block', background: viewAgenda.backgroundColor, color: '#fff', borderRadius: 6, padding: '4px 12px', fontWeight: 600 }}>Category</span>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="agenda-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleModalClose}>
          <div className="agenda-modal-content" style={{ background: '#fff', borderRadius: '16px', maxWidth: 480, width: '95%', padding: '32px 28px', boxShadow: '0 8px 32px rgba(0,51,160,0.18)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={handleModalClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#0033a0', cursor: 'pointer', fontWeight: 700 }} aria-label="Close">×</button>
            <h2 style={{ color: '#0033a0', fontWeight: 800, fontSize: '1.3rem', marginBottom: 18, letterSpacing: '-0.015em', textAlign: 'center' }}>Set Agenda</h2>
            <div style={{ marginBottom: 18, textAlign: 'center', color: '#222', fontWeight: 600 }}>
              <label htmlFor="agenda-date" style={{ marginRight: 8 }}>Date:</label>
              <input
                id="agenda-date"
                type="date"
                value={selectedDate || ''}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ borderRadius: 8, border: '1px solid #c3d0e8', padding: 8, fontSize: 16 }}
              />
            </div>
            {/* List all agendas for this date */}
            <div style={{ marginBottom: 18 }}>
              {events.filter(e => e.start.startsWith(selectedDate)).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, color: '#0033a0', marginBottom: 6 }}>Agendas for this date:</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {events.filter(e => e.start.startsWith(selectedDate)).map((e, idx) => (
                      <li key={idx} style={{ marginBottom: 6, background: e.backgroundColor, borderRadius: 6, padding: 6, color: '#0033a0', position: 'relative' }}>
                        <div style={{ fontWeight: 700 }}>{e.title}</div>
                        {e.extendedProps?.location && <div style={{ fontSize: 13 }}>📍 {e.extendedProps.location}</div>}
                        {e.extendedProps?.description && <div style={{ fontSize: 13, color: '#222' }}>{e.extendedProps.description}</div>}
                        {e.start && !e.allDay && <div style={{ fontSize: 13 }}>🕒 {e.start.split('T')[1]}</div>}
                        <button onClick={() => handleAgendaEdit(idx, e)} style={{ position: 'absolute', right: 38, top: 6, background: 'none', border: 'none', color: '#0033a0', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                              {e.start && e.end && !e.allDay && (
                                <div style={{ fontSize: 13 }}>🕒 {e.start.split('T')[1]} - {e.end.split('T')[1]}</div>
                              )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <input
              type="text"
              value={agendaText}
              onChange={e => setAgendaText(e.target.value)}
              placeholder="Agenda Title"
              style={{ width: '100%', borderRadius: 8, border: '1px solid #c3d0e8', padding: 10, fontSize: 16, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="time"
                value={agendaStartTime}
                onChange={e => setAgendaStartTime(e.target.value)}
                placeholder="Start Time"
                style={{ flex: 1, borderRadius: 8, border: '1px solid #c3d0e8', padding: 10, fontSize: 16 }}
              />
              <input
                type="time"
                value={agendaEndTime}
                onChange={e => setAgendaEndTime(e.target.value)}
                placeholder="End Time"
                style={{ flex: 1, borderRadius: 8, border: '1px solid #c3d0e8', padding: 10, fontSize: 16 }}
              />
            </div>
            <input
              type="text"
              value={agendaLocation}
              onChange={e => setAgendaLocation(e.target.value)}
              placeholder="Location (optional)"
              style={{ width: '100%', borderRadius: 8, border: '1px solid #c3d0e8', padding: 10, fontSize: 16, marginBottom: 10 }}
            />
            <textarea
              value={agendaDesc}
              onChange={e => setAgendaDesc(e.target.value)}
              placeholder="Description/Notes (optional)"
              style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid #c3d0e8', padding: 10, fontSize: 15, marginBottom: 10 }}
            />
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, color: '#0033a0', marginRight: 8 }}>Color/Category:</label>
              <input type="color" value={agendaColor} onChange={e => setAgendaColor(e.target.value)} style={{ width: 36, height: 36, border: 'none', background: 'none', verticalAlign: 'middle' }} />
            </div>
            <button onClick={handleAgendaSave} style={{ width: '100%', background: '#0033a0', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{editIndex !== null ? 'Update Agenda' : 'Save Agenda'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
