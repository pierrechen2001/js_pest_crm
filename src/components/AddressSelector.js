import React from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import { taiwanCities, getDistrictsByCity } from '../data/taiwanData';

const AddressSelector = ({ 
  city, 
  district, 
  address, 
  onCityChange, 
  onDistrictChange, 
  onAddressChange,
  prefix = "site", // "site" or "contact"
  disabled = false,
  required = false,
  errors = {}
}) => {
  const handleCityChange = (event, newValue) => {
    onCityChange(newValue);
    // 當縣市改變時，清空區域選擇
    if (district && !getDistrictsByCity(newValue).includes(district)) {
      onDistrictChange("");
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}>
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          options={taiwanCities}
          value={city || ""}
          onChange={handleCityChange}
          disabled={disabled}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label={`${prefix === 'site' ? '施工' : '聯絡'}縣市`} 
              fullWidth 
              required={required}
              error={!!errors.city}
              helperText={errors.city}
            />
          )}
        />
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          options={getDistrictsByCity(city)}
          value={district || ""}
          onChange={(event, newValue) => onDistrictChange(newValue)}
          disabled={disabled || !city}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label={`${prefix === 'site' ? '施工' : '聯絡'}區域`} 
              fullWidth 
              required={required}
              error={!!errors.district}
              helperText={errors.district}
            />
          )}
        />
      </Box>
      
      <Box sx={{ flex: 3 }}>
        <TextField
          label={`${prefix === 'site' ? '施工' : '聯絡'}地址`}
          fullWidth
          value={address || ""}
          onChange={(e) => onAddressChange(e.target.value)}
          disabled={disabled}
          required={required}
          error={!!errors.address}
          helperText={errors.address}
        />
      </Box>
    </Box>
  );
};

export default AddressSelector;
