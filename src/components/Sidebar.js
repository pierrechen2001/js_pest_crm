import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <Drawer variant="permanent" anchor="left" sx={{ width: 240 }}>
      <List>
        <ListItem button component={Link} to="/customers">
          <ListItemText primary="客戶管理" />
        </ListItem>
        <ListItem button component={Link} to="/orders">
          <ListItemText primary="訂單管理" />
        </ListItem>
        <ListItem button component={Link} to="/inventory">
          <ListItemText primary="庫存管理" />
        </ListItem>
        <ListItem button component={Link} to="/calendar">
          <ListItemText primary="行事曆" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
