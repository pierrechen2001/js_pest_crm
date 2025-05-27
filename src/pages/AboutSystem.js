import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Link,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Zoom,
  Slide,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email as EmailIcon,
  YouTube as YouTubeIcon,
  LocalCafe as LocalCafeIcon,
  Pets as PetsIcon,
  Code as CodeIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Check as CheckIcon,
  Star as StarIcon,
  Info as InfoIcon,
  FormatQuote as FormatQuoteIcon,
  Web as WebIcon,
  Storage as StorageIcon,
  Dns as DnsIcon,
  BugReport as BugReportIcon,
  CloudDone as CloudDoneIcon
} from '@mui/icons-material';

// 自定義樣式元件
const HeaderCard = styled(Card)(({ theme }) => ({
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

const ContentCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  height: '100%',
  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  marginBottom: 24
}));

const TechChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
  fontWeight: 500,
  boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
  '&:hover': {
    boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
  },
}));

const DeveloperAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  }
}));

const TechCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
  }
}));

const QuoteSlide = React.forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AboutSystem = () => {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [activeDeveloper, setActiveDeveloper] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const developers = [
    {
      name: '陳冠宇 Pierre',
      role: '全端開發',
      avatar: 'https://avatars.githubusercontent.com/u/149866861?v=4',
      email: 'b12705058@g.ntu.edu.tw',
      github: 'https://github.com/pierrechen2001',
      quote: '🅿️ 喜歡寫出一個可以改變什麼的程式，但不是喜歡打字。'
    },
    {
      name: '汪芷瑩',
      role: '前端開發',
      avatar: 'https://avatars.githubusercontent.com/u/23456789',
      email: 'b12705031@g.ntu.edu.tw',
      github: 'https://github.com/Angelicac-Wang',
      quote: '優秀的用戶界面應該是直觀且能讓用戶感到愉悅的。'
    },
    {
      name: '丁崇耘',
      role: '後端開發',
      avatar: 'https://github.com/account',
      email: 'hua@ntu.edu.tw',
      github: 'https://github.com/dinosaur1020',
      quote: '穩定、高效的後端系統是任何成功產品的基石。'
    },
    {
      name: '劉軒羽',
      role: '全端開發',
      avatar: 'https://avatars.githubusercontent.com/u/130119566?s=400&u=a81b67275d7dc6797d9db710f6c5a4e98aee3d66&v=4',
      email: 'b12705019@ntu.im',
      github: 'https://github.com/ryukyucoding',
      quote: '想找到自己喜歡做的事情，並且能夠持續做下去。'
    },
    {
      name: '蔡政穎',
      role: '前端開發',
      avatar: 'https://avatars.githubusercontent.com/u/99543007?v=4',
      email: 'a0909726919@gmail.com',
      github: 'https://github.com/stonk0105',
      quote: '嗨。'
    },
    {
      name: '徐郁翔',
      role: '前端開發',
      avatar: 'https://avatars.githubusercontent.com/u/160754763?v=4',
      email: 'dascupt@gmail.com',
      github: 'https://github.com/Diteaphr',
      quote: 'Out of the black, into the blue'
    },
  ];

  const frontendStack = [
    { name: 'React', version: '18.2.0', description: '前端框架', icon: <WebIcon /> },
    { name: 'Material-UI', version: '5.14.0', description: 'UI 元件庫', icon: <WebIcon /> },
    { name: 'React Router', version: '6.14.0', description: '路由管理', icon: <WebIcon /> },
    { name: 'React Query', version: '4.29.5', description: '資料獲取與快取', icon: <WebIcon /> },
  ];

  const backendStack = [
    { name: 'Firebase', version: '10.1.0', description: '身份驗證與託管', icon: <StorageIcon /> },
    { name: 'Supabase', version: '2.33.1', description: '資料庫服務', icon: <StorageIcon /> },
    { name: 'NodeJS', version: '18.16.0', description: '伺服器環境', icon: <DnsIcon /> },
    { name: 'Express', version: '4.18.2', description: 'API 框架', icon: <DnsIcon /> },
  ];

  const servicesStack = [
    { name: 'GCP', version: '最新版', description: '雲端服務平台', icon: <CloudDoneIcon /> },
    { name: 'Google Calendar API', version: 'v3', description: '行事曆整合', icon: <CloudDoneIcon /> },
    { name: 'Maps API', version: '最新版', description: '地圖整合', icon: <CloudDoneIcon /> },
    { name: 'GitHub Actions', version: '最新版', description: 'CI/CD 流程', icon: <CloudDoneIcon /> },
  ];

  const easterEgg = {
    drink: '烤糖蕎麥凍奶青',
    animal: '山雀',
  };

  const handleDeveloperClick = (developer) => {
    setActiveDeveloper(developer);
    setQuoteDialogOpen(true);
  };

  const handleCloseQuoteDialog = () => {
    setQuoteDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getTabContent = () => {
    switch(tabValue) {
      case 0:
        return (
          <Grid container spacing={3}>
            {frontendStack.map((tech, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TechCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        mr: 2
                      }}
                    >
                      {tech.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {tech.name}
                      </Typography>
                      <Chip 
                        label={tech.version} 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tech.description}
                  </Typography>
                </TechCard>
              </Grid>
            ))}
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            {backendStack.map((tech, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TechCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.secondary.light,
                        color: theme.palette.secondary.contrastText,
                        mr: 2
                      }}
                    >
                      {tech.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {tech.name}
                      </Typography>
                      <Chip 
                        label={tech.version} 
                        size="small" 
                        color="secondary" 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tech.description}
                  </Typography>
                </TechCard>
              </Grid>
            ))}
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            {servicesStack.map((tech, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TechCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.info.light,
                        color: theme.palette.info.contrastText,
                        mr: 2
                      }}
                    >
                      {tech.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {tech.name}
                      </Typography>
                      <Chip 
                        label={tech.version} 
                        size="small" 
                        color="info" 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tech.description}
                  </Typography>
                </TechCard>
              </Grid>
            ))}
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 頁面標題卡片 */}
      <HeaderCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" color="white" fontWeight="bold">
            關於系統
          </Typography>
          <Typography variant="subtitle1" color="white" sx={{ opacity: 0.9, mt: 1 }}>
            JS-PEST CRM 系統資訊及開發團隊
          </Typography>
        </CardContent>
      </HeaderCard>

      {/* 開發者資訊 */}
      <ContentCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" fontWeight="medium">
              開發者資訊
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {developers.map((dev, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <DeveloperAvatar
                      src={dev.avatar}
                      alt={dev.name}
                      onClick={() => handleDeveloperClick(dev)}
                    />
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                      {dev.name}
                    </Typography>
                    <Chip 
                      label={dev.role} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                    國立臺灣大學 資訊管理學系
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                    <IconButton 
                      size="small" 
                      component="a" 
                      href={`mailto:${dev.email}`}
                      color="primary"
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      component="a" 
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="inherit"
                    >
                      <GitHubIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </ContentCard>

      {/* 聯繫方式 */}
      <ContentCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" fontWeight="medium">
              聯繫方式
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <EmailIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">信箱</Typography>
                  <Typography variant="body1">
                    <Link href="mailto:b12705058@g.ntu.edu.tw" underline="hover">
                      b12705058@g.ntu.edu.tw
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <GitHubIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">開源專案</Typography>
                  <Typography variant="body1">
                    <Link 
                      href="https://github.com/pierrechen2001/js_pest_crm" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      github.com/pierrechen2001/js_pest_crm
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </ContentCard>

      {/* 使用說明 */}
      <ContentCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <YouTubeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" fontWeight="medium">
              使用說明
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            <Box 
              component="iframe" 
              sx={{ 
                width: '100%', 
                maxWidth: 720, 
                height: 405, 
                border: 'none', 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
              }}
              src="https://www.youtube.com/embed/ViVosgnhEb" 
              title="系統使用說明" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </Box>
        </CardContent>
      </ContentCard>

      {/* 版本資訊 & 技術堆疊 */}
      <ContentCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" fontWeight="medium">
              版本資訊 & 技術堆疊
            </Typography>
          </Box>

          {/* 版本資訊卡片 */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf5 100%)',
              border: '1px solid #e0e6ed',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: 120, 
                height: 120, 
                background: '#f0f4f8',
                transform: 'rotate(45deg) translate(30px, -60px)',
                zIndex: 0,
                opacity: 0.7
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <StarIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                    JS-PEST CRM v1.0.0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    穩定版本 | 發佈日期：2023-12-15 | 最近更新：2023-12-20
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip icon={<CheckIcon />} label="安全性更新" size="small" color="success" />
                <Chip icon={<CheckIcon />} label="效能優化" size="small" color="success" />
                <Chip icon={<CheckIcon />} label="界面精簡" size="small" color="success" />
                <Chip icon={<BugReportIcon />} label="錯誤修復" size="small" color="secondary" />
              </Box>
            </Box>
          </Paper>
          
          {/* 技術堆疊分頁 */}
          <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="技術堆疊分頁"
            >
              <Tab icon={<WebIcon />} iconPosition="start" label="前端技術" />
              <Tab icon={<DnsIcon />} iconPosition="start" label="後端技術" />
              <Tab icon={<CloudDoneIcon />} iconPosition="start" label="服務與整合" />
            </Tabs>
          </Box>
          
          <Box sx={{ py: 2 }}>
            {getTabContent()}
          </Box>

          <Box sx={{ 
            mt: 4, 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2, 
            bgcolor: '#f8f8f8', 
            borderRadius: 3,
            border: '1px solid #eee'
          }}>
            <GitHubIcon color="action" fontSize="large" />
            <Box>
              <Typography variant="h6" fontWeight="medium">
                開源專案
              </Typography>
              <Typography variant="body2" color="text.secondary">
                本專案採用 MIT 授權條款，歡迎貢獻與改進
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </ContentCard>

      {/* 隱藏小彩蛋 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title="點擊查看彩蛋">
          <IconButton
            onClick={() => setShowEasterEgg(!showEasterEgg)}
            sx={{ 
              color: 'primary.main',
              bgcolor: 'background.paper', 
              boxShadow: 3,
              '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.05)' },
              transition: 'transform 0.2s'
            }}
          >
            <LocalCafeIcon />
          </IconButton>
        </Tooltip>
        {showEasterEgg && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              position: 'absolute',
              bottom: '100%',
              right: 0,
              mb: 1,
              minWidth: 250,
              borderRadius: 4,
              animation: 'fadeIn 0.3s ease-in-out',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              恭喜你發現我的小秘密
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <LocalCafeIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  最愛的飲料
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {easterEgg.drink}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <PetsIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  最愛的動物
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {easterEgg.animal}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* 開發者名言對話框 */}
      <Dialog
        open={quoteDialogOpen}
        TransitionComponent={QuoteSlide}
        onClose={handleCloseQuoteDialog}
        maxWidth="sm"
        fullWidth
      >
        {activeDeveloper && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={activeDeveloper.avatar} 
                  alt={activeDeveloper.name}
                  sx={{ width: 50, height: 50 }}
                />
                <Box>
                  <Typography variant="h6">{activeDeveloper.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeDeveloper.role}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ 
                display: 'flex', 
                p: 3, 
                bgcolor: '#f5f5f5', 
                borderRadius: 2,
                position: 'relative'
              }}>
                <FormatQuoteIcon 
                  sx={{ 
                    fontSize: 40, 
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    color: 'primary.main',
                    opacity: 0.2
                  }} 
                />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: 16, 
                    pl: 4,
                    pt: 1
                  }}
                >
                  {activeDeveloper.quote}
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AboutSystem; 