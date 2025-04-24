import React, { useState } from "react";
import {
  Button, TextField, MenuItem, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from "@mui/material";

// 資料結構
const initialMedicines = [
  {
    id: 1,
    name: "農藥",
    orders: [], // {quantity, date, project, vendor}
    usages: []
  },
  {
    id: 2,
    name: "酒精",
    orders: [],
    usages: []
  }
];

const initialMaterials = [
  {
    id: 3,
    name: "水管",
    components: [
      { id: 1, status: "正常" },
      { id: 2, status: "需更換" }
    ],
    lastMaintenance: ""
  }
];

const Inventory = () => {
  const [currentCategory, setCurrentCategory] = useState("藥劑");
  const [newMedicineName, setNewMedicineName] = useState("");
  const [medicines, setMedicines] = useState(initialMedicines);
  const [materials, setMaterials] = useState(initialMaterials);
  const [mode, setMode] = useState("overview");
  const [newRecord, setNewRecord] = useState({ type: "order", quantity: "", date: "", project: "", vendor: "" });

  const handleAddRecord = (id, onSuccess) => {
    setMedicines(medicines.map(item =>
      item.id === id ? {
        ...item,
        [newRecord.type === "order" ? "orders" : "usages"]: [
          ...item[newRecord.type === "order" ? "orders" : "usages"],
          {
            quantity: parseInt(newRecord.quantity, 10),
            date: newRecord.date,
            project: newRecord.project,
            vendor: newRecord.vendor
          }
        ]
      } : item
    ));
    setNewRecord({ type: "order", quantity: "", date: "", project: "", vendor: "" });
    if (onSuccess) onSuccess(); // 呼叫傳入的成功後動作
  };

  const handleEditRecord = (id, type, index, field, value) => {
    setMedicines(medicines.map(item =>
      item.id === id ? {
        ...item,
        [type]: item[type].map((record, i) => i === index ? { ...record, [field]: value } : record)
      } : item
    ));
  };

  const handleDeleteRecord = (id, type, index) => {
    setMedicines(medicines.map(item =>
      item.id === id ? {
        ...item,
        [type]: item[type].filter((_, i) => i !== index)
      } : item
    ));
  };

  const handleMaintenanceChange = (id, value) => {
    setMaterials(materials.map(item =>
      item.id === id ? { ...item, lastMaintenance: value } : item
    ));
  };

  const handleStatusChange = (itemId, componentId, value) => {
    setMaterials(materials.map(item =>
      item.id === itemId ? {
        ...item,
        components: item.components.map(comp => comp.id === componentId ? { ...comp, status: value } : comp)
      } : item
    ));
  };

  const calculateTotal = (item) => {
    const totalOrders = item.orders.reduce((sum, r) => sum + r.quantity, 0);
    const totalUsages = item.usages.reduce((sum, r) => sum + r.quantity, 0);
    return totalOrders - totalUsages;
  };

  const handleAddMedicine = () => {
    if (!newMedicineName.trim()) return;
    const newId = Math.max(...medicines.map(m => m.id)) + 1;
    const newMedicine = {
      id: newId,
      name: newMedicineName,
      orders: [],
      usages: []
    };
    setMedicines([...medicines, newMedicine]);
    setNewMedicineName("");
  };
  
  const handleDeleteMedicine = (id) => {
    setMedicines(medicines.filter(item => item.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4">庫存管理</Typography>

      <div style={{ marginTop: 20 }}>
        <Button variant={currentCategory === "藥劑" ? "contained" : "outlined"} onClick={() => setCurrentCategory("藥劑")} style={{ marginRight: 10 }}>藥劑</Button>
        <Button variant={currentCategory === "耗材" ? "contained" : "outlined"} onClick={() => setCurrentCategory("耗材")}>耗材</Button>
      </div>
      
      {currentCategory === "藥劑" && (
        <>
          <div style={{ marginTop: 20 }}>
            <TextField
              label="新增藥劑名稱"
              size="small"
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
              style={{ marginRight: 10 }}
            />
            <Button variant="outlined" onClick={handleAddMedicine}>新增藥劑</Button>
          </div>
          {mode === "overview" && (
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>名稱</TableCell>
                    <TableCell>剩餘量</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicines.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{calculateTotal(item)}</TableCell>
                      <TableCell>
                        <Button onClick={() => setMode(`view-${item.id}`)}>查看</Button>
                        <Button onClick={() => setMode(`add-${item.id}`)} style={{ marginLeft: 10 }}>新增訂購或使用</Button>
                        <Button
                          onClick={() => handleDeleteMedicine(item.id)}
                          color="error"
                          style={{ marginLeft: 10 }}
                        >
                          刪除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
          )}

          {medicines.map((item) => (
            <div key={item.id}>
              {mode === `view-${item.id}` && (
                <TableContainer component={Paper} style={{ marginTop: 20 }}>
                  <Button onClick={() => setMode("overview")}>回主頁</Button>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>類型</TableCell>
                        <TableCell>數量</TableCell>
                        <TableCell>日期</TableCell>
                        <TableCell>專案</TableCell>
                        <TableCell>廠商</TableCell>
                        <TableCell>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...item.orders.map((r, i) => ({ ...r, type: "orders", index: i })),
                       ...item.usages.map((r, i) => ({ ...r, type: "usages", index: i }))].map(record => (
                        <TableRow key={record.index + record.type}>
                          <TableCell>{record.type === "orders" ? "訂貨" : "使用"}</TableCell>
                          <TableCell><TextField size="small" type="number" value={record.quantity} onChange={(e) => handleEditRecord(item.id, record.type, record.index, "quantity", parseInt(e.target.value, 10))} /></TableCell>
                          <TableCell><TextField size="small" type="date" value={record.date} onChange={(e) => handleEditRecord(item.id, record.type, record.index, "date", e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={record.project} onChange={(e) => handleEditRecord(item.id, record.type, record.index, "project", e.target.value)} /></TableCell>
                          <TableCell><TextField size="small" value={record.vendor || ""} onChange={(e) => handleEditRecord(item.id, record.type, record.index, "vendor", e.target.value)} /></TableCell>
                          <TableCell><Button onClick={() => handleDeleteRecord(item.id, record.type, record.index)}>刪除</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {mode === `add-${item.id}` && (
                <TableContainer component={Paper} style={{ marginTop: 20 }}>
                  <Button onClick={() => setMode("overview")}>回主頁</Button>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>類型</TableCell>
                        <TableCell>數量</TableCell>
                        <TableCell>日期</TableCell>
                        <TableCell>專案</TableCell>
                        <TableCell>廠商</TableCell>
                        <TableCell>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><Select value={newRecord.type} onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}><MenuItem value="order">訂貨</MenuItem><MenuItem value="usage">使用</MenuItem></Select></TableCell>
                        <TableCell><TextField size="small" type="number" value={newRecord.quantity} onChange={(e) => setNewRecord({ ...newRecord, quantity: e.target.value })} /></TableCell>
                        <TableCell><TextField size="small" type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} /></TableCell>
                        <TableCell><TextField size="small" value={newRecord.project} onChange={(e) => setNewRecord({ ...newRecord, project: e.target.value })} /></TableCell>
                        <TableCell><TextField size="small" value={newRecord.vendor} onChange={(e) => setNewRecord({ ...newRecord, vendor: e.target.value })} /></TableCell>
                        <TableCell><Button onClick={() => handleAddRecord(item.id, () => setMode("overview"))}>新增</Button></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}


            </div>
          ))}
        </>
      )}

      {currentCategory === "耗材" && (
        <TableContainer component={Paper} style={{ marginTop: 20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名稱</TableCell>
                <TableCell>保養時間</TableCell>
                <TableCell>狀態</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map(item => (
                <React.Fragment key={item.id}>
                  <TableRow>
                    <TableCell rowSpan={item.components.length + 1}>{item.name}</TableCell>
                    <TableCell rowSpan={item.components.length + 1}>
                      <TextField type="date" size="small" value={item.lastMaintenance} onChange={(e) => handleMaintenanceChange(item.id, e.target.value)} />
                    </TableCell>
                  </TableRow>
                  {item.components.map(comp => (
                    <TableRow key={comp.id}>
                      <TableCell>
                        <TextField size="small" value={comp.status} onChange={(e) => handleStatusChange(item.id, comp.id, e.target.value)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Inventory;