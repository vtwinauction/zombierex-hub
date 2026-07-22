/**
 * RouteMap — thin wrapper around Google Maps JS API.
 * Loads only in the browser (behind <ClientOnly>), never during SSR.
 * Emits map clicks and exposes ref-free onReady for parents that need the map.
 */
import { useEffect, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };
type Poi = { lat: number; lng: number; name?: string; kind?: string };
type CommunityPoi = { id?: string; lat: number; lng: number; name?: string; kind?: string };

let loaderPromise: Promise<any> | null = null;
function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (loaderPromise) return loaderPromise;
  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string;
  const channel = (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string) || "";
  if (!key) return Promise.reject(new Error("Missing maps key"));
  loaderPromise = new Promise((resolve, reject) => {
    (window as any).__rexInitMap = () => resolve((window as any).google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__rexInitMap${channel ? `&channel=${channel}` : ""}&libraries=places`;
    s.async = true;
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

export function RouteMap({
  path = [],
  pois = [],
  communityPois = [],
  onCommunityPoiClick,
  center,
  zoom = 8,
  interactive = true,
  onMapClick,
  className = "h-72 w-full",
  theme = "dark",
  userLocation,
  userHeading,
  recenterKey,
}: {
  path?: LatLng[];
  pois?: Poi[];
  communityPois?: CommunityPoi[];
  onCommunityPoiClick?: (p: CommunityPoi) => void;
  center?: LatLng;
  zoom?: number;
  interactive?: boolean;
  onMapClick?: (p: LatLng) => void;
  className?: string;
  theme?: "dark" | "light";
  userLocation?: LatLng | null;
  userHeading?: number | null;
  recenterKey?: number;
}) {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const userMarkerRef = useRef<any>(null);
  const communityMarkersRef = useRef<any[]>([]);

  // init
  useEffect(() => {
    let cancelled = false;
    console.log("[RouteMap] mount");
    loadGoogleMaps().then((g) => {
      if (cancelled || !containerRef.current) return;
      const first = path[0] ?? center ?? userLocation ?? { lat: 25.2048, lng: 55.2708 };
      mapRef.current = new g.maps.Map(containerRef.current, {
        center: first,
        zoom,
        disableDefaultUI: !interactive,
        gestureHandling: interactive ? "greedy" : "cooperative",
        clickableIcons: false,
        styles: theme === "light" ? [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ] : [
          { elementType: "geometry", stylers: [{ color: "#0f1114" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8a8f98" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0b0d10" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c1f24" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#05070a" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });

      if (onMapClick && interactive) {
        mapRef.current.addListener("click", (e: any) => {
          const lat = e.latLng.lat(); const lng = e.latLng.lng();
          onMapClick({ lat, lng });
        });
      }
      drawPath(g);
      drawPois(g);
      drawCommunity(g);
      drawUser(g);
    }).catch((e) => { console.error("[RouteMap] err", e); setErr(e.message); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // redraw when data changes
  useEffect(() => {
    if (!(window as any).google?.maps || !mapRef.current) return;
    drawPath((window as any).google);
    drawPois((window as any).google);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, pois]);

  useEffect(() => {
    if (!(window as any).google?.maps || !mapRef.current) return;
    drawCommunity((window as any).google);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityPois]);

  // user location updates
  useEffect(() => {
    if (!(window as any).google?.maps || !mapRef.current) return;
    drawUser((window as any).google);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, userHeading]);

  // external recenter to user
  useEffect(() => {
    if (recenterKey === undefined) return;
    if (!mapRef.current || !userLocation) return;
    mapRef.current.panTo(userLocation);
    mapRef.current.setZoom(15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterKey]);

  function drawPath(g: any) {
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (!path.length) return;
    polylineRef.current = new g.maps.Polyline({
      path,
      strokeColor: "#c6ff3d",
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map: mapRef.current,
    });
    // fit bounds
    if (path.length > 1) {
      const b = new g.maps.LatLngBounds();
      path.forEach((p) => b.extend(p));
      mapRef.current.fitBounds(b, 40);
    } else {
      mapRef.current.setCenter(path[0]);
    }
  }

  function drawPois(g: any) {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    pois.forEach((p) => {
      const m = new g.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current,
        title: p.name ?? "",
        label: p.kind ? { text: iconForKind(p.kind), color: "#0b0d10", fontSize: "12px", fontWeight: "700" } : undefined,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#c6ff3d",
          fillOpacity: 1,
          strokeColor: "#0b0d10",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(m);
    });
  }

  function drawCommunity(g: any) {
    communityMarkersRef.current.forEach((m) => m.setMap(null));
    communityMarkersRef.current = [];
    communityPois.forEach((p) => {
      const m = new g.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current,
        title: p.name ?? "",
        label: p.kind ? { text: iconForKind(p.kind), color: "#ffffff", fontSize: "11px", fontWeight: "700" } : undefined,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: "#2563eb",
          fillOpacity: 0.95,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        zIndex: 500,
      });
      if (onCommunityPoiClick) {
        m.addListener("click", () => onCommunityPoiClick(p));
      }
      communityMarkersRef.current.push(m);
    });
  }

  function drawUser(g: any) {
    if (userMarkerRef.current) { userMarkerRef.current.setMap(null); userMarkerRef.current = null; }
    if (!userLocation) return;
    const heading = typeof userHeading === "number" ? userHeading : null;
    userMarkerRef.current = new g.maps.Marker({
      position: userLocation,
      map: mapRef.current,
      zIndex: 999,
      icon: heading !== null
        ? {
            path: "M0,-14 L8,10 L0,4 L-8,10 Z",
            fillColor: "#22c55e",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 1,
            rotation: heading,
            anchor: new g.maps.Point(0, 0),
          }
        : {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#22c55e",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
    });
  }

  if (err) {
    return (
      <div className={className + " grid place-items-center border border-white/10 text-xs text-white/60"}>
        Map unavailable — {err}
      </div>
    );
  }
  return <div ref={containerRef} className={className} style={{ background: "#0b0d10" }} />;
}

function iconForKind(k: string) {
  const map: Record<string, string> = { hotel: "H", food: "F", fuel: "⛽", scenic: "★", repair: "R", viewpoint: "◈", custom: "•" };
  return map[k] ?? "•";
}

export default RouteMap;
