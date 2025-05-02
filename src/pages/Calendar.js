import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Typography, Container, Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, CircularProgress
} from "@mui/material";

const localizer = momentLocalizer(moment);

const InventoryCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);  // 存儲當前選中的事件
  const [openEditDialog, setOpenEditDialog] = useState(false);  // 編輯事件對話框
  const [openAddDialog, setOpenAddDialog] = useState(false);  // 新增事件對話框
  const [eventDetails, setEventDetails] = useState({
    title: '',
    start: '',
    end: '',
    detail: ''
  });  // 用於存儲編輯或新增事件的詳細信息

  useEffect(() => {
    const loadGoogleAPI = () => {
      gapi.load("client:auth2", () => {
        gapi.client.init({
          apiKey: "AIzaSyBGfyjDedMPiZlTqhO-ByPHY1ZC_Ax_RGA",  // 使用你在 Google Cloud Console 中獲得的 API 密鑰
          clientId: "334720277647-7fn06j5okaepfisp3qq2qhlahkiev8uo.apps.googleusercontent.com", // 使用你在 Google Cloud Console 中獲得的 Client ID
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          scope: "https://www.googleapis.com/auth/calendar.readonly",
        }).then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsAuthenticated(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsAuthenticated);
        });
      });
    };

    loadGoogleAPI();
  }, []);

  const handleLogin = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  const handleGetGoogleEvents = () => {
    setLoading(true);
    gapi.client.calendar.events.list({
      calendarId: "primary", 
      timeMin: new Date().toISOString(), 
      showDeleted: false,
      singleEvents: true,
      maxResults: 50,
      orderBy: "startTime",
    }).then((response) => {
      const googleEvents = response.result.items.map(event => ({
        id: event.id,  
        title: event.summary,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        detail: event.description || "",
        allDay: !event.start.dateTime,
      }));
      setEvents(googleEvents);
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching events from Google Calendar:", error);
      setLoading(false);
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDetails({
      title: event.title,
      start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
      detail: event.detail
    });
    setOpenEditDialog(true);
  };

  const handleSaveEvent = () => {
    const updatedEvent = {
      ...selectedEvent,
      summary: eventDetails.title,
      start: {
        dateTime: new Date(eventDetails.start),
        timeZone: "Asia/Taipei",
      },
      end: {
        dateTime: new Date(eventDetails.end),
        timeZone: "Asia/Taipei",
      },
      description: eventDetails.detail,
    };

    gapi.client.calendar.events.update({
      calendarId: "primary",
      eventId: selectedEvent.id,
      resource: updatedEvent,
    }).then(() => {
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? { ...event, ...updatedEvent } : event
      );
      setEvents(updatedEvents);
      setOpenEditDialog(false);
    }).catch((error) => {
      console.error("Error updating event:", error);
    });
  };

  const handleAddNewEvent = () => {
    const newEvent = {
      summary: eventDetails.title,
      start: {
        dateTime: new Date(eventDetails.start),
        timeZone: "Asia/Taipei",
      },
      end: {
        dateTime: new Date(eventDetails.end),
        timeZone: "Asia/Taipei",
      },
      description: eventDetails.detail,
    };

    gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: newEvent,
    }).then((response) => {
      const createdEvent = response.result;
      setEvents([...events, {
        id: createdEvent.id,
        title: createdEvent.summary,
        start: new Date(createdEvent.start.dateTime),
        end: new Date(createdEvent.end.dateTime),
        detail: createdEvent.description,
        allDay: false,
      }]);
      setOpenAddDialog(false);
    }).catch((error) => {
      console.error("Error adding new event:", error);
    });
  };

  const handleCloseDialog = () => {
    setOpenEditDialog(false);
    setOpenAddDialog(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        庫存行事曆
      </Typography>
      {!isAuthenticated ? (
        <Button variant="contained" color="primary" onClick={handleLogin}>
          登入 Google 帳號
        </Button>
      ) : (
        <div>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            登出
          </Button>
          <Button variant="contained" onClick={handleGetGoogleEvents}>
            獲取 Google Calendar 事件
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
            新增事件
          </Button>
        </div>
      )}
      
      {loading ? (
        <CircularProgress />
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 670, marginTop: 20 }}
          onSelectEvent={handleEventClick}
        />
      )}

      {/* 編輯事件對話框 */}
      <Dialog open={openEditDialog} onClose={handleCloseDialog}>
        <DialogTitle>編輯事件</DialogTitle>
        <DialogContent>
          <TextField
            label="標題"
            fullWidth
            value={eventDetails.title}
            onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
            margin="normal"
          />
          <TextField
            label="開始時間"
            type="datetime-local"
            fullWidth
            value={eventDetails.start}
            onChange={(e) => setEventDetails({ ...eventDetails, start: e.target.value })}
            margin="normal"
          />
          <TextField
            label="結束時間"
            type="datetime-local"
            fullWidth
            value={eventDetails.end}
            onChange={(e) => setEventDetails({ ...eventDetails, end: e.target.value })}
            margin="normal"
          />
          <TextField
            label="詳細信息"
            fullWidth
            multiline
            rows={4}
            value={eventDetails.detail}
            onChange={(e) => setEventDetails({ ...eventDetails, detail: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleSaveEvent} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增事件對話框 */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog}>
        <DialogTitle>新增事件</DialogTitle>
        <DialogContent>
          <TextField
            label="標題"
            fullWidth
            value={eventDetails.title}
            onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
            margin="normal"
          />
          <TextField
            label="開始時間"
            type="datetime-local"
            fullWidth
            value={eventDetails.start}
            onChange={(e) => setEventDetails({ ...eventDetails, start: e.target.value })}
            margin="normal"
          />
          <TextField
            label="結束時間"
            type="datetime-local"
            fullWidth
            value={eventDetails.end}
            onChange={(e) => setEventDetails({ ...eventDetails, end: e.target.value })}
            margin="normal"
          />
          <TextField
            label="詳細信息"
            fullWidth
            multiline
            rows={4}
            value={eventDetails.detail}
            onChange={(e) => setEventDetails({ ...eventDetails, detail: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleAddNewEvent} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryCalendar;
