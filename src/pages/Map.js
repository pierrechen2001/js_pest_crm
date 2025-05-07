import React, { useEffect, useRef, useState } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import { TextField, Button, Box, Typography, Paper, Slider } from '@mui/material'; // Added Slider

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
    }
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
    
    const geocoder = new window.google.maps.Geocoder();
    const { spherical } = window.google.maps.geometry;
    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
    const { InfoWindow } = window.google.maps; // Get InfoWindow constructor

    // Clear previous project markers and close any open InfoWindow
    projectMarkersRef.current.forEach(marker => marker.map = null);
    projectMarkersRef.current = [];
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }

    const geocodeDelay = 250; // ms delay between geocoding requests

    projects.forEach((project, index) => {
      const projectAddress = `${project.site_city || ""}${project.site_district || ""}${project.site_address || ""}`.trim();
      if (!projectAddress) return;

      setTimeout(() => {
        geocoder.geocode({ address: projectAddress }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const projectLocation = results[0].geometry.location;
            const distance = spherical.computeDistanceBetween(mainMarkerPosition, projectLocation);

            if (distance <= circleRadius) {
              const pinElement = new PinElement({
                // glyph: project.project_name?.charAt(0) || 'P', // Removed glyph
                glyphColor: 'white', // No glyph, so no glyphColor
                background: '#4285F4', // Google Blue for project markers
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
            
                const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A';
                const contractAmount = project.construction_fee ? `${project.construction_fee.toLocaleString()} 元` : 'N/A';

                const contentString = `
                  <div style="font-family: Arial, sans-serif; font-size: 14px; padding: 8px 28px 8px 12px;">
                    <div style="font-size: 16px; font-weight: bold; color: #2c2c2c; margin-bottom: 8px;">
                      ${project.project_name || '未提供專案名稱'}
                    </div>
                    <div style="font-size: 13px; color: #555555; line-height: 1.5;">
                      <p style="margin: 0 0 4px 0;"><strong>開始時間:</strong> ${startDate}</p>
                      <p style="margin: 0;"><strong>施工金額:</strong> ${contractAmount}</p>
                    </div>
                  </div>
                `;

                const infoWindow = new InfoWindow({
                  content: contentString,
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
          } else if (status === window.google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            console.warn(`Geocoding OVER_QUERY_LIMIT for project: ${projectAddress}. Consider a more robust queue or reduce frequency.`);
          } else if (status !== window.google.maps.GeocoderStatus.ZERO_RESULTS) { // Don't log error for no results
            console.error(`Geocode was not successful for project ${project.project_name} (${projectAddress}): ${status}`);
          }
        });
      }, index * geocodeDelay); // Stagger requests
    });

  }, [mapReady, mainMarkerPosition, circleRadius, projects, mapInstanceRef]); // Added mapInstanceRef to dependencies


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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
          label="Search Location"
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
          Search
        </Button>
      </Box>

      <Box sx={{ mb: 2, px: 1 }}>
        <Typography gutterBottom>Circle Radius: {circleRadius}m</Typography>
        <Slider
          value={circleRadius}
          onChange={handleSliderChange}
          aria-labelledby="circle-radius-slider"
          valueLabelDisplay="auto"
          step={50} 
          min={0}
          max={2000} 
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
