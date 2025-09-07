"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";

// Define the structure for route points
interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface VehicleMapProps {
  className?: string;
}

const VehicleMap: React.FC<VehicleMapProps> = ({ className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const completedRouteRef = useRef<L.Polyline | null>(null);

  const [routeData, setRouteData] = useState<RoutePoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<RoutePoint | null>(
    null
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load route data
  useEffect(() => {
    const loadRouteData = async () => {
      try {
        const response = await fetch("/dummy-route.json");
        const data: RoutePoint[] = await response.json();
        setRouteData(data);
        if (data.length > 0) {
          setCurrentPosition(data[0]);
        }
      } catch (error) {
        console.error("Error loading route data:", error);
      }
    };

    loadRouteData();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Fix for default markers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current).setView([17.385044, 78.486671], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Initialize vehicle marker and route when data is loaded
  useEffect(() => {
    if (!mapInstanceRef.current || routeData.length === 0) return;

    const map = mapInstanceRef.current;

    // Create custom vehicle icon
    const vehicleIcon = L.divIcon({
      className: "vehicle-marker",
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Create vehicle marker
    const vehicleMarker = L.marker(
      [routeData[0].latitude, routeData[0].longitude],
      {
        icon: vehicleIcon,
      }
    ).addTo(map);

    vehicleMarkerRef.current = vehicleMarker;

    // Create full route polyline (light gray)
    const allCoordinates: L.LatLngTuple[] = routeData.map((point) => [
      point.latitude,
      point.longitude,
    ]);
    const routePolyline = L.polyline(allCoordinates, {
      color: "#d1d5db",
      weight: 4,
      opacity: 0.7,
    }).addTo(map);

    routePolylineRef.current = routePolyline;

    // Create completed route polyline (blue)
    const completedRoute = L.polyline([], {
      color: "#3b82f6",
      weight: 4,
      opacity: 0.9,
    }).addTo(map);

    completedRouteRef.current = completedRoute;

    // Fit map to route bounds
    map.fitBounds(routePolyline.getBounds(), { padding: [20, 20] });
  }, [routeData]);

  // Calculate speed between two points
  const calculateSpeed = (point1: RoutePoint, point2: RoutePoint): number => {
    const time1 = new Date(point1.timestamp).getTime();
    const time2 = new Date(point2.timestamp).getTime();
    const timeDiff = (time2 - time1) / 1000; // seconds

    if (timeDiff === 0) return 0;

    // Calculate distance using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance / timeDiff; // Speed in m/s
  };

  // Animation logic
  useEffect(() => {
    if (!isPlaying || currentIndex >= routeData.length - 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;

        if (newIndex < routeData.length) {
          const currentPoint = routeData[newIndex];
          setCurrentPosition(currentPoint);

          // Update vehicle marker position
          if (vehicleMarkerRef.current) {
            vehicleMarkerRef.current.setLatLng([
              currentPoint.latitude,
              currentPoint.longitude,
            ]);
          }

          // Update completed route
          if (completedRouteRef.current) {
            const completedCoordinates: L.LatLngTuple[] = routeData
              .slice(0, newIndex + 1)
              .map((point) => [point.latitude, point.longitude]);
            completedRouteRef.current.setLatLngs(completedCoordinates);
          }

          // Calculate elapsed time
          const startTime = new Date(routeData[0].timestamp).getTime();
          const currentTime = new Date(currentPoint.timestamp).getTime();
          setElapsedTime((currentTime - startTime) / 1000);

          // Calculate speed
          if (newIndex > 0) {
            const calculatedSpeed = calculateSpeed(
              routeData[newIndex - 1],
              currentPoint
            );
            setSpeed(calculatedSpeed);
          }

          return newIndex;
        } else {
          setIsPlaying(false);
          return prevIndex;
        }
      });
    }, 2000); // Update every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, currentIndex, routeData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setElapsedTime(0);
    setSpeed(0);

    if (routeData.length > 0) {
      setCurrentPosition(routeData[0]);

      // Reset vehicle marker
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng([
          routeData[0].latitude,
          routeData[0].longitude,
        ]);
      }

      // Reset completed route
      if (completedRouteRef.current) {
        completedRouteRef.current.setLatLngs([
          [routeData[0].latitude, routeData[0].longitude],
        ]);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatSpeed = (speedMs: number): string => {
    const speedKmh = speedMs * 3.6; // Convert m/s to km/h
    return `${speedKmh.toFixed(1)} km/h`;
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Map Container */}
      <div className="flex-1 relative">
        <div
          ref={mapRef}
          className="w-full h-full min-h-[400px] rounded-lg shadow-lg"
        />
      </div>

      {/* Controls and Information Panel */}
      <div className="bg-white p-4 shadow-lg rounded-lg mt-4">
        {/* Controls */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            onClick={handlePlayPause}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isPlaying
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            disabled={currentIndex >= routeData.length - 1}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Information Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-700">Current Position</div>
            <div className="text-gray-600">
              {currentPosition ? (
                <>
                  <div>Lat: {currentPosition.latitude.toFixed(6)}</div>
                  <div>Lng: {currentPosition.longitude.toFixed(6)}</div>
                </>
              ) : (
                "Loading..."
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-700">Elapsed Time</div>
            <div className="text-gray-600">{formatTime(elapsedTime)}</div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-700">Speed</div>
            <div className="text-gray-600">{formatSpeed(speed)}</div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-700">Progress</div>
            <div className="text-gray-600">
              {currentIndex + 1} / {routeData.length} points
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  routeData.length > 0
                    ? ((currentIndex + 1) / routeData.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleMap;
