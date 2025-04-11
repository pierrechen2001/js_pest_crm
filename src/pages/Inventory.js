import React, { useState, useEffect } from "react";
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Autocomplete } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { Typography } from "@mui/material";

const Inventory = () => {
  const [items, setItems] = useState(inventoryItems);
  const [mode, setMode] = useState("overview");
  const [newRecord, setNewRecord] = useState({ type: "order", quantity: "", date: "", project: "" });

  const handleAddRecord = (id) => {
    setItems(items.map(item =>
      item.id === id ? {
        ...item,
        [newRecord.type === "order" ? "orders" : "usages"]: [...item[newRecord.type === "order" ? "orders" : "usages"], {
          quantity: parseInt(newRecord.quantity, 10),
          date: newRecord.date,
          project: newRecord.project
        }]
      } : item
    ));
    setNewRecord({ type: "order", quantity: "", date: "", project: "" });
  };

  const handleEditRecord = (id, type, index, field, value) => {
    setItems(items.map(item =>
      item.id === id ? {
        ...item,
        [type]: item[type].map((record, i) => i === index ? { ...record, [field]: value } : record)
      } : item
    ));
  };

  const handleDeleteRecord = (itemId, type, index) => {
    setItems(items.map((item) => {
      if (item.id === itemId) {
        // 根據類型刪除對應的記錄
        return {
          ...item,
          [type]: item[type].filter((_, i) => i !== index), // 根據 index 刪除記錄
        };
      }
      return item;
    }));
  };

  const calculateTotal = (item) => {
    const totalOrders = item.orders.reduce((sum, record) => sum + record.quantity, 0);
    const totalUsages = item.usages.reduce((sum, record) => sum + record.quantity, 0);
    return totalOrders - totalUsages;
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        庫存管理
      </Typography>

      {mode === "overview" && (
        <TableContainer component={Paper} style={{ marginTop: 20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名稱</TableCell>
                <TableCell>剩餘數量</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{calculateTotal(item)}</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => setMode(`view-${item.id}`)}>查看</Button>
                    <Button variant="contained" onClick={() => setMode(`add-${item.id}`)} style={{ marginLeft: 10 }}>新增</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {items.map((item) => (
        <div key={item.id}>
          {mode === `view-${item.id}` && (
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
              <Button variant="contained" onClick={() => setMode("overview")}>回到主頁</Button>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>類型</TableCell>
                    <TableCell>數量</TableCell>
                    <TableCell>日期</TableCell>
                    <TableCell>專案</TableCell>
                    <TableCell>操作</TableCell> {/* 新增操作列 */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...item.orders.map((record, index) => ({ ...record, type: "orders", index })),
                    ...item.usages.map((record, index) => ({ ...record, type: "usages", index }))].map((record) => (
                    <TableRow key={record.index}>
                      <TableCell>{record.type === "orders" ? "訂貨" : "使用"}</TableCell>
                      <TableCell>
                        <TextField size="small" type="number" value={record.quantity}
                          onChange={(e) => handleEditRecord(item.id, record.type, record.index, "quantity", parseInt(e.target.value, 10))} />
                      </TableCell>
                      <TableCell>
                        <TextField size="small" type="date" value={record.date}
                          onChange={(e) => handleEditRecord(item.id, record.type, record.index, "date", e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <TextField size="small" value={record.project}
                          onChange={(e) => handleEditRecord(item.id, record.type, record.index, "project", e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" color="secondary" onClick={() => handleDeleteRecord(item.id, record.type, record.index)}>
                          刪除
                        </Button>
                      </TableCell> {/* 刪除按鈕 */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      ))}
      
      {/* 新增記錄區域 */}
      {items.map((item) => (
        <div key={item.id}>
          {mode === `add-${item.id}` && (
            <TableContainer component={Paper} style={{ marginTop: 20 }}>
              <Button variant="contained" onClick={() => setMode("overview")}>回到主頁</Button>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>類型</TableCell>
                    <TableCell>數量</TableCell>
                    <TableCell>日期</TableCell>
                    <TableCell>專案</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Select value={newRecord.type} onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}>
                        <MenuItem value="order">訂貨</MenuItem>
                        <MenuItem value="usage">使用</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField size="small" type="number" value={newRecord.quantity} onChange={(e) => setNewRecord({ ...newRecord, quantity: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={newRecord.project} onChange={(e) => setNewRecord({ ...newRecord, project: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handleAddRecord(item.id)}>新增</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      ))}
    </div>
  );
};

<<<<<<< HEAD
export default Inventory;
=======

export default Inventory;

>>>>>>> 6d0b67f95e429157cb19b611acedcb94c32d682f
