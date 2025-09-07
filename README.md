
# 🚍 Vehicle Movement on a Map

<p align="center">
	<img src="public/globe.svg" alt="Map" width="80" />
</p>

<p align="center">
	<i>Simulate a vehicle moving on a map with live updates and route drawing</i>
</p>

---

## 📋 Objective

Build a frontend-only web application that simulates a vehicle moving on a map. The application displays the vehicle's live position and draws its route using dummy data.

---

## 🚦 Features

- **Map Integration**: Interactive map with a live-updating vehicle marker
- **Route Drawing**: Polyline showing the vehicle's path
- **Simulated Real-Time Movement**: Smooth, stepwise updates
- **Controls**: Play/Pause simulation
- **Metadata Display**: Current coordinate, elapsed time, speed (optional)
- **Responsive UI**: Works on desktop and mobile

---

## 🗺️ Requirements

### 1. Map Integration

- Use a mapping library (e.g., Google Maps JS API, Leaflet, Mapbox GL JS)
- Center map on a predefined route
- Place a vehicle marker that updates in simulated real-time
- Draw the route path using a polyline

### 2. Dummy Location Data

- Store route points in `public/dummy-route.json`:

```json
[
  {
    "latitude": 17.385044,
    "longitude": 78.486671,
    "timestamp": "2024-07-20T10:00:00Z"
  },
  {
    "latitude": 17.385045,
    "longitude": 78.486672,
    "timestamp": "2024-07-20T10:00:05Z"
  },
  {
    "latitude": 17.38505,
    "longitude": 78.48668,
    "timestamp": "2024-07-20T10:00:10Z"
  }
]
```

### 3. Simulated Real-Time Movement

- Update vehicle marker every few seconds
- Animate movement smoothly if possible
- Extend route path as vehicle moves

### 4. Interface & Features

- Play/Pause controls for simulation
- Optionally display:
  - Current coordinate
  - Elapsed time or timestamp
  - Speed (if timestamp is used)
- Responsive design for desktop & mobile

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 📁 Project Structure

- `src/components/VehicleMap.tsx` – Map and vehicle logic
- `public/dummy-route.json` – Dummy route data
- `src/app/` – App entry, layout, and global styles

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Leaflet](https://leafletjs.com/) or similar mapping library

---

