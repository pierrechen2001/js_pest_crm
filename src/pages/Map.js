import React, { useEffect, useRef, useState } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import { supabase } from '../lib/supabaseClient';
import { geocodeAddress, combineAddress } from '../lib/geocoding';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Slider, 
  Chip
} from '@mui/material';

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Google Maps API Key is missing. Please set REACT_APP_GOOGLE_API_KEY in your .env file.");
}

// Assuming projects will be passed as a prop
const MapComponent = ({ projects = [] }) => { 
  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null); // Main search marker
  const projectMarkersRef = useRef([]); // To store project markers
  const circleRef = useRef(null);
  const mapClickListenerRef = useRef(null); // To store the map click listener
  const activeInfoWindowRef = useRef(null); // To store the active InfoWindow
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const [circleRadius, setCircleRadius] = useState(200);
  const [mainMarkerPosition, setMainMarkerPosition] = useState(null); // Tracks center of the circle
  
  // 新增篩選相關狀態
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [availableFilters, setAvailableFilters] = useState([]);

  const updateCircle = (center, map, radius) => {
    if (!window.google || !window.google.maps.Circle) return;
    const lightBlue = '#87CEFA';
    if (circleRef.current) {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radius);
      circleRef.current.setMap(map);
    } else {
      const { Circle } = window.google.maps;
      circleRef.current = new Circle({
        strokeColor: lightBlue,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: lightBlue,
        fillOpacity: 0.35,
        map: map,
        center: center,
        radius: radius,
      });
    }  };

  // 提取所有可用的施工項目作為篩選選項
  useEffect(() => {
    const extractFilters = () => {
      const allItems = new Set();
      projects.forEach(project => {
        // 優先使用 construction_items 數組
        if (project.construction_items && Array.isArray(project.construction_items)) {
          project.construction_items.forEach(item => {
            if (item && item.trim()) {
              allItems.add(item.trim());
            }
          });
        } 
        // 如果沒有 construction_items，則使用 construction_item 字符串
        else if (project.construction_item) {
          const items = project.construction_item.split(',').map(item => item.trim());
          items.forEach(item => {
            if (item) {
              allItems.add(item);
            }
          });
        }
      });
      setAvailableFilters(Array.from(allItems).sort());
    };
    
    extractFilters();
  }, [projects]);

  // 篩選專案的函數
  const getFilteredProjects = () => {
    if (selectedFilters.length === 0) {
      return projects;
    }
    
    return projects.filter(project => {
      // 檢查專案的施工項目是否包含任何選中的篩選項
      let projectItems = [];
      
      // 優先使用 construction_items 數組
      if (project.construction_items && Array.isArray(project.construction_items)) {
        projectItems = project.construction_items;
      } 
      // 如果沒有 construction_items，則使用 construction_item 字符串
      else if (project.construction_item) {
        projectItems = project.construction_item.split(',').map(item => item.trim());
      }
      
      // 檢查是否有任何項目匹配篩選條件
      return selectedFilters.some(filter => 
        projectItems.some(item => item.trim() === filter)
      );
    });
  };

  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API Key is missing. Please configure it properly.");
      setIsLoading(false);
      return;
    }
    const loaderInstance = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["geocoding", "marker", "geometry"] // Added geometry library
    });
    setIsLoading(true);
    setMapReady(false);
    loaderInstance.load().then(async () => {
      const { Map: GoogleMap } = await window.google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
      
      if (mapDivRef.current && !mapInstanceRef.current) {
        const initialCenter = { lat: 25.0330, lng: 121.5654 };
        const map = new GoogleMap(mapDivRef.current, {
          center: initialCenter,
          zoom: 12,
          scaleControl: true,
          mapId: "9511f62ce31b4d10",
          gestureHandling: 'greedy'
        });
        mapInstanceRef.current = map;
        markerRef.current = new AdvancedMarkerElement({
          position: initialCenter,
          map: map,
        });
        setMainMarkerPosition(initialCenter);
        console.log("Initial AdvancedMarkerElement created:", markerRef.current);
        updateCircle(initialCenter, map, circleRadius);

        // Add map click listener and store it
        if (mapInstanceRef.current) {
          mapClickListenerRef.current = mapInstanceRef.current.addListener('click', (mapsMouseEvent) => {
            const clickedLatLng = mapsMouseEvent.latLng.toJSON(); // Get lat/lng of the click
            if (markerRef.current) {
              markerRef.current.position = clickedLatLng;
            }
            setMainMarkerPosition(clickedLatLng);
            updateCircle(clickedLatLng, map, circleRadius);
          });
        }

        setMapReady(true);
      }
      setIsLoading(false);
    }).catch(e => {
      console.error("Error loading Google Maps libraries:", e);
      setError("Failed to load Google Maps. Please check the console.");
      setIsLoading(false);
    });
    return () => {
      projectMarkersRef.current.forEach(marker => marker.map = null);
      projectMarkersRef.current = [];
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
      // Clean up the specific map click listener
      if (mapClickListenerRef.current) {
        mapClickListenerRef.current.remove();
        mapClickListenerRef.current = null;
      }
    };
  }, []); // Removed projects from here, will be handled by its own effect

  // Effect to update circle when radius changes via slider
  useEffect(() => {
    if (circleRef.current && mapReady) {
      circleRef.current.setRadius(circleRadius);
    }
  }, [circleRadius, mapReady]);
  // Effect to display project markers within the circle
  useEffect(() => {
    if (!mapReady || !mainMarkerPosition || !projects || !window.google || !window.google.maps.geometry || !window.google.maps.marker || !window.google.maps.InfoWindow) {
      projectMarkersRef.current.forEach(marker => marker.map = null);
      projectMarkersRef.current = [];
      if (activeInfoWindowRef.current) {
        activeInfoWindowRef.current.close();
        activeInfoWindowRef.current = null;
      }
      return;
    }

    const { spherical } = window.google.maps.geometry;
    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
    const { InfoWindow } = window.google.maps;

    // 清除舊的 marker
    projectMarkersRef.current.forEach(marker => marker.map = null);
    projectMarkersRef.current = [];
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }

    // 使用篩選後的專案
    const filteredProjects = getFilteredProjects();

    filteredProjects.forEach(async (project) => {
      // 優先使用經緯度
      let lat = project.latitude;
      let lng = project.longitude;
      if (typeof lat === 'string') lat = parseFloat(lat);
      if (typeof lng === 'string') lng = parseFloat(lng);
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const projectLocation = { lat, lng };
        const distance = spherical.computeDistanceBetween(mainMarkerPosition, projectLocation);
        if (distance <= circleRadius) {
          const pinElement = new PinElement({
            glyphColor: 'white',
            background: '#4285F4',
            borderColor: '#1A73E8',
          });
          const projectMarker = new AdvancedMarkerElement({
            position: projectLocation,
            map: mapInstanceRef.current,
            title: project.project_name || 'Project Location',
            content: pinElement.element,
          });
          projectMarker.addListener('click', () => {
            if (activeInfoWindowRef.current) {
              activeInfoWindowRef.current.close();
            }
            const quoteDate = project.quote_date ? new Date(project.quote_date).toLocaleDateString() : 'N/A';
            const contractAmount = project.construction_fee ? `${project.construction_fee.toLocaleString()} 元` : 'N/A';
            const projectTitleText = project.project_name || '未提供專案名稱';
            const projectTitleElement = document.createElement('div');
            projectTitleElement.style.fontSize = '1.4em';
            projectTitleElement.style.fontWeight = 'bold';
            projectTitleElement.textContent = projectTitleText;
            const projectDetails = `
              <div style="font-family: Arial, sans-serif; font-size: 13px; color: #555555; line-height: 1.5; margin-top: 8px;">
                <p style="margin: 0 0 4px 0;"><strong>估價日期:</strong> ${quoteDate}</p>
                <p style="margin: 0 0 10px 0;"><strong>施工金額:</strong> ${contractAmount}</p>
                <a href="/order/${project.project_id}" target="_blank" style="color: #1a73e8; text-decoration: none; font-weight: bold;">查看專案詳細頁面</a>
              </div>
            `;
            const infoWindow = new InfoWindow({
              headerContent: projectTitleElement,
              content: projectDetails,
              ariaLabel: project.project_name || '專案詳情',
            });
            infoWindow.open({
              anchor: projectMarker,
              map: mapInstanceRef.current,
            });
            activeInfoWindowRef.current = infoWindow;
          });
          projectMarkersRef.current.push(projectMarker);
        }
      } else {
        // 若無經緯度，嘗試 geocode 並即時存回 supabase
        const fullAddress = combineAddress(project.site_city, project.site_district, project.site_address);
        if (!fullAddress.trim()) return;
        
        try {
          const coords = await geocodeAddress(fullAddress);
          if (coords) {
            // 立即存回 supabase
            const { error } = await supabase
              .from('project')
              .update({ 
                latitude: coords.latitude, 
                longitude: coords.longitude 
              })
              .eq('project_id', project.project_id);
            
            if (error) {
              console.error('Supabase update error:', error);
            } else {
              console.log('成功更新專案經緯度:', project.project_name);
            }
            // 直接顯示 marker
            const projectLocation = { lat: coords.latitude, lng: coords.longitude };
            const distance = spherical.computeDistanceBetween(mainMarkerPosition, projectLocation);
            if (distance <= circleRadius) {
              const pinElement = new PinElement({
                glyphColor: 'white',
                background: '#4285F4',
                borderColor: '#1A73E8',
              });
              const projectMarker = new AdvancedMarkerElement({
                position: projectLocation,
                map: mapInstanceRef.current,
                title: project.project_name || 'Project Location',
                content: pinElement.element,
              });
              projectMarker.addListener('click', () => {
                if (activeInfoWindowRef.current) {
                  activeInfoWindowRef.current.close();
                }
                const quoteDate = project.quote_date ? new Date(project.quote_date).toLocaleDateString() : 'N/A';
                const contractAmount = project.construction_fee ? `${project.construction_fee.toLocaleString()} 元` : 'N/A';
                const projectTitleText = project.project_name || '未提供專案名稱';
                const projectTitleElement = document.createElement('div');
                projectTitleElement.style.fontSize = '1.4em';
                projectTitleElement.style.fontWeight = 'bold';
                projectTitleElement.textContent = projectTitleText;
                const projectDetails = `
                  <div style="font-family: Arial, sans-serif; font-size: 13px; color: #555555; line-height: 1.5; margin-top: 8px;">
                    <p style="margin: 0 0 4px 0;"><strong>估價日期:</strong> ${quoteDate}</p>
                    <p style="margin: 0 0 10px 0;"><strong>施工金額:</strong> ${contractAmount}</p>
                    <a href="/order/${project.project_id}" target="_blank" style="color: #1a73e8; text-decoration: none; font-weight: bold;">查看專案詳細頁面</a>
                  </div>
                `;
                const infoWindow = new InfoWindow({
                  headerContent: projectTitleElement,
                  content: projectDetails,
                  ariaLabel: project.project_name || '專案詳情',
                });
                infoWindow.open({
                  anchor: projectMarker,
                  map: mapInstanceRef.current,
                });
                activeInfoWindowRef.current = infoWindow;
              });
              projectMarkersRef.current.push(projectMarker);
            }
          }
        } catch (e) {

          console.error('Geocode and save failed:', e);        }

      }
    });
  }, [mapReady, mainMarkerPosition, circleRadius, projects, selectedFilters, mapInstanceRef]);

  const handleSearch = async () => {
    console.log("handleSearch called. searchInput:", searchInput, "mapReady:", mapReady);
    if (!searchInput.trim() || !mapReady) return;
    if (!mapInstanceRef.current || !markerRef.current || !window.google || !window.google.maps.Geocoder) {
      console.warn("Map, Marker, or Geocoder not loaded yet. markerRef.current:", markerRef.current);
      setError("Map components are not fully loaded. Please wait a moment.");
      return;
    }
    setError(null);
    console.log("Proceeding with geocoding. Current markerRef.current (should be AdvancedMarkerElement):", markerRef.current );

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
      console.log("Geocode status:", status, "Results:", results);
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location; // This is a LatLngLiteral
        console.log("Geocode success. Location object (LatLngLiteral):", location);
        
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(15);
        
        if (markerRef.current) {
            markerRef.current.position = location;
            setMainMarkerPosition(location); // Update state for the main marker's new position
        }
        updateCircle(location, mapInstanceRef.current, circleRadius);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
        setError(`Could not find location: ${searchInput}. Reason: ${status}`);
      }
    });
  };

  const handleSliderChange = (event, newValue) => {
    setCircleRadius(newValue);
  };

  if (!apiKey) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Google Maps API Key is missing.</div>;
  }
  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      <Typography variant="h5" gutterBottom>
        施工鄰近地點查詢
      </Typography>
      
      {/* 搜尋位置 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="搜尋位置"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
          sx={{ mr: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={handleSearch} 
          disabled={isLoading || !mapReady} 
        >
          搜尋
        </Button>
      </Box>      {/* 施工項目篩選 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          篩選專案類別 ({selectedFilters.length > 0 ? `已選擇 ${selectedFilters.length} 項` : '顯示全部'})
        </Typography>
        
        {/* 標籤按鈕篩選 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {/* 全部按鈕 */}
          <Chip
            label="全部"
            clickable
            variant={selectedFilters.length === 0 ? "filled" : "outlined"}
            color={selectedFilters.length === 0 ? "primary" : "default"}
            onClick={() => setSelectedFilters([])}
            sx={{ 
              fontWeight: selectedFilters.length === 0 ? 'bold' : 'normal',
              '&:hover': { backgroundColor: selectedFilters.length === 0 ? 'primary.dark' : 'action.hover' }
            }}
          />
          
          {/* 施工項目標籤 */}
          {availableFilters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              clickable
              variant={selectedFilters.includes(filter) ? "filled" : "outlined"}
              color={selectedFilters.includes(filter) ? "primary" : "default"}
              onClick={() => {
                setSelectedFilters(prev => 
                  prev.includes(filter) 
                    ? prev.filter(f => f !== filter)
                    : [...prev, filter]
                );
              }}
              sx={{ 
                fontWeight: selectedFilters.includes(filter) ? 'bold' : 'normal',
                '&:hover': { 
                  backgroundColor: selectedFilters.includes(filter) ? 'primary.dark' : 'action.hover' 
                }
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 2, px: 1 }}>
        <Typography gutterBottom>方圓半徑: {circleRadius}m</Typography>
        <Slider
          value={circleRadius}
          onChange={handleSliderChange}
          aria-labelledby="circle-radius-slider"
          valueLabelDisplay="auto"
          step={50} 
          min={0}
          max={10000} 
        />
          </Box>

      {isLoading && <Typography>Loading Map...</Typography>}
      {error && <Typography color="error" sx={{mb:2}}>{error}</Typography>}
          <Box 
        ref={mapDivRef} 
            sx={{ 
              width: "100%", 
              height: "500px", 
          borderRadius: 1,
          border: error || isLoading ? '1px dashed grey' : '1px solid #e0e0e0',
          backgroundColor: error || isLoading ? '#f0f0f0' : 'transparent'
        }}
      >
        {error && !isLoading && <Typography sx={{textAlign: 'center', pt: '20%'}}>Map could not be displayed.</Typography>}
      </Box>
      </Paper>
  );
};

export default MapComponent;
