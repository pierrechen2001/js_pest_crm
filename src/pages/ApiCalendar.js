import React, { useEffect, useState, useCallback } from "react";
import { Typography, Container, Button, CircularProgress, Box, Alert, TextField } from "@mui/material";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import zhTWLocale from '@fullcalendar/core/locales/zh-tw';
import { useAuth } from '../context/AuthContext';

// Fallback credentials if environment variables don't work
const FALLBACK_API_KEY = "AIzaSyD_nRTQtxTTNLW19U4T0zdTohWT0BPiKzI";
const FALLBACK_CLIENT_ID = "516194420420-7oatcqmd1kc9h37nk4m2pe08aqfmd180.apps.googleusercontent.com";

const ApiCalendar = () => {
  // const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gapiInitialized, setGapiInitialized] = useState(false);
  const [gapiLoading, setGapiLoading] = useState(false);
  const [customClientId, setCustomClientId] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  
  // 使用特定公開行事曆ID
  const calendarId = "jongshingpest@gmail.com";

  // Add debug information
  const addDebugInfo = (message) => {
    console.log(message);
  };

  // Fetch calendar events
  const fetchEvents = useCallback(async () => {
    if (!window.gapi || !window.gapi.client) {
      addDebugInfo("GAPI client not available yet");
      return;
    }

    try {
      // Make sure calendar API is loaded
      if (!window.gapi.client.calendar) {
        addDebugInfo("Loading calendar API...");
        await window.gapi.client.load('calendar', 'v3');
        addDebugInfo("Calendar API loaded");
      }
    } catch (err) {
      addDebugInfo(`Error loading calendar API: ${err.message}`);
      setError(`Calendar API loading failed: ${err.message}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      addDebugInfo("Fetching events...");
      
      // Set date range (1 year back to 1 year forward)
      const timeMin = new Date();
      timeMin.setFullYear(timeMin.getFullYear() - 1);
      
      const timeMax = new Date();
      timeMax.setFullYear(timeMax.getFullYear() + 1);
      
      // Request events
      addDebugInfo(`Requesting events for calendar: ${calendarId}`);
      const response = await window.gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 250,
        orderBy: "startTime",
      });
      
      // Format for FullCalendar
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
      addDebugInfo(`Fetched ${formattedEvents.length} events`);
      
    } catch (error) {
      addDebugInfo(`Error fetching events: ${error.message}`);
      console.error("ApiCalendar: Error fetching events:", error);
      setError(`無法獲取行事曆事件: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [addDebugInfo, calendarId]);

  // Initialize Google client directly in this component
  const initializeGapi = useCallback(async () => {
    if (gapiInitialized || gapiLoading) return;
    
    setGapiLoading(true);
    setError(null);
    
    try {
      addDebugInfo("Initializing GAPI directly");
      
      // Get API keys from environment or custom input or fallback
      const apiKey = useCustomCredentials && customApiKey 
        ? customApiKey 
        : (process.env.REACT_APP_GOOGLE_API_KEY || FALLBACK_API_KEY);
        
      const clientId = useCustomCredentials && customClientId 
        ? customClientId 
        : (process.env.REACT_APP_GOOGLE_CLIENT_ID || FALLBACK_CLIENT_ID);
      
      addDebugInfo(`Using API Key: ${apiKey.substring(0, 5)}... and Client ID: ${clientId.substring(0, 10)}...`);
      
      // Check if already loaded
      if (!window.gapi) {
        addDebugInfo("Loading GAPI script...");
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            addDebugInfo("GAPI script loaded successfully");
            resolve();
          };
          script.onerror = (err) => {
            addDebugInfo(`Error loading GAPI script: ${err}`);
            reject(err);
          };
          document.body.appendChild(script);
        });
      } else {
        addDebugInfo("GAPI script already loaded");
      }
      
      // Load client
      if (!window.gapi.client) {
        addDebugInfo("Loading client...");
        await new Promise((resolve, reject) => {
          try {
            window.gapi.load('client', {
              callback: () => {
                addDebugInfo("client loaded successfully");
                resolve();
              },
              onerror: (err) => {
                addDebugInfo(`Error loading client: ${err}`);
                reject(err);
              },
              timeout: 10000, // 10 seconds
              ontimeout: () => {
                addDebugInfo("Timeout loading client");
                reject(new Error("Timeout loading client"));
              }
            });
          } catch (err) {
            addDebugInfo(`Exception loading client: ${err}`);
            reject(err);
          }
        });
      } else {
        addDebugInfo("client already loaded");
      }
      
      // Initialize client - only need API key for public calendars
      addDebugInfo("Initializing gapi.client...");
      try {
        await window.gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
        });
        addDebugInfo("GAPI client initialized successfully");
      } catch (err) {
        addDebugInfo(`Error initializing client: ${err.message}`);
        throw err;
      }
      
      setGapiInitialized(true);
      
      // 載入公開行事曆不需要登入
      addDebugInfo("載入公開行事曆 - 不需要用戶登入");
      await fetchEvents();
      
    } catch (error) {
      addDebugInfo(`Error initializing GAPI: ${error.message}`);
      console.error("ApiCalendar: Error initializing GAPI:", error);
      setError(`Google API 初始化失敗: ${error.message}`);
    } finally {
      setGapiLoading(false);
    }
  }, [gapiInitialized, gapiLoading, useCustomCredentials, customApiKey, customClientId, fetchEvents]);

  // Initialize on component mount
  useEffect(() => {
    addDebugInfo("Component mounted");
    
    // Add window error handler to catch any JS errors
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      addDebugInfo(`Global error: ${message} at ${source}:${lineno}:${colno}`);
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
    
    return () => {
      addDebugInfo("Component unmounted");
      window.onerror = originalOnError;
    };
  }, []);

  // Initialize component with a button prompt
  useEffect(() => {
    if (!gapiInitialized && !gapiLoading && !error) {
      addDebugInfo("Auto-initializing GAPI");
      initializeGapi();
    }
  }, [gapiInitialized, gapiLoading, error, initializeGapi]);

  // Main rendering logic
  if (!gapiInitialized && !gapiLoading && !error) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>蟲清消毒服務行事曆</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" sx={{ mt: 2 }}>
            載入中...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (gapiLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>蟲清消毒服務行事曆</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" sx={{ mt: 2 }}>載入中...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !gapiInitialized) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>蟲清消毒服務行事曆</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          連接失敗，請稍後再試
        </Alert>
        
        <Box sx={{ mb: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setUseCustomCredentials(false);
              setTimeout(initializeGapi, 100);
            }}
            disabled={gapiLoading}
          >
            重新嘗試連接
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        蟲清消毒服務行事曆
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button 
        variant="contained" 
        onClick={fetchEvents} 
        sx={{ mb: 2, mr: 2 }}
        disabled={loading || !gapiInitialized}
      >
        重新整理行事曆
      </Button>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Box sx={{ height: '700px', mt: 2 }}>
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
        </Box>
      )}
    </Container>
  );
};

export default ApiCalendar;