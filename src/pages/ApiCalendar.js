import React, { useEffect, useState, useCallback, useRef } from "react";
import { Typography, Container, Button, CircularProgress, Box, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, FormHelperText, Checkbox, FormControlLabel } from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import zhTW from 'date-fns/locale/zh-TW';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import zhTWLocale from '@fullcalendar/core/locales/zh-tw';
import { useAuth } from '../context/AuthContext';
import './ApiCalendar.css'; // 引入自定義CSS
import { supabase } from '../lib/supabaseClient';

// Fallback credentials if environment variables don't work
const FALLBACK_API_KEY = "AIzaSyD_nRTQtxTTNLW19U4T0zdTohWT0BPiKzI";
const FALLBACK_CLIENT_ID = "516194420420-7oatcqmd1kc9h37nk4m2pe08aqfmd180.apps.googleusercontent.com";

const ApiCalendar = () => {
  const { user, googleAuth } = useAuth();
  const [events, setEvents] = useState([]);
  const [projectEvents, setProjectEvents] = useState([]); // 新增: 專案事件
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false); // 新增: 專案加載狀態
  const [error, setError] = useState(null);
  const [projectError, setProjectError] = useState(null); // 新增: 專案錯誤狀態
  const [gapiInitialized, setGapiInitialized] = useState(false);
  const [gapiLoading, setGapiLoading] = useState(false);
  const [customClientId, setCustomClientId] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  
  // 參考標誌，避免無限渲染循環
  const isMountedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const hasFetchedProjectsRef = useRef(false);
  
  // 新增活動相關狀態
  const [openNewEventDialog, setOpenNewEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // 預設一小時後
    description: '',
    type: 'default', // 預設類型
  });
  const [eventErrors, setEventErrors] = useState({
    title: false,
    start: false,
    end: false,
  });
  const [addingEvent, setAddingEvent] = useState(false);
  const [addEventSuccess, setAddEventSuccess] = useState(false);
  const [addEventError, setAddEventError] = useState(null);
  
  // 使用特定公開行事曆ID
  const calendarId = "jongshingpest@gmail.com";
  
  // 新增：顯示控制
  const [showConstructionDates, setShowConstructionDates] = useState(true); // 顯示施工日期
  const [showPaymentDates, setShowPaymentDates] = useState(true); // 顯示收款日期
  const [showTrackDates, setShowTrackDates] = useState(true); // 顯示追蹤提醒
  const [trackEvents, setTrackEvents] = useState([]); // 追蹤事件

  // Add debug information
  const addDebugInfo = (message) => {
    console.log(`[Calendar] ${message}`);
  };

  // 使用 Google Auth 登入
  const handleGoogleSignIn = async () => {
    try {
      if (!googleAuth) {
        setNeedsAuth(true);
        addDebugInfo("Google 認證尚未初始化，需要先登入");
        throw new Error("Google 認證尚未初始化，請先登入您的 Google 帳號");
      }

      try {
        const currentUser = googleAuth.currentUser.get();
        
        if (currentUser && currentUser.hasGrantedScopes('https://www.googleapis.com/auth/calendar')) {
          addDebugInfo("使用者已授權日曆存取權限");
          return currentUser;
        }
      } catch (error) {
        addDebugInfo(`檢查當前用戶時出錯: ${error.message}`);
        // 如果無法獲取當前用戶，嘗試重新登入
      }
      
      addDebugInfo("請求日曆存取權限");
      const googleUser = await googleAuth.signIn({
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
      });
      
      // 確認是否取得所需的權限
      if (!googleUser.hasGrantedScopes('https://www.googleapis.com/auth/calendar')) {
        throw new Error("使用者未授予日曆存取權限");
      }
      
      addDebugInfo("Google 登入且取得日曆授權成功");
      setNeedsAuth(false);
      return googleUser;
    } catch (error) {
      addDebugInfo(`Google 登入錯誤: ${error.message}`);
      setNeedsAuth(true);
      throw error;
    }
  };

  // Fetch calendar events - 讀取公開行事曆，不需要授權
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
      const formattedEvents = response.result.items.map(event => {
        // 依據事件類型或內容設定不同的顏色
        let backgroundColor;
        const eventTitle = event.summary ? event.summary.toLowerCase() : '';
        const eventDesc = event.description ? event.description.toLowerCase() : '';
        
        // 更豐富的顏色分類
        if (eventTitle.includes('設計') || eventTitle.includes('design')) {
          backgroundColor = '#e5eaff'; // 淡藍色
        } else if (eventTitle.includes('測試') || eventTitle.includes('test')) {
          backgroundColor = '#ffefd5'; // 淡橙色
        } else if (eventTitle.includes('營銷') || eventTitle.includes('銷售') || 
                   eventTitle.includes('marketing') || eventTitle.includes('sales')) {
          backgroundColor = '#e8f5e9'; // 淡綠色
        } else if (eventTitle.includes('程式') || eventTitle.includes('開發') || 
                   eventTitle.includes('program') || eventTitle.includes('develop')) {
          backgroundColor = '#f3e5f5'; // 淡紫色
        } else if (eventTitle.includes('會議') || eventTitle.includes('討論') || 
                   eventTitle.includes('meeting') || eventTitle.includes('discussion')) {
          backgroundColor = '#ffebee'; // 淡紅色
        } else if (eventTitle.includes('研究') || eventTitle.includes('分析') || 
                   eventTitle.includes('research') || eventTitle.includes('analysis')) {
          backgroundColor = '#fff8e1'; // 淡黃色
        } else if (eventTitle.includes('培訓') || eventTitle.includes('教育') || 
                   eventTitle.includes('training') || eventTitle.includes('education')) {
          backgroundColor = '#e0f7fa'; // 淡青色
        } else if (eventTitle.includes('客戶') || eventTitle.includes('拜訪') || 
                   eventTitle.includes('customer') || eventTitle.includes('visit')) {
          backgroundColor = '#f1f8e9'; // 淡綠色
        } else if (eventTitle.includes('計劃') || eventTitle.includes('規劃') || 
                   eventTitle.includes('plan') || eventTitle.includes('schedule')) {
          backgroundColor = '#e8eaf6'; // 淡靛藍色
        } else {
          // 如果沒有匹配的關鍵字，使用日期來決定顏色
          const date = new Date(event.start.dateTime || event.start.date);
          const weekday = date.getDay(); // 0-6 (週日-週六)
          
          // 根據星期幾設定不同的顏色
          const colorPalette = [
            '#ede7f6', // 週日 - 淡紫羅蘭色
            '#e3f2fd', // 週一 - 淡藍色
            '#e0f2f1', // 週二 - 淡綠松石色
            '#f1f8e9', // 週三 - 淡萊姆色
            '#fff8e1', // 週四 - 淡琥珀色
            '#fbe9e7', // 週五 - 淡橙色
            '#f3e5f5'  // 週六 - 淡紫色
          ];
          
          backgroundColor = colorPalette[weekday];
        }
        
        return {
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          description: event.description,
          location: event.location,
          url: event.htmlLink,
          backgroundColor: backgroundColor,
          borderColor: backgroundColor,
          textColor: '#333', // 深灰色文字
          classNames: ['custom-calendar-event']
        };
      });
      
      setEvents(formattedEvents);
      addDebugInfo(`Fetched ${formattedEvents.length} events`);
      
    } catch (error) {
      addDebugInfo(`Error fetching events: ${error.message}`);
      console.error("ApiCalendar: Error fetching events:", error);
      setError(`無法獲取行事曆事件: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [calendarId]);

  // 新增活動到行事曆 - 需要授權
  const addEventToCalendar = async () => {
    let hasErrors = false;
    const newErrors = {
      title: false,
      start: false,
      end: false
    };

    // 驗證欄位
    if (!newEvent.title.trim()) {
      newErrors.title = true;
      hasErrors = true;
    }

    if (!newEvent.start) {
      newErrors.start = true;
      hasErrors = true;
    }

    if (!newEvent.end) {
      newErrors.end = true;
      hasErrors = true;
    } else if (newEvent.end < newEvent.start) {
      newErrors.end = true;
      hasErrors = true;
    }

    setEventErrors(newErrors);
    
    if (hasErrors) {
      return;
    }

    setAddingEvent(true);
    setAddEventSuccess(false);
    setAddEventError(null);

    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
        throw new Error("Google Calendar API 未正確載入");
      }

      // 新增活動前確保用戶已登入並授權
      try {
        await handleGoogleSignIn();
      } catch (error) {
        setNeedsAuth(true);
        throw new Error("需要 Google 授權才能新增活動");
      }

      // 根據類型選擇顏色
      let colorId;
      switch (newEvent.type) {
        case 'design':
          colorId = '1'; // 藍色
          break;
        case 'testing':
          colorId = '5'; // 黃色
          break;
        case 'marketing':
          colorId = '2'; // 綠色
          break;
        case 'programming':
          colorId = '3'; // 紫色
          break;
        case 'meeting':
          colorId = '4'; // 粉紅色
          break;
        case 'research':
          colorId = '6'; // 橙色
          break;
        case 'training':
          colorId = '7'; // 青色
          break;
        case 'customer':
          colorId = '9'; // 綠色
          break;
        case 'planning':
          colorId = '10'; // 藍紫色
          break;
        default:
          colorId = '0'; // 預設
      }

      // 準備事件資料
      const event = {
        summary: newEvent.title,
        description: newEvent.description,
        start: {
          dateTime: newEvent.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: newEvent.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        colorId: colorId
      };

      // 創建事件
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: event
      });

      if (response && response.result) {
        setAddEventSuccess(true);
        // 重新獲取所有事件以更新日曆
        await fetchEvents();
        // 清除表單並關閉對話框
        setTimeout(() => {
          setAddEventSuccess(false);
          setOpenNewEventDialog(false);
          resetEventForm();
        }, 1500);
      }
    } catch (error) {
      console.error("新增活動錯誤:", error);
      setAddEventError(`無法新增活動: ${error.message}`);
    } finally {
      setAddingEvent(false);
    }
  };

  // 重設活動表單
  const resetEventForm = () => {
    const now = new Date();
    setNewEvent({
      title: '',
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000),
      description: '',
      type: 'default',
    });
    setEventErrors({
      title: false,
      start: false,
      end: false,
    });
    setAddEventError(null);
  };

  // 打開新增活動對話框
  const handleOpenNewEventDialog = () => {
    resetEventForm();
    setOpenNewEventDialog(true);
  };

  // 關閉新增活動對話框
  const handleCloseNewEventDialog = () => {
    setOpenNewEventDialog(false);
    resetEventForm();
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
      
      // 載入 client 用於讀取公開行事曆
      // 載入 auth2 用於後續新增活動時使用
      if (!window.gapi.client) {
        addDebugInfo("Loading client and auth2...");
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
      
      // 初始化客戶端 - 只需要 API key 來讀取公開行事曆
      // 初始化 auth 用於後續操作，但不強制要求登入
      addDebugInfo("Initializing gapi.client...");
      try {
        await window.gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
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

  // 新增：從數據庫獲取專案日期
  const fetchProjectDates = useCallback(async () => {
    setLoadingProjects(true);
    setProjectError(null);
    
    try {
      // 從數據庫獲取所有專案
      const { data: projects, error } = await supabase
        .from('project')
        .select(`
          project_id,
          project_name,
          start_date,
          end_date,
          payment_date,
          construction_status,
          billing_status,
          is_tracked,               
          track_remind_date,
          site_city,
          site_district,
          site_address,
          customer_database (
            customer_name
          )
        `)
        // .not('start_date', 'is', null);
        
      if (error) throw error;
      
      // 轉換為行事曆事件格式
      const constructionEvents = projects
        .filter(project => project.start_date)
        .map(project => {
          // 處理結束日期，確保結束日期當天也能顯示
          let endDate = project.end_date || project.start_date;
          // 將日期字符串轉換為日期對象
          if (typeof endDate === 'string') {
            const date = new Date(endDate);
            // 增加一天
            date.setDate(date.getDate() + 1);
            endDate = date.toISOString().split('T')[0];
          }
          
          return {
            id: `construction-${project.project_id}`,
            title: `施工: ${project.project_name}`,
            start: project.start_date,
            end: endDate,
            description: `客戶: ${project.customer_database?.customer_name || '未知'}\n狀態: ${project.construction_status}`,
            backgroundColor: '#f0f4ff', // 淡藍色
            borderColor: '#a0b4ff',
            textColor: '#333333',
            type: 'construction', // 自定義標記
            extendedProps: {
              projectId: project.project_id,
              projectName: project.project_name,
              customerName: project.customer_database?.customer_name || '未知',
              site_city: project.site_city || '',
              site_district: project.site_district || '',
              site_address: project.site_address || '',
              construction_status: project.construction_status || '',
              billing_status: project.billing_status || '',
              isProjectEvent: true
            }
          };
        });
        
      const paymentEvents = projects
        .filter(project => project.payment_date)
        .map(project => {
          // 收款日期處理 - 將結束日期設為隔天，確保當天也顯示
          let paymentDate = project.payment_date;
          if (typeof paymentDate === 'string') {
            const date = new Date(paymentDate);
            // 增加一天作為結束日期
            date.setDate(date.getDate() + 1);
            const endDate = date.toISOString().split('T')[0];
            
            return {
              id: `payment-${project.project_id}`,
              title: `請款: ${project.project_name}`,
              start: project.payment_date,
              end: endDate, // 使用隔天作為結束日期
              description: `客戶: ${project.customer_database?.customer_name || '未知'}\n狀態: ${project.billing_status}`,
              backgroundColor: '#f8f0ff', // 淡紫色
              borderColor: '#dbb6ff',
              textColor: '#333333',
              type: 'payment', // 自定義標記
              extendedProps: {
                projectId: project.project_id,
                projectName: project.project_name,
                customerName: project.customer_database?.customer_name || '未知',
                site_city: project.site_city || '',
                site_district: project.site_district || '',
                site_address: project.site_address || '',
                construction_status: project.construction_status || '',
                billing_status: project.billing_status || '',
                isProjectEvent: true
              }
            };
          }
        });

      // 新增追蹤事件
      const trackEvents = projects
        .filter(project => project.is_tracked && project.track_remind_date)
        .map(project => ({
          id: `track-${project.project_id}`,
          title: `追蹤: ${project.project_name}`,
          start: project.track_remind_date,
          end: project.track_remind_date,
          description: `客戶: ${project.customer_database?.customer_name || '未知'}`,
          backgroundColor: '#f5e6d3', // 淺咖啡色
          borderColor: '#bfa980',
          textColor: '#333333',
          type: 'track',
          extendedProps: {
            projectId: project.project_id,
            projectName: project.project_name,
            customerName: project.customer_database?.customer_name || '未知',
            site_city: project.site_city || '',
            site_district: project.site_district || '',
            site_address: project.site_address || '',
            construction_status: project.construction_status || '',
            billing_status: project.billing_status || '',
            isProjectEvent: true
          }
        }));
        console.log('trackEvents:', trackEvents); // ← 加這行

      setTrackEvents(trackEvents);
      setProjectEvents([...constructionEvents, ...paymentEvents, ...trackEvents]);
    } catch (error) {
      console.error("Error fetching project dates:", error);
      setProjectError(`無法獲取專案日期: ${error.message}`);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  // 更新合併事件的函數
  const getMergedEvents = useCallback(() => {
    // 根據選項篩選專案事件
    let filteredProjectEvents = [];
    
    if (showConstructionDates) {
      filteredProjectEvents = [...filteredProjectEvents, 
        ...projectEvents.filter(event => event.type === 'construction')];
    }
    
    if (showPaymentDates) {
      filteredProjectEvents = [...filteredProjectEvents, 
        ...projectEvents.filter(event => event.type === 'payment')];
    }
    
    if (showTrackDates) {
      filteredProjectEvents = [...filteredProjectEvents, ...trackEvents];
    }
    // 返回合併後的事件列表
    return [...events, ...filteredProjectEvents];
  }, [events, projectEvents, trackEvents, showConstructionDates, showPaymentDates, showTrackDates]);

  // 添加專案事件點擊處理
  const handleEventClick = useCallback((info) => {
    // 處理專案事件點擊
    if (info.event.extendedProps && info.event.extendedProps.isProjectEvent) {
      // 跳轉到相應的專案頁面
      window.location.href = `/order/${info.event.extendedProps.projectId}`;
      info.jsEvent.preventDefault();
    } 
    // 處理 Google Calendar 事件點擊
    else if (info.event.url) {
      // 將成功初始化的標誌設置為 ref，防止重複獲取
    }
  }, []);

  // 初始化時也獲取專案日期
  useEffect(() => {
    // 確保只在初始化後獲取一次專案數據
    if (gapiInitialized && !loadingProjects && !hasFetchedProjectsRef.current) {
      fetchProjectDates();
      hasFetchedProjectsRef.current = true;
    }
  }, [gapiInitialized, loadingProjects]);

  // 初始化組件
  useEffect(() => {
    // 只在組件首次加載時獲取一次數據
    if (!hasInitializedRef.current && !gapiInitialized && !gapiLoading && !error) {
      addDebugInfo("Auto-initializing GAPI");
      initializeGapi();
      hasInitializedRef.current = true;
    }
  }, [gapiInitialized, gapiLoading, error, initializeGapi]);

  // Main rendering logic
  if (!gapiInitialized && !gapiLoading && !error) {
    return (
      <Container maxWidth="lg" className="calendar-container">
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
      <Container maxWidth="lg" className="calendar-container">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" sx={{ mt: 2 }}>載入中...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !gapiInitialized) {
    return (
      <Container maxWidth="lg" className="calendar-container">
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
    <Container maxWidth="lg" className="calendar-container" sx={{ overflow: 'hidden' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {projectError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {projectError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenNewEventDialog}
            className="add-event-button"
            sx={{ mr: 2 }}
          >
            新增活動
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => {
              hasFetchedProjectsRef.current = false;
              fetchEvents();
              fetchProjectDates();
            }} 
            disabled={loading || !gapiInitialized}
            className="refresh-button"
          >
            重新整理行事曆
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={showConstructionDates} 
                onChange={(e) => setShowConstructionDates(e.target.checked)}
                color="primary"
              />
            }
            label="顯示施工日期"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={showPaymentDates} 
                onChange={(e) => setShowPaymentDates(e.target.checked)}
                color="primary"
              />
            }
            label="顯示收款日期"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={showTrackDates} 
                onChange={(e) => setShowTrackDates(e.target.checked)}
                color="primary"
              />
            }
            label="顯示追蹤提醒"
          />
        </Box>
      </Box>
      
      {(loading || loadingProjects) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Box 
          sx={{ 
            height: '630px', 
            mt: 2,
            overflow: 'hidden',
            position: 'relative',
            mb: 4 // 增加底部間距
          }} 
          className="modern-calendar-wrapper"
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={getMergedEvents()}
            locale={zhTWLocale}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventClick={(info) => {
              handleEventClick(info);
            }}
            height="100%"
            dayMaxEvents={3}
            eventDisplay="block"
            eventClassNames="calendar-event"
            eventContent={(eventInfo) => {
              // 自定義事件內容，只顯示標題
              return (
                <div className="fc-event-main-frame">
                  <div className="fc-event-title-container">
                    <div className="fc-event-title">{eventInfo.event.title}</div>
                  </div>
                </div>
              );
            }}
            eventDidMount={(info) => {
              // 為事件添加工具提示
              if (info.event.extendedProps && info.event.extendedProps.isProjectEvent) {
                const { projectName, customerName, site_city, site_district, site_address, construction_status, billing_status } = info.event.extendedProps;
                const tooltip = document.createElement('div');
                tooltip.className = 'project-tooltip';
                tooltip.innerHTML = `
                  <div style="padding: 8px; min-width:200px;">
                    <strong>專案名稱：</strong>${projectName || info.event.title}<br/>
                    <strong>客戶名稱：</strong>${customerName || ''}<br/>
                    <strong>施工地址：</strong>${(site_city || '') + (site_district || '') + (site_address || '')}<br/>
                    <strong>施工狀態：</strong>${construction_status || ''}<br/>
                    <strong>請款狀態：</strong>${billing_status || ''}
                  </div>
                `;
                document.body.appendChild(tooltip);
                
                // 保存工具提示引用，便於後續清理
                info.el.tooltip = tooltip;
                
                info.el.addEventListener('mouseover', function() {
                  const rect = info.el.getBoundingClientRect();
                  tooltip.style.position = 'absolute';
                  tooltip.style.left = `${rect.left + window.scrollX}px`;
                  tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
                  tooltip.style.display = 'block';
                  tooltip.style.backgroundColor = 'white';
                  tooltip.style.border = '1px solid #ddd';
                  tooltip.style.borderRadius = '4px';
                  tooltip.style.zIndex = 1000;
                  tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                });
                
                info.el.addEventListener('mouseout', function() {
                  tooltip.style.display = 'none';
                });
                
                info.el.addEventListener('mousemove', function(e) {
                  // 防止工具提示遮蓋滑鼠指針
                  tooltip.style.left = `${e.pageX + 10}px`;
                  tooltip.style.top = `${e.pageY + 10}px`;
                });
              }
            }}
            eventWillUnmount={(info) => {
              // 清理工具提示元素，避免 DOM 中累積無用元素
              if (info.el && info.el.tooltip) {
                document.body.removeChild(info.el.tooltip);
                delete info.el.tooltip;
              }
            }}
          />
        </Box>
      )}

      {/* 新增活動對話框 */}
      <Dialog 
        open={openNewEventDialog} 
        onClose={handleCloseNewEventDialog}
        maxWidth="sm"
        fullWidth
        className="event-dialog"
      >
        <DialogTitle>新增活動</DialogTitle>
        <DialogContent>
          {addEventSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              活動已成功新增！
            </Alert>
          )}
          
          {addEventError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addEventError}
            </Alert>
          )}
          
          {needsAuth && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              需要 Google 授權才能新增活動
              <Button 
                color="inherit"
                size="small"
                onClick={handleGoogleSignIn}
                sx={{ ml: 2 }}
              >
                授權 Google 日曆
              </Button>
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="event-title"
            label="活動標題"
            type="text"
            fullWidth
            variant="outlined"
            value={newEvent.title}
            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            error={eventErrors.title}
            helperText={eventErrors.title ? "請輸入活動標題" : ""}
            sx={{ mb: 2 }}
            required
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
              <DateTimePicker
                label="開始時間"
                value={newEvent.start}
                onChange={(date) => setNewEvent({...newEvent, start: date})}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true,
                    required: true,
                    error: eventErrors.start,
                    helperText: eventErrors.start ? "請選擇有效的開始時間" : ""
                  }
                }}
              />
              
              <DateTimePicker
                label="結束時間"
                value={newEvent.end}
                onChange={(date) => setNewEvent({...newEvent, end: date})}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true,
                    required: true,
                    error: eventErrors.end,
                    helperText: eventErrors.end ? "結束時間必須晚於開始時間" : ""
                  }
                }}
              />
            </Box>
          </LocalizationProvider>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="event-type-label">活動類型</InputLabel>
            <Select
              labelId="event-type-label"
              id="event-type"
              value={newEvent.type}
              onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
              label="活動類型"
            >
              <MenuItem value="default">一般活動</MenuItem>
              <MenuItem value="design">設計</MenuItem>
              <MenuItem value="testing">測試</MenuItem>
              <MenuItem value="marketing">營銷/銷售</MenuItem>
              <MenuItem value="programming">程式開發</MenuItem>
              <MenuItem value="meeting">會議/討論</MenuItem>
              <MenuItem value="research">研究/分析</MenuItem>
              <MenuItem value="training">培訓/教育</MenuItem>
              <MenuItem value="customer">客戶/拜訪</MenuItem>
              <MenuItem value="planning">計劃/規劃</MenuItem>
            </Select>
            <FormHelperText>選擇活動類型以套用不同顏色</FormHelperText>
          </FormControl>
          
          <TextField
            margin="dense"
            id="event-description"
            label="活動描述"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={newEvent.description}
            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewEventDialog} color="inherit">
            取消
          </Button>
          <Button 
            onClick={addEventToCalendar} 
            color="primary" 
            variant="contained"
            disabled={addingEvent}
          >
            {addingEvent ? "新增中..." : "新增活動"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 隱藏可能誤顯示的專案詳細資訊 */}
      <div style={{ height: 0, overflow: 'hidden', visibility: 'hidden' }}>
        {/* 此處可能放置了專案詳細資訊的渲染 */}
      </div>
    </Container>
  );
};

export default ApiCalendar;