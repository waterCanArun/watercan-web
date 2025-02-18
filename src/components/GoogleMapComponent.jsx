import React, { useState, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import pin from "./pin.png";
import { useProductList } from "../contexts/ProductList";
import { WIFI } from "../constant";

const containerStyle = {
  width: "100%",
  height: "300px",
};

function GoogleMapComponent() {
  const [map, setMap] = useState(null);
  const { coords, setCoords } = useProductList();
  const fallbackCoords = { lat: 26.9124, lng: 75.7873 }; // Default location -----> Jaipur

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        if ("permissions" in navigator) {
          const permissionStatus = await navigator.permissions.query({
            name: "geolocation",
          });

          if (permissionStatus.state === "denied") {
            console.warn("Geolocation permission denied by the user.");
            setCoords([fallbackCoords.lat, fallbackCoords.lng]); // Set fallback coordinates
            return;
          }
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              setCoords([latitude, longitude]);
            },
            (error) => {
              console.error("Error occurred. Error code: " + error.code);
              setCoords([fallbackCoords.lat, fallbackCoords.lng]); // Fallback to default if error occurs
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
          setCoords([fallbackCoords.lat, fallbackCoords.lng]); // Fallback to default if geolocation is not supported
        }
      } catch (error) {
        console.error("Error during location fetching:", error);
        setCoords([fallbackCoords.lat, fallbackCoords.lng]); // Fallback to default on error
      }
    };

    fetchCurrentLocation();
  }, [setCoords]);

  const onMapLoad = (map) => {
    setMap(map);
  };

  const onMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setCoords([lat, lng]);
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={coords ? { lat: coords[0], lng: coords[1] } : fallbackCoords}
      zoom={15}
      onLoad={onMapLoad}
      onClick={onMapClick}
      apiKey={WIFI}
    >
      {coords && (
        <Marker
          position={{ lat: coords[0], lng: coords[1] }}
          icon={{
            url: pin,
            scaledSize: new window.google.maps.Size(32, 32),
          }}
        />
      )}
    </GoogleMap>
  );
}

export default GoogleMapComponent;
