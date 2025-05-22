import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Divider, 
  Button, 
  Paper, 
  CircularProgress,
  useTheme,
  Avatar,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import zhTW from 'date-fns/locale/zh-TW';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import MoneyIcon from '@mui/icons-material/Money';

// 自定義樣式元件
const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  borderRadius: 16,
  marginBottom: 24,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
  }
}));

const DateCard = styled(Card)(({ theme, istoday }) => ({
  height: '100%',
  borderRadius: 12,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: istoday === 'true' ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxShadow: istoday === 'true' 
    ? `0 8px 24px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, 
       ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, 
       ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.25)` 
    : '0 2px 12px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
  }
}));

const DateHeader = styled(Box)(({ theme, istoday }) => ({
  padding: '12px 16px',
  background: istoday === 'true' ? theme.palette.primary.main : theme.palette.secondary.main,
  color: '#fff',
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
}));

const EventItem = styled(Box)(({ theme, type }) => {
  let color, borderColor;
  
  // 根據活動類型設定不同顏色
  switch(type) {
    case 'construction':
      color = '#e8f5e9'; // 施工 - 淡綠色
      borderColor = '#81c784'; // 深綠色邊框
      break;
    case 'payment':
      color = '#fff8e1'; // 收款 - 淡黃色
      borderColor = '#ffd54f'; // 深黃色邊框
      break;
    case 'meeting':
      color = '#ffebee'; // 會議 - 淡紅色
      borderColor = '#e57373'; // 深紅色邊框
      break;
    default:
      color = '#e3f2fd'; // 預設 - 淡藍色
      borderColor = '#64b5f6'; // 深藍色邊框
  }
  
  return {
    backgroundColor: color,
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 8,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    borderLeft: `4px solid ${borderColor}`,
    '&:last-child': {
      marginBottom: 0
    },
    '& .event-title': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%'
    },
    '& .event-location': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%'
    }
  };
});

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  height: '100%',
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  }
}));

const IconAvatar = styled(Avatar)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor || theme.palette.secondary.main,
  width: 40,
  height: 40
}));

const formatDateHeader = (date) => {
  return format(date, 'MM/dd EEE', { locale: zhTW });
};

const formatFullDate = (date) => {
  return format(date, 'yyyy年MM月dd日', { locale: zhTW });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '早安';
  if (hour < 18) return '午安';
  return '晚安';
};

// Fallback credentials if environment variables don't work
const FALLBACK_API_KEY = "AIzaSyD_nRTQtxTTNLW19U4T0zdTohWT0BPiKzI";
const FALLBACK_CLIENT_ID = "516194420420-7oatcqmd1kc9h37nk4m2pe08aqfmd180.apps.googleusercontent.com";

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, googleAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [projectEvents, setProjectEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    todayEvents: 0
  });
  const [error, setError] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [gapiInitialized, setGapiInitialized] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showConstructionDates, setShowConstructionDates] = useState(true);
  const [showPaymentDates, setShowPaymentDates] = useState(true);
  const [showTrackDates, setShowTrackDates] = useState(true);
  
  const today = new Date();
  
  // 計算今天前後三天的日期
  const dateRange = [
    subDays(today, 2),
    subDays(today, 1),
    today,
    addDays(today, 1),
    addDays(today, 2)
  ];
  
  // 使用特定公開行事曆ID，與 ApiCalendar 一致
  const calendarId = "jongshingpest@gmail.com";
  
  // 記錄調試信息
  const addDebugInfo = (message) => {
    console.log(`[HomePage] ${message}`);
  };
  
  // 初始化 Google API
  useEffect(() => {
    const initGoogleAPI = async () => {
      if (!window.gapi) {
        addDebugInfo("Google API not available");
        return;
      }
      
      if (!window.gapi.client) {
        addDebugInfo("Loading Google API client");
        await new Promise((resolve) => {
          window.gapi.load('client', resolve);
        });
      }
      
      try {
        addDebugInfo("Initializing Google API client");
        await window.gapi.client.init({
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY || FALLBACK_API_KEY,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });
        
        setGapiInitialized(true);
        addDebugInfo("Google API client initialized");
      } catch (error) {
        addDebugInfo(`Error initializing Google API client: ${error.message}`);
        setError(`無法初始化 Google 日曆：${error.message}`);
      }
    };
    
    initGoogleAPI();
  }, []);
  
  // 從 Supabase 獲取項目數據和 Google Calendar 獲取事件
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 獲取工程項目
        const { data: projectData, error: projectError } = await supabase
          .from('project')
          .select('*, customer_database(customer_name)')
          .order('created_at', { ascending: false });
          
        if (projectError) throw projectError;
        setProjects(projectData || []);
        
        // 正確計算待處理工程數
        // 計算所有狀態為待處理、進行中、未完成等的工程數量
        const pendingProjects = projectData?.filter(project => {
          // 檢查建設狀態值，包含多種可能的"未完成"狀態
          const constructionStatus = (project.construction_status || '').toLowerCase();
          const billingStatus = (project.billing_status || '').toLowerCase();
          
          // 只有當施工狀態為"已完成"且請款狀態為"已請款"或"已收款"時，工程才算完成
          return !(
            (constructionStatus === '已完成' || constructionStatus === 'completed') && 
            (billingStatus === '已請款' || billingStatus === '已收款' || 
             billingStatus === 'billed' || billingStatus === 'paid')
          );
        }).length || 0;
        
        // 設定基本統計資料
        setStats(prev => ({
          ...prev,
          totalProjects: projectData?.length || 0,
          pendingProjects: pendingProjects
        }));
        
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // 從 Google Calendar 獲取事件（與 ApiCalendar 相同的方法）
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      if (!gapiInitialized) {
        return;
      }
      
      try {
        // 確保日曆 API 已載入
        if (!window.gapi.client.calendar) {
          addDebugInfo("Loading calendar API...");
          await window.gapi.client.load('calendar', 'v3');
          addDebugInfo("Calendar API loaded");
        }
        
        setLoading(true);
        setError(null);
        
        // 設定日期範圍（今天前後三天）
        const timeMin = subDays(new Date(), 3);
        const timeMax = addDays(new Date(), 3);
        
        // 請求事件
        addDebugInfo(`Requesting events for calendar: ${calendarId}`);
        const response = await window.gapi.client.calendar.events.list({
          calendarId: calendarId,
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 100,
          orderBy: "startTime",
        });
        
        // 格式化事件以適應 FullCalendar
        const formattedEvents = response.result.items.map(event => {
          // 根據事件類型或內容設定不同的顏色
          let type = 'default';
          const eventTitle = event.summary ? event.summary.toLowerCase() : '';
          
          if (eventTitle.includes('施工') || eventTitle.includes('工程')) {
            type = 'construction';
          } else if (eventTitle.includes('收款') || eventTitle.includes('付款')) {
            type = 'payment';
          } else if (eventTitle.includes('會議') || eventTitle.includes('討論')) {
            type = 'meeting';
          }
          
          return {
            id: event.id,
            title: event.summary || '(無標題)',
            start: parseISO(event.start.dateTime || event.start.date),
            end: parseISO(event.end.dateTime || event.end.date),
            location: event.location || '無地點資訊',
            description: event.description || '',
            type: type
          };
        });
        
        setCalendarEvents(formattedEvents);
        
        // 更新今日事件數量
        const todayEvents = formattedEvents.filter(event => 
          isSameDay(event.start, new Date())
        ).length;
        
        setStats(prev => ({
          ...prev,
          todayEvents: todayEvents
        }));
        
        addDebugInfo(`Fetched ${formattedEvents.length} events`);
        
      } catch (err) {
        addDebugInfo(`Error fetching calendar events: ${err.message}`);
        setError(`無法獲取日曆事件：${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (gapiInitialized) {
      fetchCalendarEvents();
    }
  }, [gapiInitialized]);
  
  // 從數據庫獲取專案日期 - 與 ApiCalendar 中的邏輯相同
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
            customer_name,
            customer_id
          )
        `);
        
      if (error) throw error;
      
      const trackEvents = projects
        .filter(project => project.is_tracked && project.track_remind_date)
        .map(project => ({
          id: `track-${project.project_id}`,
          title: `追蹤：${project.project_name}`,
          start: project.track_remind_date,
          end: project.track_remind_date,
          description: `請追蹤客戶：${project.customer_database?.customer_name || ''}\n專案地址：${project.site_city || ''}${project.site_district || ''}${project.site_address || ''}`,
          backgroundColor: '#ffe082', // 你可以自訂顏色
          borderColor: '#ffb300',
          textColor: '#333333',
          type: 'track',
          extendedProps: {
            projectId: project.project_id,
            isProjectEvent: true
          }
        }));
      // 將追蹤事件添加到專案事件中 
      // 轉換為行事曆事件格式
      const constructionEvents = projects
        .filter(project => project.start_date)
        .map(project => {
          // 處理日期
          // 確保開始日期是 Date 物件
          const startDate = parseISO(project.start_date);
          
          // 處理結束日期 - 如果沒有結束日期，使用開始日期
          let endDate;
          if (project.end_date) {
            endDate = parseISO(project.end_date);
            // 將結束日期設為該天的結束時間 (23:59:59)
            endDate.setHours(23, 59, 59, 999);
          } else {
            // 如果沒有提供結束日期，使用開始日期的結束時間
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
          }
          
          // 簡化標題，移除"施工:"前綴
          return {
            id: `construction-${project.project_id}`,
            title: project.project_name, // 移除"施工:"前綴
            start: startDate,
            end: endDate,
            description: project.customer_database?.customer_name || '未知客戶', // 簡化描述
            type: 'construction',
            projectId: project.project_id
          };
        });
        
      const paymentEvents = projects
        .filter(project => project.payment_date)
        .map(project => {
          // 處理收款日期
          const paymentDate = parseISO(project.payment_date);
          
          // 設定為一整天的事件
          const paymentEndDate = new Date(paymentDate);
          paymentEndDate.setHours(23, 59, 59, 999);
          
          // 簡化標題，移除"收款:"前綴
          return {
            id: `payment-${project.project_id}`,
            title: project.project_name, // 移除"收款:"前綴
            start: paymentDate,
            end: paymentEndDate,
            description: project.customer_database?.customer_name || '未知客戶', // 簡化描述
            type: 'payment',
            projectId: project.project_id
          };
        });
      
      // 設置專案事件
      setProjectEvents([...constructionEvents, ...paymentEvents, ...trackEvents]);
      
      // 更新統計資料 - 今日事件數量
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // 篩選出今天需要進行施工的專案（根據施工日期或施工狀態）
      const todayConstructionProjects = projects.filter(project => {
        // 如果有施工日期且是今天
        if (project.start_date) {
          const startDate = parseISO(project.start_date);
          startDate.setHours(0, 0, 0, 0);
          
          let endDate;
          if (project.end_date) {
            endDate = parseISO(project.end_date);
            endDate.setHours(23, 59, 59, 999);
          } else {
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
          }
          
          if (today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime()) {
            return true;
          }
        }
        
        // 檢查施工狀態是否為進行中
        const constructionStatus = (project.construction_status || '').toLowerCase();
        if (constructionStatus === '進行中' || constructionStatus === 'in progress') {
          return true;
        }
        
        return false;
      });
      
      // 篩選出今天需要進行請款的專案
      const todayPaymentProjects = projects.filter(project => {
        // 如果有請款日期且是今天
        if (project.payment_date) {
          const paymentDate = parseISO(project.payment_date);
          paymentDate.setHours(0, 0, 0, 0);
          
          if (paymentDate.getTime() === today.getTime()) {
            return true;
          }
        }
        
        // 檢查請款狀態是否為待收款
        const billingStatus = (project.billing_status || '').toLowerCase();
        if (billingStatus === '已請款' && billingStatus !== '已收款') {
          return true;
        }
        
        return false;
      });
      
      // 將今日需要處理的專案轉換為事件
      const todayConstructionProjectEvents = todayConstructionProjects.filter(project => 
        !constructionEvents.some(event => event.projectId === project.project_id)).length;
      
      const todayPaymentProjectEvents = todayPaymentProjects.filter(project => 
        !paymentEvents.some(event => event.projectId === project.project_id)).length;
      
      // 計算今天的施工事件 - 檢查今天是否在施工日期範圍內
      const todayConstructionEvents = constructionEvents.filter(event => {
        const eventStart = new Date(event.start);
        eventStart.setHours(0, 0, 0, 0);
        
        const eventEnd = new Date(event.end);
        eventEnd.setHours(23, 59, 59, 999);
        
        return (today.getTime() >= eventStart.getTime() && today.getTime() <= eventEnd.getTime());
      }).length;
      
      // 計算今天的收款事件
      const todayPaymentEvents = paymentEvents.filter(event => {
        const eventDate = new Date(event.start);
        eventDate.setHours(0, 0, 0, 0);
        
        return eventDate.getTime() === today.getTime();
      }).length;
      
      // 計算今天的追蹤事件
      const todayTrackEvents = trackEvents.filter(event => {
        const eventDate = new Date(event.start);
        eventDate.setHours(0, 0, 0, 0);
        
        return eventDate.getTime() === today.getTime();
      }).length;
      
      // 獲取現有的 Google Calendar 事件數量
      const existingGoogleEvents = stats.todayEvents || 0;
      
      // 今日行程總數 = Google日曆事件 + 施工事件 + 收款事件 + 追蹤事件 + 今日施工專案 + 今日請款專案
      const totalTodayEvents = existingGoogleEvents + todayConstructionEvents + todayPaymentEvents + 
                               todayTrackEvents + todayConstructionProjectEvents + todayPaymentProjectEvents;
      
      setStats(prev => ({
        ...prev,
        todayEvents: totalTodayEvents
      }));
      
    } catch (error) {
      console.error("Error fetching project dates:", error);
      setProjectError(`無法獲取專案日期: ${error.message}`);
    } finally {
      setLoadingProjects(false);
    }
  }, []);
  
  // 獲取所有事件（包括 Google Calendar 事件和專案事件）
  const getAllEvents = useCallback(() => {
    // 根據選項篩選專案事件
    let filteredProjectEvents = [];
    
    if (showTrackDates) {
      filteredProjectEvents = [...filteredProjectEvents, 
        ...projectEvents.filter(event => event.type === 'track')];
    }

    if (showConstructionDates) {
      filteredProjectEvents = [...filteredProjectEvents, 
        ...projectEvents.filter(event => event.type === 'construction')];
    }
    
    if (showPaymentDates) {
      filteredProjectEvents = [...filteredProjectEvents, 
        ...projectEvents.filter(event => event.type === 'payment')];
    }
    
    // 合併所有事件
    return [...calendarEvents, ...filteredProjectEvents];
  }, [calendarEvents, projectEvents, showTrackDates, showConstructionDates, showPaymentDates]);
  
  // 在初始化完成後獲取專案日期
  useEffect(() => {
    fetchProjectDates();
  }, [fetchProjectDates]);
  
  // 根據日期過濾事件
  const getEventsForDate = (date) => {
    // 設定選定日期的開始和結束（當天的0點和23:59:59）
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return getAllEvents().filter(event => {
      // 處理單日事件（沒有結束日期）
      if (!event.end) {
        const eventDate = new Date(event.start);
        return isSameDay(eventDate, date);
      }
      
      // 確保事件開始和結束日期是 Date 物件
      const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
      const eventEnd = event.end instanceof Date ? event.end : new Date(event.end);
      
      // 重置事件日期的時間部分，只比較日期
      const eventStartDay = new Date(eventStart);
      eventStartDay.setHours(0, 0, 0, 0);
      
      const eventEndDay = new Date(eventEnd);
      eventEndDay.setHours(23, 59, 59, 999);
      
      // 檢查給定日期是否在開始日期和結束日期之間（包含開始和結束日期）
      return (
        // 日期在事件的開始和結束之間
        (startOfDay.getTime() >= eventStartDay.getTime() && startOfDay.getTime() <= eventEndDay.getTime()) ||
        (endOfDay.getTime() >= eventStartDay.getTime() && endOfDay.getTime() <= eventEndDay.getTime()) ||
        // 或者事件時間範圍在當天之內
        (eventStartDay.getTime() >= startOfDay.getTime() && eventStartDay.getTime() <= endOfDay.getTime()) ||
        (eventEndDay.getTime() >= startOfDay.getTime() && eventEndDay.getTime() <= endOfDay.getTime())
      );
    });
  };
  
  // 判斷是否為今天
  const isToday = (date) => {
    return isSameDay(date, today);
  };
  
  // 處理事件點擊
  const handleEventClick = (event) => {
    if (event.projectId) {
      navigate(`/order/${event.projectId}`);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {loading || loadingProjects ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* 歡迎卡片 */}
          <WelcomeCard>
            <CardContent sx={{ py: 4, px: 4 }}>
              <Typography variant="h4" color="white" gutterBottom fontWeight="600">
                {getGreeting()}，{user?.email?.split('@')[0] || '用戶'}
              </Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9, mb: 3 }}>
                今天是 {formatFullDate(today)}，祝您有個美好的一天！
              </Typography>
              <Button 
                variant="contained" 
                color="inherit"
                size="large"
                startIcon={<PlayArrowIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.dark',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
                onClick={() => navigate('/customers')}
              >
                開始今天的工作
              </Button>
            </CardContent>
          </WelcomeCard>
          
          {/* 錯誤提示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {projectError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {projectError}
            </Alert>
          )}
          
          {/* 統計概覽 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconAvatar bgcolor="#fdb2b0">
                    <AssignmentIcon />
                  </IconAvatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      總工程數量
                    </Typography>
                    <Typography variant="h4" fontWeight="600">
                      {stats.totalProjects}
                    </Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconAvatar bgcolor="#b9d6d7">
                    <CalendarTodayIcon />
                  </IconAvatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      今日行程
                    </Typography>
                    <Typography variant="h4" fontWeight="600">
                      {stats.todayEvents}
                    </Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconAvatar bgcolor="#a55f54">
                    <LocationOnIcon />
                  </IconAvatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      待處理工程
                    </Typography>
                    <Typography variant="h4" fontWeight="600">
                      {stats.pendingProjects}
                    </Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>
          
          {/* 顯示控制 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showConstructionDates} 
                  onChange={(e) => setShowConstructionDates(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BuildIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                  <Typography variant="body2">顯示施工日期</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showPaymentDates} 
                  onChange={(e) => setShowPaymentDates(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                  <Typography variant="body2">顯示收款日期</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showTrackDates} 
                  onChange={(e) => setShowTrackDates(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                  <Typography variant="body2">顯示追蹤提醒</Typography>
                </Box>
              }
            />
          </Box>
          
          {/* 行事曆區域 */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            行程提醒
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', mb: 2 }}>
            {dateRange.map((date, index) => (
              <Box key={index} sx={{ width: '20%', pl: index > 0 ? 1 : 0, pr: index < dateRange.length - 1 ? 1 : 0 }}>
                <DateCard istoday={isToday(date).toString()}>
                  <DateHeader istoday={isToday(date).toString()}>
                    <Typography variant="subtitle1" fontWeight="600">
                      {formatDateHeader(date)}
                      {isToday(date) && (
                        <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', fontWeight: 'normal' }}>
                          (今日)
                        </Box>
                      )}
                    </Typography>
                  </DateHeader>
                  <CardContent sx={{ p: 1.5, minHeight: '120px' }}>
                    {getEventsForDate(date).length > 0 ? (
                      getEventsForDate(date).map((event, idx) => (
                        <EventItem 
                          key={idx} 
                          type={event.type}
                          onClick={() => event.projectId && handleEventClick(event)}
                          sx={{ cursor: event.projectId ? 'pointer' : 'default' }}
                        >
                          {event.type === 'construction' && (
                            <BuildIcon fontSize="small" sx={{ mr: 1, fontSize: '16px', color: '#388e3c' }} />
                          )}
                          {event.type === 'payment' && (
                            <MoneyIcon fontSize="small" sx={{ mr: 1, fontSize: '16px', color: '#ffa000' }} />
                          )}
                          {event.type === 'meeting' && (
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, fontSize: '16px', color: '#d32f2f' }} />
                          )}
                          <Box sx={{ flex: 1, width: 'calc(100% - 24px)', overflow: 'hidden' }}>
                            <Typography variant="body2" fontWeight="500" className="event-title">
                              {event.title}
                            </Typography>
                            {(event.location || (event.description && event.description !== '無地點資訊')) && (
                              <Typography variant="caption" color="text.secondary" className="event-location">
                                {event.location || event.description}
                              </Typography>
                            )}
                          </Box>
                        </EventItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        沒有行程
                      </Typography>
                    )}
                  </CardContent>
                </DateCard>
              </Box>
            ))}
          </Box>
          
          {!gapiInitialized && !loading && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                請先在行事曆頁面完成 Google 日曆授權，以顯示完整行事曆內容
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 1 }}
                onClick={() => navigate('/apicalendar')}
              >
                前往授權
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default HomePage; 