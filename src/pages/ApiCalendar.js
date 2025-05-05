import React, { useEffect, useState } from "react";
import { Typography, Container, Button, CircularProgress } from "@mui/material";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import zhTWLocale from '@fullcalendar/core/locales/zh-tw';
// const apiKey = import.meta.env.REACT_APP_GOOGLE_API_KEY;
// const clientId = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID;

const ApiCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const calendarId = "jongshingpest@gmail.com";

  // 初始化 Google API 客戶端
  useEffect(() => {
    // 首先確保 gapi 已經載入
    const loadGapiAndInitClient = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // 載入 client 庫
        window.gapi.load('client', initClient);
      };
      script.onerror = (error) => {
        console.error('Error loading GAPI script:', error);
      };
      document.body.appendChild(script);
    };
  
    const initClient = () => {
      window.gapi.client.init({
        apiKey: "AIzaSyBGfyjDedMPiZlTqhO-ByPHY1ZC_Ax_RGA",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      })
      .then(() => {
        setInitialized(true);
        // 初始化完成後立即獲取事件
        getEvents();
      })
      .catch(error => {
        console.error("Error initializing GAPI client:", error);
      });
    };
  
    loadGapiAndInitClient();
  }, []);

  // 獲取 Google Calendar 事件
  const getEvents = () => {
    setLoading(true);
    // 獲取更多事件以顯示在日曆上
    const timeMin = new Date();
    timeMin.setFullYear(timeMin.getFullYear() - 5); // 獲取五年前的事件
    
    const timeMax = new Date();
    timeMax.setFullYear(timeMax.getFullYear() + 5); // 獲取五年後的事件
    
    window.gapi.client.calendar.events
      .list({
        calendarId: calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 250, // 增加事件數量
        orderBy: "startTime",
      })
      .then((response) => {
        // 將 Google Calendar 事件轉換為 FullCalendar 可用的格式
        const formattedEvents = response.result.items.map(event => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          description: event.description,
          location: event.location,
          url: event.htmlLink
        }));
        
        setEvents(formattedEvents);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching calendar events:", error);
        setLoading(false);
      });
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Google 行事曆
      </Typography>

      {initialized && (
        <Button variant="contained" onClick={getEvents} sx={{ mb: 2 }}>
          重新整理行事曆
        </Button>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <div style={{ height: '700px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            locale={zhTWLocale}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventClick={(info) => {
              if (info.event.url) {
                window.open(info.event.url);
                info.jsEvent.preventDefault();
              }
            }}
            height="100%"
          />
        </div>
      )}
    </Container>
  );
};

export default ApiCalendar;