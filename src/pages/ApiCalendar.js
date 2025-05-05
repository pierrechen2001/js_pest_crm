import React, { useEffect, useState } from "react";
import { Typography, Container, Button, CircularProgress } from "@mui/material";
import { gapi } from "gapi-script";
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
    window.gapi.client.calendar.events
      .list({
        calendarId: calendarId,
        timeMin: new Date().toISOString(), // 當前時間後的事件
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: "startTime",
      })
      .then((response) => {
        setEvents(response.result.items);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching calendar events:", error);
        setLoading(false);
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Google 行事曆
      </Typography>

      {initialized && (
        <Button variant="contained" onClick={getEvents}>
          重新整理行事曆事件
        </Button>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <Typography variant="h6" gutterBottom>
            事件列表：
          </Typography>
          {events.length === 0 ? (
            <Typography>尚未獲取到事件或日曆中沒有未來事件</Typography>
          ) : (
            <ul>
              {events.map((event, index) => (
                <li key={index}>
                  <Typography variant="body1">
                    {event.summary} ({event.start.dateTime ? new Date(event.start.dateTime).toLocaleString() : new Date(event.start.date).toLocaleDateString()})
                  </Typography>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Container>
  );
};

export default ApiCalendar;