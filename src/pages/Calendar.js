import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Typography, Container, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";

const localizer = momentLocalizer(moment);

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
  const [newEvent, setNewEvent] = useState({ title: "", start: new Date(), end: new Date() });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleAddEvent = () => {
    setEvents([...events, newEvent]);
    setOpen(false);
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
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        新增事項
      </Button>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 670, marginTop: 20 }}
        onSelectEvent={handleSelectEvent}
        onNavigate={handleNavigate}
      />
      
      {/* 新增事項對話框 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>新增事項</DialogTitle>
        <DialogContent>
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
          />
          <TextField 
            fullWidth 
            label="結束時間" 
            type="datetime-local" 
            value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")} 
            onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })} 
            margin="dense"
          />
          <TextField 
            fullWidth 
            label="詳細資訊" 
            value={newEvent.detail} 
            onChange={(e) => setNewEvent({ ...newEvent, detail: e.target.value })} 
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">取消</Button>
          <Button onClick={handleAddEvent} color="primary">新增</Button>
        </DialogActions>
      </Dialog>

      {/* 事件詳情對話框 */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DialogTitle>事件詳情</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <Typography>標題: {selectedEvent.title}</Typography>
              <Typography>開始時間: {moment(selectedEvent.start).format("YYYY-MM-DD HH:mm")}</Typography>
              <Typography>結束時間: {moment(selectedEvent.end).format("YYYY-MM-DD HH:mm")}</Typography>
              <Typography>詳細資訊: {selectedEvent.detail}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} color="secondary">關閉</Button>
          <Button onClick={handleDeleteEvent} color="error">刪除</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryCalendar;