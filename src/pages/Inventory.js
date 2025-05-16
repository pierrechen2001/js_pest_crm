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
    id: 1,
    name: "水管",
    type: "灌溉設備",
    components: [
      { 
        id: 1, 
        name: "第一支水管",
        status: "正常",
        lastMaintenance: "2024-03-01"
      },
      { 
        id: 2, 
        name: "第二支水管",
        status: "需更換",
        lastMaintenance: "2024-02-15"
      },
      { 
        id: 3, 
        name: "第三支水管",
        status: "正常",
        lastMaintenance: "2024-03-10"
      }
    ]
  },
  {
    id: 2,
    name: "抽水機",
    type: "灌溉設備",
    components: [
      { 
        id: 1, 
        name: "主抽水機",
        status: "正常",
        lastMaintenance: "2024-03-05"
      },
      { 
        id: 2, 
        name: "備用抽水機",
        status: "待維修",
        lastMaintenance: "2024-02-20"
      }
    ]
  },
  {
    id: 3,
    name: "噴頭",
    type: "灌溉設備",
    components: [
      { 
        id: 1, 
        name: "噴頭A",
        status: "正常",
        lastMaintenance: "2024-03-08"
      },
      { 
        id: 2, 
        name: "噴頭B",
        status: "正常",
        lastMaintenance: "2024-03-08"
      }
    ]
  }
];

const Inventory = () => {
  const [currentCategory, setCurrentCategory] = useState("藥劑");
  const [newMedicineName, setNewMedicineName] = useState("");
  const [medicines, setMedicines] = useState(initialMedicines);
  const [materials, setMaterials] = useState(initialMaterials);
  const [mode, setMode] = useState("overview");
  const [newRecord, setNewRecord] = useState({ type: "order", quantity: "", date: "", project: "", vendor: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    materialName: "",
    materialType: "灌溉設備",
    componentName: "",
    status: "正常",
    lastMaintenance: ""
  });

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

  const filteredMaterials = materials.filter(material => {
    const searchLower = searchTerm.toLowerCase();
    return (
      material.name.toLowerCase().includes(searchLower) ||
      material.components.some(component => 
        component.name.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleAddItem = () => {
    if (!newItem.materialName.trim() || !newItem.componentName.trim()) return;
    
    const existingMaterial = materials.find(m => m.name === newItem.materialName);
    
    if (existingMaterial) {
      // 如果耗材種類已存在，只新增物品
      setMaterials(materials.map(item =>
        item.id === existingMaterial.id ? {
          ...item,
          components: [
            ...item.components,
            {
              id: Math.max(...item.components.map(c => c.id), 0) + 1,
              name: newItem.componentName,
              status: newItem.status,
              lastMaintenance: newItem.lastMaintenance
            }
          ]
        } : item
      ));
    } else {
      // 如果耗材種類不存在，新增種類和物品
      const newId = Math.max(...materials.map(m => m.id)) + 1;
      const newMaterialItem = {
        id: newId,
        name: newItem.materialName,
        type: newItem.materialType,
        components: [{
          id: 1,
          name: newItem.componentName,
          status: newItem.status,
          lastMaintenance: newItem.lastMaintenance
        }]
      };
      setMaterials([...materials, newMaterialItem]);
    }
    
    setNewItem({
      materialName: "",
      materialType: "灌溉設備",
      componentName: "",
      status: "正常",
      lastMaintenance: ""
    });
    setShowAddForm(false);
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
        <>
          <div style={{ marginTop: 20, marginBottom: 20, display: 'flex', gap: '20px', alignItems: 'center' }}>
            <TextField
              label="搜尋耗材"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="輸入種類或物品名稱"
              style={{ width: 300 }}
            />
            {!showAddForm ? (
              <Button 
                variant="contained" 
                onClick={() => setShowAddForm(true)}
              >
                新增耗材
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <TextField
                  label="耗材種類"
                  size="small"
                  value={newItem.materialName}
                  onChange={(e) => setNewItem({ ...newItem, materialName: e.target.value })}
                  style={{ width: 150 }}
                />
                <TextField
                  label="物品名稱"
                  size="small"
                  value={newItem.componentName}
                  onChange={(e) => setNewItem({ ...newItem, componentName: e.target.value })}
                  style={{ width: 150 }}
                />
                <TextField
                  label="狀態"
                  size="small"
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  style={{ width: 150 }}
                />
                <TextField
                  label="保養日期"
                  type="date"
                  size="small"
                  value={newItem.lastMaintenance}
                  onChange={(e) => setNewItem({ ...newItem, lastMaintenance: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddItem}
                  disabled={!newItem.materialName.trim() || !newItem.componentName.trim()}
                >
                  確認新增
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItem({
                      materialName: "",
                      materialType: "灌溉設備",
                      componentName: "",
                      status: "正常",
                      lastMaintenance: ""
                    });
                  }}
                >
                  取消
                </Button>
              </div>
            )}
          </div>

          <TableContainer component={Paper} style={{ marginTop: 20 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>種類</TableCell>
                  <TableCell>物品名稱</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>上次保養日期</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaterials.map((material) => (
                  material.components.map((component) => (
                    <TableRow key={`${material.id}-${component.id}`}>
                      <TableCell>{material.name}</TableCell>
                      <TableCell>{component.name}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={component.status}
                          onChange={(e) => handleStatusChange(material.id, component.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={component.lastMaintenance}
                          onChange={(e) => handleMaintenanceChange(material.id, e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" color="primary">編輯</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default Inventory;