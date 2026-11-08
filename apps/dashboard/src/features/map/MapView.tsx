import {
  AttributionControl,
  GeoJSONSource,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import type { KelurahanPropertiesPeta } from "@/engine/planner";
import type { NodeProperties } from "@/services/geoService";
import type { MapLayers } from "./mapLayers";

export type MapViewMode = "ciliwung" | "pesanggrahan" | "jabodetabek";

type MapViewProps = {
  nodes: FeatureCollection<Point, NodeProperties>;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  onError: () => void;
  mode3d: boolean;
  layers: MapLayers;
  theme: "dark" | "light";
  view: MapViewMode;
  exaggeration: number;
  kelurahan?: FeatureCollection<Polygon | MultiPolygon, KelurahanPropertiesPeta>;
  onSelectKelurahan?: (kode: string) => void;
};

const PUSAT: Record<MapViewMode, { center: [number, number]; zoom: number }> = {
  ciliwung: { center: [106.8456, -6.3], zoom: 10.3 },
  pesanggrahan: { center: [106.755, -6.29], zoom: 11 },
  jabodetabek: { center: [106.82, -6.35], zoom: 8.7 },
};

const palet = {
  dark: {
    latar: "#07111f",
    garis: "#38bdf8",
    kecamatanLine: "#38bdf8",
    kecamatanFill: "#0ea5e9",
    sungai: "#22d3ee",
    kabupaten: "#cbd5e1",
    provinsi: "#c4b5fd",
  },
  light: {
    latar: "#e6f0f8",
    garis: "#0284c7",
    kecamatanLine: "#075985",
    kecamatanFill: "#38bdf8",
    sungai: "#0e7490",
    kabupaten: "#334155",
    provinsi: "#6d28d9",
  },
} as const;

const BASE = import.meta.env.BASE_URL;

const SUMBER_GEO = {
  kecamatan: `${BASE}geo/kecamatan-koridor.geojson`,
  kabupaten: `${BASE}geo/kabupaten-jabodetabek.geojson`,
  provinsi: `${BASE}geo/provinsi-jabodetabek.geojson`,
  scope: `${BASE}geo/scope-koridor.geojson`,
  ciliwung: `${BASE}geo/ciliwung.geojson`,
  pesanggrahan: `${BASE}geo/pesanggrahan.geojson`,
  alur: `${BASE}geo/koridor-edges.geojson`,
};

function buatStyle(theme: "dark" | "light"): StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 19,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      { id: "latar", type: "background", paint: { "background-color": palet[theme].latar } },
      { id: "osm", type: "raster", source: "osm", paint: { "raster-opacity": 0.9 } },
    ],
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MapView({
  nodes,
  selectedId,
  onSelectNode,
  onError,
  mode3d,
  layers,
  theme,
  view,
  exaggeration,
  kelurahan,
  onSelectKelurahan,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [siap, setSiap] = useState(false);

  const onSelectRef = useRef(onSelectNode);
  const onErrorRef = useRef(onError);
  const onSelectKelurahanRef = useRef(onSelectKelurahan);

  useEffect(() => {
    onSelectRef.current = onSelectNode;
    onErrorRef.current = onError;
    onSelectKelurahanRef.current = onSelectKelurahan;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: buatStyle(theme),
        center: PUSAT[view].center,
        zoom: PUSAT[view].zoom,
        attributionControl: false,
      });
    } catch {
      onErrorRef.current();
      return;
    }

    mapRef.current = map;
    if (import.meta.env.DEV) {
      (window as typeof window & { __hydrotwinMap?: MapLibreMap }).__hydrotwinMap = map;
    }
    map.addControl(new NavigationControl({ showCompass: true }), "top-left");
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: "© OpenStreetMap contributors · DEMNAS (BIG)",
      }),
    );
    map.on("webglcontextlost", () => onErrorRef.current());

    let frame = 0;
    const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 12 });
    const style = palet[theme];

    const kosong = { type: "FeatureCollection", features: [] } as FeatureCollection;

    map.on("load", () => {
      for (const nama of [
        "kecamatan",
        "kabupaten",
        "provinsi",
        "scope",
        "ciliwung",
        "pesanggrahan",
        "alur",
        "kelurahan",
      ]) {
        map.addSource(nama, { type: "geojson", data: kosong });
      }
      map.addSource("dem", {
        type: "raster-dem",
        tiles: [`${BASE}terrain/{z}/{x}/{y}.png`],
        tileSize: 256,
        minzoom: 10,
        maxzoom: 13,
        encoding: "mapbox",
      });
      // Source terpisah untuk hillshade agar tidak berebut cache dengan terrain.
      map.addSource("dem-hillshade", {
        type: "raster-dem",
        tiles: [`${BASE}terrain/{z}/{x}/{y}.png`],
        tileSize: 256,
        minzoom: 10,
        maxzoom: 13,
        encoding: "mapbox",
      });
      map.addSource("nodes", { type: "geojson", data: nodes });

      // Masker: basemap hanya tampil di luar cakupan agar data terbaca jelas.
      map.addLayer({
        id: "scope-mask",
        type: "fill",
        source: "scope",
        paint: { "fill-color": style.latar, "fill-opacity": 0.9 },
      });
      map.addLayer({
        id: "terrain-hillshade",
        type: "hillshade",
        source: "dem-hillshade",
        layout: { visibility: "none" },
        paint: {
          "hillshade-exaggeration": 0.7,
          "hillshade-shadow-color": "#000000",
          "hillshade-highlight-color": "#ffffff",
        },
      });
      map.addLayer({
        id: "provinsi-line",
        type: "line",
        source: "provinsi",
        paint: {
          "line-color": style.provinsi,
          "line-width": 2.6,
          "line-dasharray": [5, 2],
          "line-opacity": 0.95,
        },
      });
      map.addLayer({
        id: "kabupaten-line",
        type: "line",
        source: "kabupaten",
        paint: { "line-color": style.kabupaten, "line-width": 1.4, "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "kecamatan-fill",
        type: "fill",
        source: "kecamatan",
        paint: { "fill-color": style.kecamatanFill, "fill-opacity": 0.18 },
      });
      map.addLayer({
        id: "kecamatan-line",
        type: "line",
        source: "kecamatan",
        paint: {
          "line-color": style.kecamatanLine,
          "line-opacity": 0.6,
          "line-width": 1.1,
        },
      });
      map.addLayer({
        id: "kelurahan-fill",
        type: "fill",
        source: "kelurahan",
        layout: { visibility: "none" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "kedalamanM"],
            0,
            "#dbeafe",
            0.2,
            "#7dd3fc",
            0.45,
            "#fde047",
            0.7,
            "#fb923c",
            1,
            "#ef4444",
            1.5,
            "#991b1b",
          ],
          "fill-opacity": 0.78,
        },
      });
      map.addLayer({
        id: "kelurahan-line",
        type: "line",
        source: "kelurahan",
        layout: { visibility: "none" },
        paint: { "line-color": "#ffffff", "line-width": 0.8, "line-opacity": 0.75 },
      });
      map.addLayer({
        id: "ciliwung-glow",
        type: "line",
        source: "ciliwung",
        paint: { "line-color": style.sungai, "line-width": 11, "line-opacity": 0.22 },
      });
      map.addLayer({
        id: "ciliwung-line",
        type: "line",
        source: "ciliwung",
        paint: { "line-color": style.sungai, "line-width": 3, "line-opacity": 0.95 },
      });
      map.addLayer({
        id: "alur-line",
        type: "line",
        source: "alur",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": style.garis, "line-width": 4.5, "line-opacity": 0.95 },
      });
      map.addLayer({
        id: "pesanggrahan-glow",
        type: "line",
        source: "pesanggrahan",
        paint: { "line-color": "#818cf8", "line-width": 11, "line-opacity": 0.22 },
      });
      map.addLayer({
        id: "pesanggrahan-line",
        type: "line",
        source: "pesanggrahan",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#818cf8", "line-width": 3, "line-opacity": 0.95 },
      });
      map.addLayer({
        id: "nodes-halo",
        type: "circle",
        source: "nodes",
        filter: ["==", ["get", "level"], "siaga"],
        paint: { "circle-color": "#ef4444", "circle-opacity": 0.28, "circle-radius": 14 },
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
          "circle-stroke-color": style.garis,
          "circle-stroke-width": 3,
        },
      });

      const tunjukKursor = () => {
        map.getCanvas().style.cursor = "pointer";
      };
      const lepasKursor = () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      };

      map.on("mouseenter", "nodes-circle", tunjukKursor);
      map.on("mouseleave", "nodes-circle", lepasKursor);
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

      // Hover nama wilayah agar peta mudah dibaca.
      const labelWilayah = (event: {
        lngLat: { lng: number; lat: number };
        features?: unknown[];
      }) => {
        const fitur = (event.features?.[0] ?? null) as {
          geometry?: { type: string };
          properties?: Record<string, string>;
        } | null;
        if (!fitur?.properties) return;
        const p = fitur.properties;
        const teks = p.kecamatan
          ? `${p.kecamatan} · ${p.kotaKab ?? ""}`
          : `${p.kabupaten ?? p.provinsi ?? ""} · ${p.provinsi ?? ""}`;
        popup.setLngLat(event.lngLat).setText(teks).addTo(map);
      };

      map.on("mousemove", "kecamatan-fill", (event) => {
        map.getCanvas().style.cursor = "crosshair";
        labelWilayah(event);
      });
      map.on("mouseleave", "kecamatan-fill", lepasKursor);

      // Heatmap kedalaman per kelurahan.
      map.on("mousemove", "kelurahan-fill", (event) => {
        const fitur = event.features?.[0];
        const p = fitur?.properties as
          | { kelurahan?: string; kecamatan?: string; kedalamanM?: number; rw?: number }
          | undefined;
        if (!p) return;
        map.getCanvas().style.cursor = "pointer";
        popup
          .setLngLat(event.lngLat)
          .setText(
            `${p.kelurahan ?? ""} · ${p.kecamatan ?? ""}\n` +
              `${Number(p.kedalamanM ?? 0).toFixed(2)} m · ${p.rw ?? 0} RW`,
          )
          .addTo(map);
      });
      map.on("mouseleave", "kelurahan-fill", lepasKursor);
      map.on("click", "kelurahan-fill", (event) => {
        const kode = event.features?.[0]?.properties?.kode;
        if (typeof kode === "string") onSelectKelurahanRef.current?.(kode);
      });
      map.on("mousemove", "kabupaten-line", labelWilayah);
      map.on("mouseleave", "kabupaten-line", () => popup.remove());
      map.on("mousemove", "ciliwung-line", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "ciliwung-line", lepasKursor);

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

      // Batas administrasi digambar di atas heatmap agar tetap terbaca.
      for (const id of ["provinsi-line", "kabupaten-line", "kecamatan-line"]) {
        if (map.getLayer(id) && map.getLayer("ciliwung-glow")) {
          map.moveLayer(id, "ciliwung-glow");
        }
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

    const muat = (nama: string, url: string) =>
      fetch(url)
        .then((response) => response.json())
        .then((data) => (map.getSource(nama) as GeoJSONSource | undefined)?.setData(data))
        .catch(() => console.warn(`Layer ${nama} tidak dapat dimuat`));

    void Promise.all(Object.entries(SUMBER_GEO).map(([nama, url]) => muat(nama, url)));
  }, [siap]);

  useEffect(() => {
    if (!siap) return;
    (mapRef.current?.getSource("nodes") as GeoJSONSource | undefined)?.setData(nodes);
  }, [nodes, siap]);

  useEffect(() => {
    if (!siap) return;
    const source = mapRef.current?.getSource("kelurahan") as GeoJSONSource | undefined;
    source?.setData(kelurahan ?? { type: "FeatureCollection", features: [] });
  }, [kelurahan, siap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    const p = palet[theme];
    map.setPaintProperty("latar", "background-color", p.latar);
    map.setPaintProperty("scope-mask", "fill-color", p.latar);
    map.setPaintProperty("kecamatan-line", "line-color", p.kecamatanLine);
    map.setPaintProperty("alur-line", "line-color", p.garis);
    map.setPaintProperty("nodes-terpilih", "circle-stroke-color", p.garis);
    map.setPaintProperty("ciliwung-line", "line-color", p.sungai);
    map.setPaintProperty("ciliwung-glow", "line-color", p.sungai);
    map.setPaintProperty("kabupaten-line", "line-color", p.kabupaten);
    map.setPaintProperty("provinsi-line", "line-color", p.provinsi);
  }, [theme, siap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    const tampil = (aktif: boolean) => (aktif ? "visible" : "none");
    const modeCiliwung = view === "ciliwung" || view === "jabodetabek";
    const modePesanggrahan = view === "pesanggrahan" || view === "jabodetabek";

    map.setLayoutProperty("alur-line", "visibility", tampil(layers.alur && modeCiliwung));
    map.setLayoutProperty("ciliwung-line", "visibility", tampil(layers.sungai && modeCiliwung));
    map.setLayoutProperty("ciliwung-glow", "visibility", tampil(layers.sungai && modeCiliwung));
    map.setLayoutProperty(
      "pesanggrahan-line",
      "visibility",
      tampil(layers.sungai && modePesanggrahan),
    );
    map.setLayoutProperty(
      "pesanggrahan-glow",
      "visibility",
      tampil(layers.sungai && modePesanggrahan),
    );
    map.setLayoutProperty("nodes-halo", "visibility", tampil(layers.node && modeCiliwung));
    map.setLayoutProperty("nodes-circle", "visibility", tampil(layers.node && modeCiliwung));
    map.setLayoutProperty("nodes-terpilih", "visibility", tampil(layers.node && modeCiliwung));
    map.setLayoutProperty("kecamatan-fill", "visibility", tampil(layers.kecamatan));
    map.setLayoutProperty("kecamatan-line", "visibility", tampil(layers.kecamatan));
    const kelurahanAktif = layers.kedalaman && Boolean(kelurahan);
    map.setLayoutProperty("kelurahan-fill", "visibility", tampil(kelurahanAktif));
    map.setLayoutProperty("kelurahan-line", "visibility", tampil(kelurahanAktif));
    map.setLayoutProperty("scope-mask", "visibility", tampil(layers.masker));
    map.setLayoutProperty("kabupaten-line", "visibility", tampil(layers.batas));
    map.setLayoutProperty("provinsi-line", "visibility", tampil(layers.batas));
  }, [layers, siap, view, kelurahan]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    map.setFilter("nodes-terpilih", ["==", ["get", "id"], selectedId ?? ""]);
  }, [selectedId, siap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    map.setTerrain(mode3d ? { source: "dem", exaggeration } : null);
    map.setLayoutProperty("terrain-hillshade", "visibility", mode3d ? "visible" : "none");
    map.easeTo({
      pitch: mode3d ? 55 : 0,
      bearing: mode3d ? -12 : 0,
      duration: prefersReducedMotion() ? 0 : 700,
    });
  }, [mode3d, siap, exaggeration]);

  useEffect(() => {
    const map = mapRef.current;
    if (!siap || !map) return;
    map.easeTo({
      ...PUSAT[view],
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      duration: prefersReducedMotion() ? 0 : 800,
    });
  }, [view, siap]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Peta jaringan pemantauan koridor Ciliwung"
      className="border-border/60 h-[420px] w-full overflow-hidden rounded-xl border"
    />
  );
}
