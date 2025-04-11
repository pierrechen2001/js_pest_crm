import React, { useEffect, useState } from "react";
import { Typography, Container, Button, CircularProgress } from "@mui/material";
import { gapi } from "gapi-script";

const ApiCalendar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 初始化 Google API 客戶端
  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        apiKey: "AIzaSyBGfyjDedMPiZlTqhO-ByPHY1ZC_Ax_RGA", // 您的 API 金鑰
        clientId: "334720277647-7fn06j5okaepfisp3qq2qhlahkiev8uo.apps.googleusercontent.com", // 您的 OAuth Client ID
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.readonly",
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        setIsAuthenticated(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsAuthenticated); // 監聽認證狀態變化
      });
    };

    gapi.load("client:auth2", initClient);
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
