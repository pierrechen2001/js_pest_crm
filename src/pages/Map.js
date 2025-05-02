import React, { useEffect, useState } from "react";
import { Typography, Container, Button, CircularProgress } from "@mui/material";
import { gapi } from "gapi-script";

// Google Maps API script URL
const GOOGLE_MAPS_API_URL = "https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAP_API_KEY&callback=initMap&libraries=places";

const Map = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);

  // 初始化 Google API 客戶端並加載地圖
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = GOOGLE_MAPS_API_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.initMap = initMap;
      };
      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
      };
      document.body.appendChild(script);
    };

    // 初始化地圖
    const initMap = () => {
      setLoading(false);
      const mapOptions = {
        center: { lat: 37.7749, lng: -122.4194 }, // 設定地圖中心，這裡是舊金山
        zoom: 12, // 設定縮放等級
      };
      const mapInstance = new window.google.maps.Map(document.getElementById("map"), mapOptions);
      setMap(mapInstance);
    };

    loadGoogleMapsScript();
  }, []);

  // 登入處理（如果有需要使用帳號驗證）
  const handleLogin = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  // 登出處理
  const handleLogout = () => {
    // 登出邏輯
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Google 地圖
      </Typography>

      {!isAuthenticated ? (
        <Button variant="contained" color="primary" onClick={handleLogin}>
          登入 Google 帳號
        </Button>
      ) : (
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          登出
        </Button>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <Typography variant="h6" gutterBottom>
            地圖顯示區域：
          </Typography>
          <div id="map" style={{ width: "100%", height: "500px" }}></div>
        </div>
      )}
    </Container>
  );
};

export default Map;
