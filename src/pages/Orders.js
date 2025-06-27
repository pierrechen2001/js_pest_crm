import React, { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { 
  Box, 
  Paper, 
  Button, 
  TextField, 
  Select, 
  FormControl, 
  InputLabel, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TableSortLabel, 
  Checkbox, 
  ListItemText, 
  Typography, 
  Menu, 
  MenuItem, 
  IconButton, 
  TablePagination, 
  TableContainer,
  Chip
} from "@mui/material";
import { Add } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';
import { getStatusStyle, constructionStatusOptions, billingStatusOptions } from '../utils/statusStyles';

export default function Orders({ projects: initialProjects = [], customers: initialCustomers = [] }) {
  const navigate = useNavigate();
  // Use props for initial state, allow internal updates if needed for local operations like adding a new project optimistically
  const [projects, setProjects] = useState(initialProjects);
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(true); // Loading is now handled by App.js
  const [error, setError] = useState(null); // Error is now handled by App.js
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProject, setMenuProject] = useState(null);
  const [menuType, setMenuType] = useState('');

  const handleOpenStatusMenu = (event, project, type) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
    setMenuType(type);
  };

  const handleCloseStatusMenu = () => {
    setAnchorEl(null);
    setMenuProject(null);
    setMenuType('');
  };

  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [trackProject, setTrackProject] = useState(null);
  const [trackType, setTrackType] = useState(""); // "construction" or "billing"

  const updateStatus = async (value) => {
    if (!menuProject) return;
    const field = menuType === 'construction' ? 'construction_status' : 'billing_status';
    const { data, error } = await supabase
      .from('project')
      .update({ [field]: value })
      .eq('project_id', menuProject.project_id)
      .select();
    if (error) {
      console.error('Error updating status:', error);
        return;
    }
    setProjects(prev => prev.map(p => p.project_id === data[0].project_id ? { ...p, [field]: value } : p));
    handleCloseStatusMenu();

    // 取得另一個欄位的狀態
    const otherStatus =
      field === 'construction_status'
        ? menuProject.billing_status
        : menuProject.construction_status;

    // 判斷兩個欄位都已達指定狀態
    if (
      (field === 'construction_status' && value === '已完成' && otherStatus === '已結清') ||
      (field === 'billing_status' && value === '已結清' && otherStatus === '已完成')
    ) {
      // 先查詢該專案是否已設置追蹤
      const { data: projectDetail, error: detailError } = await supabase
        .from('project')
        .select('is_tracked, track_remind_date')
        .eq('project_id', menuProject.project_id)
        .single();

      if (detailError) {
        console.error('Error fetching project detail:', detailError);
        return;
      }

      // 如果已設置追蹤，不再提醒
      if (projectDetail?.is_tracked && projectDetail?.track_remind_date) {
        // 已設置追蹤，不彈 Dialog
        return;
      }

      // 尚未設置追蹤，才彈 Dialog
      setTrackProject(menuProject);
      setTrackType(field);
      setTrackDialogOpen(true);
    }
  };

// 狀態和請款篩選相關的狀態變數
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [billingAnchorEl, setBillingAnchorEl] = useState(null);
  const [sortField, setSortField] = useState("created_at"); // 預設用建立時間排序
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const filterOptions = ["專案名稱", "客戶名稱", "施工地址"];

  console.log("原始專案資料：", projects);
  const normalizePhone = (str) => (str || "").replace(/\D/g, "");

// ... (filteredProjects logic remains largely the same, but uses the 'projects' state derived from props)
const filteredProjects = (projects || [])
.filter((project) => {
  // 搜索邏輯
  if (searchQuery.trim() !== "") {
    const searchLower = searchQuery.toLowerCase();

    if (selectedFilters.length === 0) {
      const normalizeText = (str) => (str || "").toLowerCase();
      const normalizePhone = (str) => (str || "").replace(/\D/g, "");
      const queryText = searchQuery.toLowerCase();
      const queryPhone = normalizePhone(searchQuery);

      return (
        project.project_name?.toLowerCase().includes(queryText) ||
        project.customer_database?.customer_name?.toLowerCase().includes(queryText) ||
        ((project.site_city || "") + (project.site_district || "") + (project.site_address || ""))
          .toLowerCase()
          .includes(queryText) ||
        normalizePhone(project.contact1_contact).includes(queryPhone) ||
        normalizePhone(project.contact2_contact).includes(queryPhone) ||
        normalizePhone(project.contact3_contact).includes(queryPhone)
      );
    }



    const matchesAnyField = selectedFilters.some((filter) => {
      switch (filter) {
        case "專案名稱":
          return project.project_name?.toLowerCase().includes(searchLower);
        case "客戶名稱":
          return project.customer_database?.customer_name?.toLowerCase().includes(searchLower);
        case "施工地址":
          return `${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`
            .toLowerCase()
            .includes(searchLower);

        default:
          return false;
      }
    });
    console.log(project.contacts)
    if (!matchesAnyField) return false;
  }

  return true;
})
.sort((a, b) => {
  let aValue, bValue;
  if (sortField === "quote_date") {
    aValue = a.quote_date || "";
    bValue = b.quote_date || "";
  } else {
    aValue = a.created_at || "";
    bValue = b.created_at || "";
  }
  if (sortOrder === "desc") {
    return new Date(bValue) - new Date(aValue);
  } else {
    return new Date(aValue) - new Date(bValue);
  }
})

// 先做狀態與請款篩選
const filteredAndStatusProjects = filteredProjects.filter((project) => {
  if (statusFilter && project.construction_status !== statusFilter) return false;
  if (billingFilter && project.billing_status !== billingFilter) return false;
  return true;
});
// 再做分頁
const paginatedProjects = filteredAndStatusProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Dialog 控制
  const [openDialog, setOpenDialog] = useState(false);

  // 處理專案保存成功後的回調
  const handleProjectSaved = (newProject) => {
    setProjects(prev => [...prev, newProject]);
  };

  // 處理狀態篩選
  const handleStatusFilterClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusFilterClose = (status = null) => {
    if (status !== null) {
      setStatusFilter(status);
    }
    setStatusAnchorEl(null);
  };

  // 處理請款篩選
  const handleBillingFilterClick = (event) => {
    setBillingAnchorEl(event.currentTarget);
  };

  const handleBillingFilterClose = (billing = null) => {
    if (billing !== null) {
      setBillingFilter(billing);
    }
    setBillingAnchorEl(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('project')
          .select(`
            *,
            customer_database (
              customer_id,
              customer_name
            )
          `)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        const { data: customersData, error: customersError } = await supabase
          .from('customer_database')
          .select('customer_id, customer_name');

        if (customersError) throw customersError;

        setProjects(projectsData || []);
        setCustomers(customersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update local state if props change (e.g., after global data re-fetches)
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  // Remove loading/error checks that are now in App.js
  // if (loading) return <CircularProgress />;
  // if (error) return <Typography color="error">{error}</Typography>;


  return (
    <div style={{ padding: 20 }}>
      {/* ... (Button, Search, Filter UI remains the same) ... */}
      <Box sx={{ position: 'relative', mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'primary.light', // or use "#935F4D"
          padding: 4,
          borderRadius: 3,
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
        }}
        >
        <Box sx={{ zIndex: 1, position: 'relative' }}>
          <Typography variant="h2" sx={{ color: 'primary.black', fontWeight: 'bold' , mb: 10}}>
            專案管理
          </Typography>
        <Button 
        variant="contained" 
        startIcon={<Add />} 
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: 10 }}
        >
          新增專案
        </Button>


        </Box>


        {/* 右側：插圖 */}
        <Box
          component="img"
          src="/order-page.svg"
          alt="客戶管理圖"
          sx={{
            height: 200,
            maxWidth: '100%',
          }}
        />


      </Paper>
      </Box>


      

      {/* 搜尋與篩選條件 */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: 20 }}>
        <TextField
          label="搜尋專案"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>篩選條件</InputLabel>
          <Select
            multiple
            value={selectedFilters}
            onChange={(e) => setSelectedFilters(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {filterOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={selectedFilters.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* 新增專案對話框 */}
      <ProjectForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleProjectSaved}
        customers={customers}
        preSelectedCustomer={null}
        showCustomerSearch={true}
        mode="create"
      />

      {/* MapComponent is no longer rendered here directly */}
      {/* 
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <Typography variant="h6" gutterBottom>
          專案地圖位置
        </Typography>
        <MapComponent projects={filteredProjects} />
      </div>
      */}

      {/* ... (Table remains the same) ... */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "7%" }}>編號</TableCell>
              <TableCell style={{ width: "15%" }}>專案名稱</TableCell>
              <TableCell style={{ width: "15%" }}>客戶名稱</TableCell>
              <TableCell style={{ width: "27%" }}>施工地址</TableCell>
              <TableCell style={{ width: "12%" }}>
              進場日期
                <TableSortLabel
                  active={sortField === "estimated_Entered_date"}
                  direction={sortField === "estimated_Entered_date" ? sortOrder : "desc"}
                  onClick={() => {
                    if (sortField === "estimated_Entered_date") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortField("estimated_Entered_date");
                      setSortOrder("asc"); // 預設第一次點為升冪
                    }
                  }}
                  // show both arrows
                  IconComponent={TableSortLabel.defaultProps?.IconComponent || undefined}
                />
              </TableCell>
              <TableCell style={{ width: "12%" }}>
                施工狀態
                <IconButton onClick={handleStatusFilterClick}>
                  <FilterListIcon />
                </IconButton>
                <Menu
                  anchorEl={statusAnchorEl}
                  open={Boolean(statusAnchorEl)}
                  onClose={() => handleStatusFilterClose()}
                >
                  <MenuItem onClick={() => handleStatusFilterClose("")}>全部</MenuItem>
                  {constructionStatusOptions.map((status) => (
                    <MenuItem key={status} onClick={() => handleStatusFilterClose(status)}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusStyle(status, 'construction').bg,
                          color: getStatusStyle(status, 'construction').color,
                          fontWeight: 500,
                        }}
                      >
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>
              <TableCell style={{ width: "12%" }}>
                請款狀態
                <IconButton onClick={handleBillingFilterClick}>
                  <FilterListIcon />
                </IconButton>
                <Menu
                  anchorEl={billingAnchorEl}
                  open={Boolean(billingAnchorEl)}
                  onClose={() => handleBillingFilterClose()}
                >
                  <MenuItem onClick={() => handleBillingFilterClose("")}>全部</MenuItem>
                  {billingStatusOptions.map((status) => (
                    <MenuItem key={status} onClick={() => handleBillingFilterClose(status)}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusStyle(status, 'billing').bg,
                          color: getStatusStyle(status, 'billing').color,
                          fontWeight: 500,
                        }}
                      >
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedProjects.map((project, index) => (
              <TableRow 
                key={project.project_id}
                hover
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/order/${project.project_id}`)}
              >
                <TableCell style={{ width: "7%" }}>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell style={{ width: "15%" }}>{project.project_name}</TableCell>
                <TableCell style={{ width: "15%" }}>{project.customer_database?.customer_name}</TableCell>
                <TableCell style={{ width: "27%" }}>{`${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`}</TableCell>
                <TableCell style={{ width: "12%" }}>{project.quote_date}</TableCell>
                <TableCell style={{ width: "12%" }}>
                  <Box
                    onClick={(e) => handleOpenStatusMenu(e, project, 'construction')}
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: getStatusStyle(project.construction_status, 'construction').bg,
                      color: getStatusStyle(project.construction_status, 'construction').color,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {project.construction_status}
                  </Box>
                </TableCell>

                <TableCell style={{ width: "12%" }}>
                  <Box
                    onClick={(e) => handleOpenStatusMenu(e, project, 'billing')}
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: getStatusStyle(project.billing_status, 'billing').bg,
                      color: getStatusStyle(project.billing_status, 'billing').color,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {project.billing_status}
                  </Box>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredAndStatusProjects.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          labelRowsPerPage="每頁顯示筆數"
        />
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseStatusMenu}
      >
        {(menuType === 'construction' ? constructionStatusOptions : billingStatusOptions).map(option => (
          <MenuItem key={option} onClick={() => updateStatus(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>



      <Dialog open={trackDialogOpen} onClose={() => setTrackDialogOpen(false)}>
        <DialogTitle>是否要繼續追蹤此專案？</DialogTitle>
        <DialogContent>
          <Typography>
            此專案已完成，是否要設定後續追蹤提醒？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackDialogOpen(false)}>否</Button>
          <Button
            variant="contained"
            onClick={() => {
              setTrackDialogOpen(false);
              // 跳轉到專案頁面並帶參數（或開啟追蹤設定 Dialog）
              navigate(`/order/${trackProject.project_id}?setTrack=1`);
            }}
          >
            是
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
