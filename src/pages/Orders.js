import React, { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { 
  Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, 
  TextField, IconButton, Menu, MenuItem, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Autocomplete, Typography, Divider,
  CircularProgress
} from "@mui/material";
import { FilterList, Add } from "@mui/icons-material";

const constructionStatusOptions = ["未開始", "進行中", "已完成", "延遲"];
const billingStatusOptions = ["未請款", "部分請款", "已請款"];

export default function Orders() {
  // 狀態管理
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 篩選和排序
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Dialog 控制
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [projectData, setProjectData] = useState({
    project_name: "",
    customer_id: null,
    project_leader: "",
    leader_phone: "",
    site_city: "",
    site_district: "",
    site_address: "",
    construction_item: "",
    construction_fee: "",
    start_date: "",
    end_date: "",
    construction_status: "未開始",
    billing_status: "未請款",
    project_notes: ""
  });

  // 獲取數據
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 獲取專案數據
        const { data: projectsData, error: projectsError } = await supabase
          .from('project')
          .select(`
            *,
            customer_database (
              customer_name,
              contact_person_1,
              contact_phone_1
            )
          `)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        // 獲取客戶列表（用於新增專案時選擇）
        const { data: customersData, error: customersError } = await supabase
          .from('customer_database')
          .select('customer_id, customer_name, contact_person_1, contact_phone_1');

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

  // 處理新增專案
  const handleSaveProject = async () => {
    try {
      const { data, error } = await supabase
        .from('project')
        .insert([{
          ...projectData,
          construction_fee: parseFloat(projectData.construction_fee)
        }])
        .select();

      if (error) throw error;

      setProjects(prev => [...prev, data[0]]);
      setOpenDialog(false);
      setProjectData({
        project_name: "",
        customer_id: null,
        project_leader: "",
        leader_phone: "",
        site_city: "",
        site_district: "",
        site_address: "",
        construction_item: "",
        construction_fee: "",
        start_date: "",
        end_date: "",
        construction_status: "未開始",
        billing_status: "未請款",
        project_notes: ""
      });
    } catch (error) {
      console.error('Error saving project:', error);
      // 可以添加錯誤提示
    }
  };

  // 處理表單變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div style={{ padding: 20 }}>
      <Button 
        variant="contained" 
        startIcon={<Add />} 
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: 20 }}
      >
        新增專案
      </Button>

      <TextField 
        label="搜尋專案" 
        variant="outlined" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>新增專案</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>基本資訊</Typography>
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customer_name}
            value={selectedCustomer}
            onChange={(event, newValue) => {
              setSelectedCustomer(newValue);
              setProjectData(prev => ({
                ...prev,
                customer_id: newValue?.customer_id
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="選擇客戶" margin="normal" />
            )}
          />
          
          <TextField
            name="project_name"
            label="專案名稱"
            fullWidth
            margin="normal"
            value={projectData.project_name}
            onChange={handleChange}
          />

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              name="project_leader"
              label="專案負責人"
              fullWidth
              value={projectData.project_leader}
              onChange={handleChange}
            />
            <TextField
              name="leader_phone"
              label="負責人電話"
              fullWidth
              value={projectData.leader_phone}
              onChange={handleChange}
            />
          </div>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>施工資訊</Typography>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              name="site_city"
              label="施工縣市"
              fullWidth
              value={projectData.site_city}
              onChange={handleChange}
            />
            <TextField
              name="site_district"
              label="施工區域"
              fullWidth
              value={projectData.site_district}
              onChange={handleChange}
            />
          </div>
          
          <TextField
            name="site_address"
            label="施工地址"
            fullWidth
            margin="normal"
            value={projectData.site_address}
            onChange={handleChange}
          />

          <TextField
            name="construction_item"
            label="施工項目"
            fullWidth
            margin="normal"
            value={projectData.construction_item}
            onChange={handleChange}
          />

          <TextField
            name="construction_fee"
            label="施工金額"
            type="number"
            fullWidth
            margin="normal"
            value={projectData.construction_fee}
            onChange={handleChange}
          />

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              name="start_date"
              label="開始日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.start_date}
              onChange={handleChange}
            />
            <TextField
              name="end_date"
              label="結束日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={projectData.end_date}
              onChange={handleChange}
            />
          </div>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>狀態</Typography>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              select
              name="construction_status"
              label="施工狀態"
              fullWidth
              value={projectData.construction_status}
              onChange={handleChange}
            >
              {constructionStatusOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              name="billing_status"
              label="請款狀態"
              fullWidth
              value={projectData.billing_status}
              onChange={handleChange}
            >
              {billingStatusOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </div>

          <TextField
            name="project_notes"
            label="專案備註"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={projectData.project_notes}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveProject}
            disabled={!projectData.project_name || !projectData.customer_id}
          >
            儲存
          </Button>
        </DialogActions>
      </Dialog>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>專案名稱</TableCell>
            <TableCell>客戶名稱</TableCell>
            <TableCell>負責人</TableCell>
            <TableCell>
              開始日期
              <TableSortLabel
                active
                direction={sortOrder}
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              />
            </TableCell>
            <TableCell>結束日期</TableCell>
            <TableCell>施工狀態</TableCell>
            <TableCell>請款狀態</TableCell>
            <TableCell>施工金額</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects
            .filter(project => 
              project.project_name?.toLowerCase().includes(search.toLowerCase()) ||
              project.project_leader?.toLowerCase().includes(search.toLowerCase())
            )
            .map((project) => (
              <TableRow key={project.project_id}>
                <TableCell>{project.project_name}</TableCell>
                <TableCell>{project.customer_database?.customer_name}</TableCell>
                <TableCell>{project.project_leader}</TableCell>
                <TableCell>{project.start_date}</TableCell>
                <TableCell>{project.end_date}</TableCell>
                <TableCell>{project.construction_status}</TableCell>
                <TableCell>{project.billing_status}</TableCell>
                <TableCell>{project.construction_fee}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
