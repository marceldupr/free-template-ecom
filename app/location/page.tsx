"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useStore } from "@/components/StoreContext";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

/** Default pin SVG so the marker always renders (Leaflet's default icon often fails in Next.js). */
const DEFAULT_PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42"><path fill="%2338bdf8" stroke="%230f172a" stroke-width="1.5" d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 6.5 8.5 15.5 8.5 15.5s8.5-9 8.5-15.5C20.5 3.81 16.69 0 12 0z"/><circle cx="12" cy="8.5" r="3" fill="%23fff"/></svg>';

function DraggableMapContent({
  position,
  onPositionChange,
}: {
  position: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const L = typeof window !== "undefined" ? require("leaflet") : null;
  if (!L) return null;

  const markerIcon = L.divIcon({
    html: DEFAULT_PIN_SVG,
    className: "aurora-location-pin",
    iconSize: [28, 42],
    iconAnchor: [14, 42],
  });

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[position.lat, position.lng]}
        icon={markerIcon}
        eventHandlers={{
          dragend: (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
            const { lat, lng } = e.target.getLatLng();
            onPositionChange(lat, lng);
          },
        }}
        draggable
      >
        <Popup>Drag to move pin</Popup>
      </Marker>
    </>
  );
}

export default function LocationPage() {
  const router = useRouter();
  const { setLocation } = useStore();
  const [position, setPosition] = useState({ lat: 51.5074, lng: -0.1278 });
  const [address, setAddress] = useState("Waterloo Station, London SE1, UK");

  const handleSetLocation = useCallback(() => {
    setLocation({
      lat: position.lat,
      lng: position.lng,
      address,
    });
    router.push("/stores");
  }, [position, address, setLocation, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 border-b border-aurora-border bg-aurora-bg/95 flex items-center gap-4">
        <Link href="/stores" className="text-aurora-muted hover:text-white" aria-label="Back">
          ←
        </Link>
        <h1 className="text-xl font-bold flex-1">Set Your Location</h1>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        <div>
          <label htmlFor="address" className="sr-only">
            Address search
          </label>
          <input
            id="address"
            type="text"
            placeholder="Type your address here..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-component bg-aurora-surface border border-aurora-border text-white placeholder:text-aurora-muted"
          />
        </div>

        <div className="flex-1 min-h-[300px] rounded-component overflow-hidden border border-aurora-border [&_.leaflet-container]:!h-full">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            className="w-full h-full"
            style={{ minHeight: 300 }}
          >
            <DraggableMapContent
              position={position}
              onPositionChange={(lat, lng) => setPosition({ lat, lng })}
            />
          </MapContainer>
        </div>

        <div className="flex items-start gap-2 text-aurora-muted text-sm">
          <span>📍</span>
          <span>
            {address}
            <br />
            Move the map to position the pin at your delivery location.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSetLocation}
          className="w-full py-4 rounded-component bg-aurora-accent text-aurora-bg font-bold hover:opacity-90"
        >
          Set Location
        </button>
      </div>
    </div>
  );
}
