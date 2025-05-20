import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Typography, Container, Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Box, Checkbox, FormControlLabel
} from "@mui/material";
import { supabase } from "../lib/supabaseClient"; // 請確認你的 supabaseClient 路徑

const localizer = momentLocalizer(moment);

const InventoryCalendar = () => {
  // 讀取 localStorage 事件
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('crm_events');
    if (saved) {
      // 轉換日期字串為 Date 物件
      return JSON.parse(saved).map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      }));
    }
    return [];
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [trackEvents, setTrackEvents] = useState([]);
  const [showTrackDates, setShowTrackDates] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    title: '',
    start: '',
    end: '',
    detail: ''
  });

  // 若有事件變動，寫回 localStorage
  useEffect(() => {
      const saved = localStorage.getItem('crm_events');
      if (saved) {
        setEvents(JSON.parse(saved).map(ev => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end),
        })));
      }
    const onStorage = () => {
      const saved = localStorage.getItem('crm_events');
      if (saved) {
        setEvents(JSON.parse(saved).map(ev => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end),
        })));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 讀取 supabase 追蹤事件
  useEffect(() => {
    const fetchTrackEvents = async () => {
      const { data, error } = await supabase
        .from('project')
        .select('project_id, project_name, track_remind_date')
        .eq('is_tracked', true)
        .not('track_remind_date', 'is', null);

      if (error) {
        console.error('載入追蹤事件失敗', error);
        return;
      }

      const trackEvents = (data || []).map(proj => ({
        title: `追蹤：${proj.project_name}`,
        start: new Date(proj.track_remind_date),
        end: new Date(proj.track_remind_date),
        allDay: true,
        projectId: proj.project_id,
        type: 'track'
      }));

      setTrackEvents(trackEvents);
    };

    fetchTrackEvents();
  }, []);

  const allEvents = showTrackDates ? [...events, ...trackEvents] : events;

  const handleEventClick = (event) => {
    if (event.projectId) {
      // 跳轉到專案詳情頁
      window.location.href = `/order/${event.projectId}`;
    } else {
      setSelectedEvent(event);
      setEventDetails({
        title: event.title,
        start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
        end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
        detail: event.detail
      });
      setOpenEditDialog(true);
    }
  };

  const handleSaveEvent = () => {
    const updatedEvent = {
      ...selectedEvent,
      title: eventDetails.title,
      start: new Date(eventDetails.start),
      end: new Date(eventDetails.end),
      detail: eventDetails.detail,
    };

    const updatedEvents = events.map(event =>
      event === selectedEvent ? updatedEvent : event
    );

    setEvents(updatedEvents);
    setOpenEditDialog(false);
  };

  const handleDeleteEvent = () => {
    const updatedEvents = events.filter(event => event !== selectedEvent);
    setEvents(updatedEvents);
    setOpenEditDialog(false);
  };

  const handleAddNewEvent = () => {
    const newEvent = {
      id: new Date().getTime(), // 用時間當作唯一 id
      title: eventDetails.title,
      start: new Date(eventDetails.start),
      end: new Date(eventDetails.end),
      detail: eventDetails.detail,
      allDay: false,
    };

    setEvents([...events, newEvent]);
    setOpenAddDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenEditDialog(false);
    setOpenAddDialog(false);
  };

  return (
    
    <Box>
      <Container>
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTrackDates}
                onChange={e => setShowTrackDates(e.target.checked)}
                color="primary"
              />
            }
            label="顯示追蹤提醒"
          />
        </Box>
      </Container>

      <Typography variant="h4" gutterBottom>
        庫存行事曆
      </Typography>

      <Button variant="contained" color="primary" onClick={() => {
        setEventDetails({ title: '', start: '', end: '', detail: '' });
        setOpenAddDialog(true);
      }}>
        新增事件
      </Button>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 670, marginTop: 20 }}
        onSelectEvent={handleEventClick}
      />

      {/* 編輯事件 */}
      <Dialog open={openEditDialog} onClose={handleCloseDialog}>
        <DialogTitle>編輯事件</DialogTitle>
        <DialogContent>
          <TextField label="標題" fullWidth value={eventDetails.title}
            onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })} margin="normal" />
          <TextField label="開始時間" type="datetime-local" fullWidth value={eventDetails.start}
            onChange={(e) => setEventDetails({ ...eventDetails, start: e.target.value })} margin="normal" />
          <TextField label="結束時間" type="datetime-local" fullWidth value={eventDetails.end}
            onChange={(e) => setEventDetails({ ...eventDetails, end: e.target.value })} margin="normal" />
          <TextField label="詳細信息" fullWidth multiline rows={4} value={eventDetails.detail}
            onChange={(e) => setEventDetails({ ...eventDetails, detail: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteEvent} color="error">刪除</Button>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSaveEvent} color="primary">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 新增事件 */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog}>
        <DialogTitle>新增事件</DialogTitle>
        <DialogContent>
          <TextField label="標題" fullWidth value={eventDetails.title}
            onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })} margin="normal" />
          <TextField label="開始時間" type="datetime-local" fullWidth value={eventDetails.start}
            onChange={(e) => setEventDetails({ ...eventDetails, start: e.target.value })} margin="normal" />
          <TextField label="結束時間" type="datetime-local" fullWidth value={eventDetails.end}
            onChange={(e) => setEventDetails({ ...eventDetails, end: e.target.value })} margin="normal" />
          <TextField label="詳細信息" fullWidth multiline rows={4} value={eventDetails.detail}
            onChange={(e) => setEventDetails({ ...eventDetails, detail: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleAddNewEvent} color="primary">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryCalendar;
