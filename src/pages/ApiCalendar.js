import React, { useEffect, useState, useCallback } from "react";
import { Typography, Container, Button, CircularProgress, Box, Alert, TextField } from "@mui/material";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import zhTWLocale from '@fullcalendar/core/locales/zh-tw';
import { useAuth } from '../context/AuthContext';

// Fallback credentials if environment variables don't work
const FALLBACK_API_KEY = "AIzaSyBGfyjDedMPiZlTqhO-ByPHY1ZC_Ax_RGA";
const FALLBACK_CLIENT_ID = "334720277647-7fn06j5okaepfisp3qq2qhlahkiev8uo.apps.googleusercontent.com";

const ApiCalendar = () => {
  // const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gapiInitialized, setGapiInitialized] = useState(false);
  const [gapiLoading, setGapiLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [customClientId, setCustomClientId] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  
  const calendarId = "primary";

  // Add debug information
  const addDebugInfo = (message) => {
    console.log(message);
    setDebugInfo(prev => prev + "\n" + message);
  };

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
        addDebugInfo("Loading client:auth2...");
        await new Promise((resolve, reject) => {
          try {
            window.gapi.load('client:auth2', {
              callback: () => {
                addDebugInfo("client:auth2 loaded successfully");
                resolve();
              },
              onerror: (err) => {
                addDebugInfo(`Error loading client:auth2: ${err}`);
                reject(err);
              },
              timeout: 10000, // 10 seconds
              ontimeout: () => {
                addDebugInfo("Timeout loading client:auth2");
                reject(new Error("Timeout loading client:auth2"));
              }
            });
          } catch (err) {
            addDebugInfo(`Exception loading client:auth2: ${err}`);
            reject(err);
          }
        });
      } else {
        addDebugInfo("client:auth2 already loaded");
      }
      
      // Initialize client
      addDebugInfo("Initializing gapi.client...");
      try {
        await window.gapi.client.init({
          apiKey: apiKey,
          clientId: clientId,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          scope: "https://www.googleapis.com/auth/calendar.readonly"
        });
        addDebugInfo("GAPI client initialized successfully");
      } catch (err) {
        addDebugInfo(`Error initializing client: ${err.message}`);
        throw err;
      }
      
      setGapiInitialized(true);
      
      // Check if signed in
      try {
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance) {
          addDebugInfo("Auth instance is null after initialization");
          throw new Error("Auth instance is null after initialization");
        }
        
        addDebugInfo("Auth instance created successfully");
        
        if (!authInstance.isSignedIn.get()) {
          addDebugInfo("No user signed in, requesting sign-in");
          await authInstance.signIn();
          addDebugInfo("User signed in successfully");
        } else {
          addDebugInfo("User already signed in");
        }
        
        // Load events immediately
        await fetchEvents();
      } catch (err) {
        addDebugInfo(`Error with auth instance: ${err.message}`);
        throw err;
      }
      
    } catch (error) {
      addDebugInfo(`Error initializing GAPI: ${error.message}`);
      console.error("ApiCalendar: Error initializing GAPI:", error);
      setError(`Google API 初始化失敗: ${error.message}`);
    } finally {
      setGapiLoading(false);
    }
  }, [gapiInitialized, gapiLoading, useCustomCredentials, customApiKey, customClientId, fetchEvents]);

  // Fetch calendar events
  const fetchEvents = async () => {
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
  };

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
    const timer = setTimeout(() => {
      if (!gapiInitialized && !gapiLoading && !error) {
        addDebugInfo("Ready to initialize - click button to start");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [gapiInitialized, gapiLoading, error]);

  // Main rendering logic
  if (!gapiInitialized && !gapiLoading && !error) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Google 行事曆</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
            點擊下方按鈕連接 Google 行事曆
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={initializeGapi}
            startIcon={<img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              style={{ width: 20, height: 20 }}
            />}
          >
            連接 Google 行事曆
          </Button>
        </Box>
      </Container>
    );
  }

  if (gapiLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Google 行事曆</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>正在連接 Google 服務...</Typography>
          <Typography variant="caption" sx={{ mt: 2, maxWidth: '100%', overflowX: 'auto' }}>
            {debugInfo.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && !gapiInitialized) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Google 行事曆</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            嘗試使用自定義憑據:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <TextField 
              label="Client ID"
              value={customClientId}
              onChange={(e) => setCustomClientId(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="輸入您的 Google Client ID"
            />
            
            <TextField 
              label="API Key"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="輸入您的 Google API Key"
            />
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setUseCustomCredentials(true);
                setTimeout(initializeGapi, 100);
              }}
              disabled={!customClientId || !customApiKey}
            >
              使用自定義憑據嘗試連接
            </Button>
          </Box>
          
          <Button 
            variant="outlined" 
            onClick={() => {
              setUseCustomCredentials(false);
              setTimeout(initializeGapi, 100);
            }}
            disabled={gapiLoading}
            sx={{ mr: 2 }}
          >
            使用原始憑據重試
          </Button>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          調試信息:
        </Typography>
        <Box sx={{ 
          p: 2, 
          bgcolor: '#f5f5f5', 
          borderRadius: 1, 
          maxHeight: '200px', 
          overflowY: 'auto',
          mb: 2,
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap'
        }}>
          {debugInfo.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Google 行事曆
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
          <CircularProgress />
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
      
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'none' }}>
        <Typography variant="subtitle2" gutterBottom>
          調試信息:
        </Typography>
        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          {debugInfo}
        </pre>
      </Box>
    </Container>
  );
};

export default ApiCalendar;