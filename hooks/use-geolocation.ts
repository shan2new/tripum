"use client";

import { useState, useEffect, useCallback } from "react";

export interface GeoPosition {
  lat: number;
  lon: number;
  accuracy: number; // meters
  speed: number | null; // m/s
  heading: number | null; // degrees
  timestamp: number;
}

interface UseGeolocationResult {
  position: GeoPosition | null;
  error: string | null;
  watching: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * Watch the user's geolocation. Returns null until permission is granted
 * and a fix is acquired. Automatically stops when the component unmounts.
 */
export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const stop = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setWatching(false);
  }, [watchId]);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }

    setWatching(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      (err) => {
        setError(
          err.code === 1 ? "Permission denied" :
          err.code === 2 ? "Position unavailable" :
          "Timeout"
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 15_000,
      }
    );

    setWatchId(id);
  }, []);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return { position, error, watching, start, stop };
}

/* ─── Route projection utilities ─── */

/** Haversine distance in km between two lat/lon points */
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Waypoint {
  lat: number;
  lon: number;
  km: number;
}

/**
 * Project a lat/lon onto the route defined by waypoints.
 * Returns the estimated km along the route, plus the distance
 * from the route (how far off-road the user is).
 */
export function projectOntoRoute(
  lat: number,
  lon: number,
  waypoints: Waypoint[]
): { routeKm: number; offRouteKm: number } {
  let bestKm = 0;
  let bestOff = Infinity;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];

    // Project onto the segment a→b
    const dAB = haversineKm(a.lat, a.lon, b.lat, b.lon);
    if (dAB === 0) continue;

    const dAP = haversineKm(a.lat, a.lon, lat, lon);
    const dBP = haversineKm(b.lat, b.lon, lat, lon);

    // Parameter t along segment (clamped 0-1)
    // Using the cosine rule approximation
    const t = Math.max(0, Math.min(1,
      (dAP * dAP - dBP * dBP + dAB * dAB) / (2 * dAB * dAB)
    ));

    // Interpolated point on segment
    const interpLat = a.lat + t * (b.lat - a.lat);
    const interpLon = a.lon + t * (b.lon - a.lon);
    const offRoute = haversineKm(lat, lon, interpLat, interpLon);

    if (offRoute < bestOff) {
      bestOff = offRoute;
      bestKm = a.km + t * (b.km - a.km);
    }
  }

  return { routeKm: bestKm, offRouteKm: bestOff };
}
