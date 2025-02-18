import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import proj4 from 'proj4';
import pin from './pin.png';
import 'ol/ol.css';
import { useProductList } from '../contexts/ProductList';

function MapComponent() {
    const mapRef = useRef(null);
    const overlayRef = useRef(null);
    const {coords,setCoords} = useProductList()
    useEffect(() => {
        // Define the projection definitions for EPSG:3857 and EPSG:900913
        proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
        proj4.defs('EPSG:900913', proj4.defs('EPSG:3857'));

        const osmLayer = new TileLayer({
            preload: Infinity,
            source: new OSM(),
        });

        const map = new Map({
            target: mapRef.current,
            layers: [osmLayer],
            view: new View({
                // center: fromLonLat([78.9629, 20.5937]), // Centered on India
                center: fromLonLat([74.9524, 28.2151]), // Ratan Nagar Churu
                zoom: 10, // Initial zoom level
            }),
        });

        const overlay = new Overlay({
            element: overlayRef.current,
            positioning: 'center-center',
            offset: [0, -20], // Offset to adjust the pin position
        });
        map.addOverlay(overlay);

        // Add event listener to map for pin drop functionality
        map.on('click', (event) => {
            const openLayersCoords = event.coordinate; // Coordinates where the user clicked
            const googleMapsCoords = proj4('EPSG:3857', 'EPSG:4326', openLayersCoords); // Convert to Google Maps coordinates
            setCoords([googleMapsCoords[1],googleMapsCoords[0]])
            overlay.setPosition(openLayersCoords); // Set the pin position
        });

        // Clean up function to remove the map when the component unmounts
        return () => {
            map.setTarget(null);
        };
    }, []);

    return (
        <div style={{ height: '300px', width: '100%' }} ref={mapRef} className="map-container">
            <div ref={overlayRef} className="overlay-container">
                {/* Pin image */}
                <img src={pin} alt="Pin" style={{ width: '32px', height: '32px' }} />
            </div>
        </div>
    );
}

export default MapComponent;

