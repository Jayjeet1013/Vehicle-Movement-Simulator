"use client";

import dynamic from "next/dynamic";

// Dynamically import VehicleMap to avoid SSR issues with Leaflet
const VehicleMap = dynamic(() => import("../components/VehicleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-600">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🚌 School Bus Tracker
            </h1>
            <div className="text-sm text-gray-600">
              Real-time Vehicle Movement Simulation
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Live Vehicle Tracking
            </h2>
            <p className="text-gray-600 mb-6">
              Watch the school bus move along its predefined route. Use the
              controls below the map to play, pause, or reset the simulation.
            </p>

            {/* Map Container */}
            <div className="h-[70vh] w-full">
              <VehicleMap className="h-full" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              📍 Real-time Position
            </div>
            <p className="text-gray-600 text-sm">
              Track the exact coordinates of the vehicle as it moves along the
              route
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              🛣️ Route Visualization
            </div>
            <p className="text-gray-600 text-sm">
              See the complete route path and progress as the vehicle advances
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              ⚡ Speed & Time
            </div>
            <p className="text-gray-600 text-sm">
              Monitor vehicle speed and elapsed time with detailed metrics
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
