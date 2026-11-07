import {
  GeoJSONSource,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, LineString, Point } from "geojson";
import type { EdgeProperties, NodeProperties } from "@/services/geoService";
import type { MapLayers } from "./mapLayers";

type MapViewProps = {
  nodes: FeatureCollection<Point, NodeProperties>;
  edges: FeatureCollection<LineString, EdgeProperties>;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  onError: () => void;
  mode3d: boolean;
  layers: MapLayers;
  theme: "dark" | "light";
};

const KORIDOR_CENTER: [number, number] = [106.8456, -6.3];
const KORIDOR_ZOOM = 10.3;

const palet = {
  dark: { latar: "#07111f", garis: "#38bdf8", kecamatanLine: "#38bdf8", kecamatanFill: "#0ea5e9" },
  light: { latar: "#e6f0f8", garis: "#0284c7", kecamatanLine: "#0369a1", kecamatanFill: "#38bdf8" },
} as const;

function buatStyle(theme: "dark" | "light"): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      {
        id: "latar",
        type: "background",
        paint: { "background-color": palet[theme].latar },
      },
    ],
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MapView({
  nodes,
  edges,
  selectedId,
  onSelectNode,
  onError,
  mode3d,
  layers,
  theme,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [siap, setSiap] = useState(false);

  const onSelectRef = useRef(onSelectNode);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSelectRef.current = onSelectNode;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: buatStyle(theme),
        center: KORIDOR_CENTER,
        zoom: KORIDOR_ZOOM,
        attributionControl: false,
      });
    } catch {
      onErrorRef.current();
      return;
    }

    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: true }), "top-left");
    map.on("error", () => onErrorRef.current());

    let frame = 0;
    const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 12 });

    map.on("load", () => {
      map.addSource("kecamatan", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addSource("edges", { type: "geojson", data: edges });
      map.addSource("nodes", { type: "geojson", data: nodes });

      map.addLayer({
        id: "kecamatan-fill",
        type: "fill",
        source: "kecamatan",
        paint: { "fill-color": palet[theme].kecamatanFill, "fill-opacity": 0.1 },
      });
      map.addLayer({
        id: "kecamatan-3d",
        type: "fill-extrusion",
        source: "kecamatan",
        layout: { visibility: "none" },
        paint: {
          "fill-extrusion-color": palet[theme].kecamatanFill,
          "fill-extrusion-height": 120,
          "fill-extrusion-opacity": 0.28,
        },
      });
      map.addLayer({
        id: "kecamatan-line",
        type: "line",
        source: "kecamatan",
        paint: {
          "line-color": palet[theme].kecamatanLine,
          "line-opacity": 0.45,
          "line-width": 0.8,
        },
      });
      map.addLayer({
        id: "edges-line",
        type: "line",
        source: "edges",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": palet[theme].garis,
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });
      map.addLayer({
        id: "nodes-halo",
        type: "circle",
        source: "nodes",
        filter: ["==", ["get", "level"], "siaga"],
        paint: { "circle-color": "#ef4444", "circle-opacity": 0.25, "circle-radius": 14 },
      });
      map.addLayer({
        id: "nodes-circle",
        type: "circle",
        source: "nodes",
        paint: {
          "circle-color": [
            "match",
            ["get", "level"],
            "aman",
            "#10b981",
            "waspada",
            "#f59e0b",
            "siaga",
            "#ef4444",
            "#94a3b8",
          ],
          "circle-radius": 8,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "nodes-terpilih",
        type: "circle",
        source: "nodes",
        filter: ["==", ["get", "id"], ""],
        paint: {
          "circle-radius": 14,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": palet[theme].garis,
          "circle-stroke-width": 3,
        },
      });

      map.on("mouseenter", "nodes-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "nodes-circle", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
      map.on("mousemove", "nodes-circle", (event) => {
        const fitur = event.features?.[0];
        if (!fitur || fitur.geometry.type !== "Point") return;
        popup
          .setLngLat(fitur.geometry.coordinates as [number, number])
          .setText(`${String(fitur.properties.nama)} · ${String(fitur.properties.debitM3s)} m³/s`)
          .addTo(map);
      });
      map.on("click", "nodes-circle", (event) => {
        const id = event.features?.[0]?.properties.id;
        if (typeof id === "string") onSelectRef.current(id);
      });

      if (!prefersReducedMotion()) {
        const mulai = performance.now();
        const animasi = () => {
          const t = (performance.now() - mulai) / 1000;
          const radius = 12 + 6 * (0.5 + 0.5 * Math.sin(t * 2.4));
          const opacity = 0.15 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2.4));
          map.setPaintProperty("nodes-halo", "circle-radius", radius);
          map.setPaintProperty("nodes-halo", "circle-opacity", opacity);
          frame = requestAnimationFrame(animasi);
        };
        frame = requestAnimationFrame(animasi);
      }

      setSiap(true);
    });

    return () => {
      cancelAnimationFrame(frame);
      popup.remove();
      map.remove();
      mapRef.current = null;
      setSiap(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    const kecamatanUrl = `${import.meta.env.BASE_URL}geo/kecamatan-koridor.geojson`;
    fetch(kecamatanUrl)
      .then((response) => response.json())
      .then((data) => (map.getSource("kecamatan") as GeoJSONSource | undefined)?.setData(data))
      .catch(() => console.warn("Batas kecamatan tidak dapat dimuat"));
  }, [siap]);

  useEffect(() => {
    if (!siap) return;
    (mapRef.current?.getSource("nodes") as GeoJSONSource | undefined)?.setData(nodes);
  }, [nodes, siap]);

  useEffect(() => {
    if (!siap) return;
    (mapRef.current?.getSource("edges") as GeoJSONSource | undefined)?.setData(edges);
  }, [edges, siap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    map.setPaintProperty("latar", "background-color", palet[theme].latar);
    map.setPaintProperty("kecamatan-line", "line-color", palet[theme].kecamatanLine);
    map.setPaintProperty("edges-line", "line-color", palet[theme].garis);
    map.setPaintProperty("nodes-terpilih", "circle-stroke-color", palet[theme].garis);
  }, [theme, siap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    const tampil = (aktif: boolean) => (aktif ? "visible" : "none");
    map.setLayoutProperty("edges-line", "visibility", tampil(layers.sungai));
    map.setLayoutProperty("nodes-halo", "visibility", tampil(layers.node));
    map.setLayoutProperty("nodes-circle", "visibility", tampil(layers.node));
    map.setLayoutProperty("nodes-terpilih", "visibility", tampil(layers.node));
    map.setLayoutProperty("kecamatan-fill", "visibility", tampil(layers.kecamatan));
    map.setLayoutProperty("kecamatan-line", "visibility", tampil(layers.kecamatan));
  }, [layers, siap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    map.setFilter("nodes-terpilih", ["==", ["get", "id"], selectedId ?? ""]);
  }, [selectedId, siap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    map.setLayoutProperty("kecamatan-3d", "visibility", mode3d ? "visible" : "none");
    map.easeTo({
      pitch: mode3d ? 55 : 0,
      bearing: mode3d ? -12 : 0,
      duration: prefersReducedMotion() ? 0 : 700,
    });
  }, [mode3d, siap]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Peta jaringan pemantauan koridor Ciliwung"
      className="border-border/60 h-[420px] w-full overflow-hidden rounded-xl border"
    />
  );
}
