import React, { useState, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Typography, Container, Button, Modal, Box, TextField } from "@mui/material";

const localizer = momentLocalizer(moment);

// 使用 Modal 替代 Dialog 来避免 findDOMNode 问题
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const InventoryCalendar = () => {
  const [events, setEvents] = useState([
    {
      title: "庫存盤點",
      start: new Date(),
      end: new Date(),
      detail: "看看材料剩下多少",
      allDay: true,
    },
  ]);
  
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: "", 
    start: new Date(), 
    end: new Date(),
    detail: ""
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);

  const handleAddEvent = () => {
    if (newEvent.title.trim()) {
      setEvents([...events, newEvent]);
      setOpen(false);
      setNewEvent({ title: "", start: new Date(), end: new Date(), detail: "" });
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  const handleDeleteEvent = () => {
    setEvents(events.filter(event => event !== selectedEvent));
    setDetailOpen(false);
  };

  const handleNavigate = (date) => {
    console.log("Navigated to:", date);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        庫存行事曆
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        新增事項
      </Button>
      
      {/* 使用 ref 而不是直接DOM操作 */}
      <div ref={calendarRef} style={{ height: 670 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onNavigate={handleNavigate}
        />
      </div>
      
      {/* 使用 Modal 替代 Dialog */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="add-event-modal"
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" id="add-event-modal" sx={{ mb: 2 }}>
            新增事項
          </Typography>
          
          <TextField 
            fullWidth 
            label="標題" 
            value={newEvent.title} 
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
            margin="dense"
          />
          <TextField 
            fullWidth 
            label="開始時間" 
            type="datetime-local" 
            value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")} 
            onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })} 
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField 
            fullWidth 
            label="結束時間" 
            type="datetime-local" 
            value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")} 
            onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })} 
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField 
            fullWidth 
            label="詳細資訊" 
            value={newEvent.detail} 
            onChange={(e) => setNewEvent({ ...newEvent, detail: e.target.value })} 
            margin="dense"
            multiline
            rows={3}
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setOpen(false)} color="secondary">取消</Button>
            <Button onClick={handleAddEvent} color="primary" variant="contained">新增</Button>
          </Box>
        </Box>
      </Modal>

      {/* 事件詳情 Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        aria-labelledby="event-detail-modal"
      >
        <Box sx={modalStyle}>
          {selectedEvent && (
            <>
              <Typography variant="h6" component="h2" id="event-detail-modal" sx={{ mb: 2 }}>
                事件詳情
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>標題:</strong> {selectedEvent.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>開始時間:</strong> {moment(selectedEvent.start).format("YYYY-MM-DD HH:mm")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>結束時間:</strong> {moment(selectedEvent.end).format("YYYY-MM-DD HH:mm")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>詳細資訊:</strong> {selectedEvent.detail || "無"}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setDetailOpen(false)} color="secondary">關閉</Button>
                <Button onClick={handleDeleteEvent} color="error" variant="contained">刪除</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default InventoryCalendar;