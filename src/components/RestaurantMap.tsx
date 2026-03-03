import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RESTAURANTS } from '../data/restaurants';
import './RestaurantMap.css';

const DIVISION_COLORS: Record<string, string> = {
  East:  '#D94F1E',
  West:  '#F5A623',
  North: '#7BA5C9',
  South: '#5CB85C',
};

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker" style="background:${color}; box-shadow:0 0 10px ${color}80;"></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const SF_CENTER: [number, number] = [37.7699, -122.4469];

export default function RestaurantMap() {
  const plotted = RESTAURANTS.filter(r => r.coordinates);

  return (
    <div className="restaurant-map-wrapper">
      <div className="map-overlay-label">
        <h2 className="map-section-title">THE CONTENDERS</h2>
        <p className="map-section-subtitle">{plotted.length} San Francisco dumpling restaurants</p>
      </div>
      <div className="map-legend">
        {(Object.entries(DIVISION_COLORS) as [string, string][]).map(([division, color]) => (
          <div key={division} className="legend-entry">
            <span className="legend-dot" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
            {division}
          </div>
        ))}
      </div>
      <MapContainer
        center={SF_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="leaflet-map"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OSM</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        {plotted.map(r => (
          <Marker
            key={r.seed}
            position={[r.coordinates!.lat, r.coordinates!.lng]}
            icon={makeIcon(DIVISION_COLORS[r.division])}
          >
            <Popup className="map-popup">
              <span className="popup-seed">#{r.seed}</span>
              <strong className="popup-name">{r.name}</strong>
              <span className="popup-neighborhood">{r.neighborhood}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
