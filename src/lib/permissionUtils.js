import { supabase } from './supabaseClient';

// Helper: Get module ID from Supabase
export const getModuleId = async (moduleName) => {
  const { data } = await supabase.from('modules').select('id').eq('name', moduleName).single();
  return data?.id;
};

// Helper: Get permission ID from Supabase
export const getPermissionId = async (action) => {
  const { data } = await supabase.from('permissions').select('id').eq('name', action).single();
  return data?.id;
};

// Assign role permissions during sign-up
export const assignRolePermissions = async (userId, roleName) => {
  const rolePermissions = {
    admin: {
      customers: ["view", "edit", "delete"],
      orders: ["view", "edit", "delete"],
      inventory: ["view", "edit", "delete"],
      calendar: ["view", "edit", "delete"],
      userManagement: ["view", "edit", "delete"],
      roleManagement: ["view", "edit", "delete"],
    },
    user: {
      customers: ["view"],
      orders: ["view", "edit"],
      inventory: ["view"],
      calendar: ["view", "edit"],
      userManagement: [],
      roleManagement: [],
    },
    viewer: {
      customers: ["view"],
      orders: ["view"],
      inventory: ["view"],
      calendar: ["view"],
      userManagement: [],
      roleManagement: [],
    }
  };

  const permissions = rolePermissions[roleName];
  const rowsToInsert = [];

  for (const [moduleName, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      rowsToInsert.push({
        user_id: userId,
        module_id: await getModuleId(moduleName),
        permission_id: await getPermissionId(action)
      });
    }
  }

  await supabase.from('userpermissions').insert(rowsToInsert);
};