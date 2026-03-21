import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Smartphone, Building2 } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ290aGFtLXRlc3QiLCJhIjoiY2x0em5hOG5oMG9sMzJqcGR2YWFobmpqYSJ9.abc123mocktoken456';

export function GeospatialViewer({ caseId }: { caseId: string }) {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/cases/${caseId}/map`)
      .then(res => res.json())
      .then(data => {
        setEntities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [caseId]);

  if (loading) return <div className="h-full w-full flex items-center justify-center text-zinc-500 animate-pulse">Loading Geospatial Analysis...</div>;

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-[#27272a] shadow-inner shadow-[#000]">
      <Map
        initialViewState={{
          longitude: -74.006, 
          latitude: 40.7128,
          zoom: 11
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {entities.map(entity => (
          <Marker 
            key={entity.id} 
            longitude={entity.longitude} 
            latitude={entity.latitude} 
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(entity);
            }}
          >
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] cursor-pointer hover:bg-red-500 hover:text-white transition-all">
               {entity.type === 'DEVICE' ? <Smartphone size={14} /> : entity.type === 'LOCATION' ? <Building2 size={14} /> : <MapPin size={14} />}
            </div>
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
            className="text-black"
          >
            <div className="font-bold p-1">
                <div className="text-sm font-black">{popupInfo.display_name}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-600 mt-1 pb-1 border-b border-zinc-200">Type: {popupInfo.type}</div>
                <div className="text-xs text-red-600 mt-2 font-semibold">Risk: {popupInfo.confidence_score}</div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
