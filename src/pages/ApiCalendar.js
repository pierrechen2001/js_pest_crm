import React, { useEffect, useState } from "react";
import { Typography, Container, Button, CircularProgress } from "@mui/material";
import { gapi } from "gapi-script";
// const apiKey = import.meta.env.REACT_APP_GOOGLE_API_KEY;
// const clientId = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID;

const ApiCalendar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 初始化 Google API 客戶端
  useEffect(() => {
    // 首先確保 gapi 已經載入
    const loadGapiAndInitClient = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // 載入 auth2 和 client 庫
        window.gapi.load('client:auth2', initClient);
      };
      script.onerror = (error) => {
        console.error('Error loading GAPI script:', error);
      };
      document.body.appendChild(script);
    };
  
    const initClient = () => {
      window.gapi.client.init({
        apiKey: "AIzaSyBGfyjDedMPiZlTqhO-ByPHY1ZC_Ax_RGA",
        clientId: "334720277647-7fn06j5okaepfisp3qq2qhlahkiev8uo.apps.googleusercontent.com",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.readonly",
      })
      .then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance();
        setIsAuthenticated(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsAuthenticated);
      })
      .catch(error => {
        console.error("Error initializing GAPI client:", error);
      });
    };
  
    loadGapiAndInitClient();
  }, []);

  // 登入處理
  const handleLogin = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  // 登出處理
  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  // 獲取 Google Calendar 事件
  const handleGetEvents = () => {
    setLoading(true);
    gapi.client.calendar.events
      .list({
        calendarId: "primary",
        timeMin: new Date().toISOString(), // 當前時間後的事件
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: "startTime",
      })
      .then((response) => {
        setEvents(response.result.items);
        setLoading(false);
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Google 行事曆
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
          <Button variant="contained" onClick={handleGetEvents}>
            獲取行事曆事件
          </Button>
        </div>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <Typography variant="h6" gutterBottom>
            事件列表：
          </Typography>
          {events.length === 0 ? (
            <Typography>尚未獲取到事件</Typography>
          ) : (
            <ul>
              {events.map((event, index) => (
                <li key={index}>
                  <Typography variant="body1">
                    {event.summary} ({new Date(event.start.dateTime).toLocaleString()})
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