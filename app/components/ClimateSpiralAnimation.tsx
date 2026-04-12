'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

interface TemperatureEntry {
  year: number;
  month: number;
  anomaly: number;
}

const START_YEAR = 1995;
const END_YEAR = 2026;
const CAMERA_Z = 8;
const CAMERA_Z_COMPACT = 9;
const LINE_WIDTH = 2.25;
const BASE_RADIUS = 2.1; // radius at 0°C
const TEMP_SCALE = 0.85; // radius per °C
const SPIRAL_SCALE = 0.85; // 15% smaller overall
const DEPTH_RANGE = 3.6;
const MONTH_LABEL_FONT_COMPACT = 10;
const MONTH_LABEL_FONT_FULL = 10;
const TEMP_LABEL_FONT_COMPACT = 10;
const TEMP_LABEL_FONT_FULL = 10;

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;
const MONTH_LABELS_LOWER = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
const RING_VALUES = [-1, 0, 1] as const;
const RING_LABELS: Record<number, string> = {
  [-1]: '-1°C',
  0: '0°C',
  1: '+1°C',
};
const RING_LABEL_FONT = 10;
const ROTATION_YEAR_LABELS = [2025, 2015, 2005, 1995] as const;

const monthToAngle = (month: number) => {
  const fraction = (month - 1) / 12;
  return fraction * Math.PI * 2 - Math.PI / 2;
};

const parseTemperatureCsv = (text: string): TemperatureEntry[] => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  let startIndex = 0;
  if (lines[0].toLowerCase().startsWith('land-ocean')) {
    startIndex = 1;
  }

  const header = lines[startIndex]?.split(',') ?? [];
  const headerLower = header.map((value) => value.trim().toLowerCase());
  const monthColumns = MONTH_LABELS_LOWER.map((label) => headerLower.indexOf(label));

  const entries: TemperatureEntry[] = [];

  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const row = lines[i].split(',');
    const year = Number.parseInt(row[0], 10);
    if (!Number.isFinite(year)) continue;
    if (year < START_YEAR || year > END_YEAR) continue;

    monthColumns.forEach((colIndex, monthIdx) => {
      if (colIndex < 0 || colIndex >= row.length) return;
      const raw = row[colIndex]?.trim();
      if (!raw || raw === '***') return;
      const anomaly = Number.parseFloat(raw);
      if (!Number.isFinite(anomaly)) return;
      entries.push({ year, month: monthIdx + 1, anomaly });
    });
  }

  return entries.sort((a, b) => (a.year - b.year) || (a.month - b.month));
};

const lerpColor = (start: string, end: string, t: number) => {
  const startColor = new THREE.Color(start);
  const endColor = new THREE.Color(end);
  return startColor.lerp(endColor, Math.min(1, Math.max(0, t)));
};

interface ClimateSpiralAnimationProps {
  compact?: boolean;
  autoPlayDelayMs?: number;
}

const ClimateSpiralAnimation: React.FC<ClimateSpiralAnimationProps> = ({ compact = false, autoPlayDelayMs = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const spiralGroupRef = useRef<THREE.Group | null>(null);
  const lineRef = useRef<Line2 | null>(null);
  const geometryRef = useRef<LineGeometry | null>(null);
  const labelGroupRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const lastFrameRef = useRef(0);
  const playingRef = useRef(false);
  const tiltProgressRef = useRef(0);
  const tiltHoldRef = useRef(0);
  const spinAngleRef = useRef(0);
  const viewModeRef = useRef<'tilted' | 'overhead'>('tilted');

  const [data, setData] = useState<TemperatureEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [rendererReady, setRendererReady] = useState(false);
  const [rendererSize, setRendererSize] = useState({ width: 0, height: 0 });
  const [dataError, setDataError] = useState<string | null>(null);
  const [rotationActive, setRotationActive] = useState(false);
  const [viewMode, setViewMode] = useState<'tilted' | 'overhead'>('tilted');
  const [canRotate, setCanRotate] = useState(false);

  const totalSegments = Math.max(0, data.length - 1);

  const currentYear = useMemo(() => {
    if (data.length === 0) return START_YEAR;
    const segmentIndex = Math.min(totalSegments, Math.floor(animationProgress * totalSegments));
    return data[Math.min(segmentIndex, data.length - 1)]?.year ?? START_YEAR;
  }, [animationProgress, data, totalSegments]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPlaying(true), autoPlayDelayMs);
    return () => window.clearTimeout(timeout);
  }, [autoPlayDelayMs]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const dataUrls = (() => {
          if (typeof window === 'undefined') {
            return ['/data/GLB.Ts+dSST.csv'];
          }
          const paths = new Set<string>();
          const segments = window.location.pathname.split('/').filter(Boolean);
          for (let i = segments.length; i >= 0; i -= 1) {
            const prefix = i === 0 ? '' : `/${segments.slice(0, i).join('/')}`;
            paths.add(`${window.location.origin}${prefix}/data/GLB.Ts+dSST.csv`);
          }
          paths.add(`${window.location.origin}/data/GLB.Ts+dSST.csv`);
          return Array.from(paths);
        })();

        let text: string | null = null;
        const attempts: string[] = [];
        for (const url of dataUrls) {
          const response = await fetch(url, { cache: 'no-store' });
          attempts.push(`${url} -> ${response.status}`);
          if (!response.ok) continue;
          text = await response.text();
          if (text) break;
        }

        if (!text) {
          throw new Error(attempts.join(' | '));
        }

        const parsed = parseTemperatureCsv(text);
        if (!cancelled) {
          if (parsed.length === 0) {
            setDataError('GLB.Ts+dSST.csv loaded but contained no usable rows.');
          }
          setData(parsed);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load temperature data', err);
        if (!cancelled) {
          setData([]);
          setDataError('Failed to load GLB.Ts+dSST.csv.');
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      const container = containerRef.current;
      if (!container || rendererRef.current) {
        rafId = requestAnimationFrame(init);
        return;
      }

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#000000');

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, compact ? CAMERA_Z_COMPACT : CAMERA_Z);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const initialWidth = container.clientWidth || 720;
      const initialHeight = container.clientHeight || 720;
      renderer.setSize(initialWidth, initialHeight);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const spiralGroup = new THREE.Group();
      scene.add(spiralGroup);
      spiralGroupRef.current = spiralGroup;

      const labelGroup = new THREE.Group();
      spiralGroup.add(labelGroup);
      labelGroupRef.current = labelGroup;

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      setRendererReady(true);
      setRendererSize({ width: initialWidth, height: initialHeight });

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (!rendererRef.current || !cameraRef.current) return;
          const { width, height } = entry.contentRect;
          const nextWidth = width || 720;
          const nextHeight = height || 720;
          rendererRef.current.setSize(nextWidth, nextHeight);
          cameraRef.current.aspect = nextWidth / nextHeight;
          cameraRef.current.updateProjectionMatrix();
          setRendererSize({ width: nextWidth, height: nextHeight });
          if (lineRef.current) {
            const material = lineRef.current.material as LineMaterial;
            material.resolution.set(nextWidth, nextHeight);
          }
        }
      });
      resizeObserver.observe(container);
    };

    init();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      sceneRef.current = null;
      cameraRef.current = null;
      spiralGroupRef.current = null;
      lineRef.current = null;
      geometryRef.current = null;
      labelGroupRef.current = null;
      setRendererReady(false);
    };
  }, [compact]);

  useEffect(() => {
    if (!rendererReady || !spiralGroupRef.current || data.length === 0) return;

    const spiralGroup = spiralGroupRef.current;

    if (lineRef.current) {
      spiralGroup.remove(lineRef.current);
      lineRef.current.geometry.dispose();
      const material = lineRef.current.material as LineMaterial;
      material.dispose();
      lineRef.current = null;
      geometryRef.current = null;
    }

    const positions = new Float32Array(data.length * 3);
    const colors = new Float32Array(data.length * 3);

    const yearSpan = Math.max(1, END_YEAR - START_YEAR);
    data.forEach((entry, idx) => {
      const radius = (BASE_RADIUS + entry.anomaly * TEMP_SCALE) * SPIRAL_SCALE;
      const angle = monthToAngle(entry.month);
      const yearIndex = entry.year - START_YEAR;
      const z = (yearIndex / yearSpan) * DEPTH_RANGE - DEPTH_RANGE / 2;
      positions[idx * 3] = Math.cos(angle) * radius;
      positions[idx * 3 + 1] = Math.sin(angle) * radius;
      positions[idx * 3 + 2] = z;

      const t = (entry.year - START_YEAR) / Math.max(1, END_YEAR - START_YEAR);
      const color = lerpColor('#2563eb', '#f43f5e', t);
      colors[idx * 3] = color.r;
      colors[idx * 3 + 1] = color.g;
      colors[idx * 3 + 2] = color.b;
    });

    const geometry = new LineGeometry();
    geometry.setPositions(Array.from(positions));
    geometry.setColors(Array.from(colors));
    geometry.computeBoundingSphere();
    geometry.setDrawRange(0, Infinity);
    geometry.instanceCount = 0;

    const material = new LineMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      linewidth: LINE_WIDTH,
    });
    material.resolution.set(rendererSize.width || 720, rendererSize.height || 720);

    const line = new Line2(geometry, material);
    line.computeLineDistances();
    line.frustumCulled = false;

    lineRef.current = line;
    geometryRef.current = geometry;
    spiralGroup.add(line);
  }, [data, rendererReady, rendererSize]);

  useEffect(() => {
    if (!rendererReady || !labelGroupRef.current) return;

    const labelGroup = labelGroupRef.current;
    while (labelGroup.children.length) {
      const child = labelGroup.children.pop();
      if (child) labelGroup.remove(child);
    }

    const makeLabelSprite = (text: string, color: string, fontSize: number) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.font = `${fontSize}px Arial`;
      const textWidth = Math.ceil(ctx.measureText(text).width);
      canvas.width = textWidth + 12;
      canvas.height = fontSize + 10;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(material);
      const scale = 0.015;
      sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
      return sprite;
    };

    // Month labels
    const monthRadius = (BASE_RADIUS + TEMP_SCALE * (compact ? 1.35 : 1.6)) * SPIRAL_SCALE;
    MONTH_LABELS.forEach((label, idx) => {
      const angle = monthToAngle(idx + 1);
      const sprite = makeLabelSprite(label, '#facc15', compact ? MONTH_LABEL_FONT_COMPACT : MONTH_LABEL_FONT_FULL);
      if (!sprite) return;
      const x = Math.cos(angle) * monthRadius;
      const y = Math.sin(angle) * monthRadius;
      sprite.position.set(x, y, 0);
      sprite.userData = { type: 'month' };
      labelGroup.add(sprite);
    });

    // Ring labels
    RING_VALUES.forEach((value) => {
      const radius = (BASE_RADIUS + value * TEMP_SCALE) * SPIRAL_SCALE;
      const label = RING_LABELS[value] ?? `${value}°C`;
      const color = value === 0 ? '#22c55e' : '#facc15';
      const sprite = makeLabelSprite(label, color, RING_LABEL_FONT);
      if (!sprite) return;
      sprite.position.set(0, radius, 0);
      sprite.userData = { type: 'ring' };
      labelGroup.add(sprite);
    });
  }, [rendererReady, compact]);

  useEffect(() => {
    if (!rendererReady || !spiralGroupRef.current) return;

    const spiralGroup = spiralGroupRef.current;

    // Clear previous rings
    spiralGroup.children
      .filter((child) => child.userData?.type === 'ring')
      .forEach((child) => spiralGroup.remove(child));

    const ringMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#facc15'),
      transparent: true,
      opacity: 0.85,
    });

    const zeroMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#22c55e'),
      transparent: true,
      opacity: 0.85,
    });

    const ringSegments = 256;
    RING_VALUES.forEach((value) => {
      const radius = BASE_RADIUS + value * TEMP_SCALE;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= ringSegments; i += 1) {
        const angle = (i / ringSegments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(geometry, value === 0 ? zeroMaterial : ringMaterial);
      line.userData = { type: 'ring' };
      spiralGroup.add(line);
    });
  }, [rendererReady]);

  useEffect(() => {
    const animate = (time: number) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = time;
      }
      const delta = time - lastFrameRef.current;
      lastFrameRef.current = time;

      if (playingRef.current && totalSegments > 0) {
        const durationMs = 30000;
        progressRef.current = Math.min(1, progressRef.current + delta / durationMs);
        setAnimationProgress(progressRef.current);
      }

      if (geometryRef.current) {
        const drawSegments = Math.floor(progressRef.current * totalSegments);
        geometryRef.current.instanceCount = Math.max(0, Math.min(drawSegments, totalSegments));
      }

      if (spiralGroupRef.current) {
        const hideRings = tiltProgressRef.current > 0;
        spiralGroupRef.current.children.forEach((child) => {
          if (child.userData?.type === 'ring') {
            child.visible = !hideRings;
          }
        });
        if (progressRef.current >= 1) {
          const target = viewModeRef.current === 'overhead' ? 0 : 1;
          const step = delta / 2500;
          if (target === 1) {
            tiltHoldRef.current = Math.min(1000, tiltHoldRef.current + delta);
            if (tiltHoldRef.current >= 1000) {
              tiltProgressRef.current = Math.min(1, tiltProgressRef.current + step);
            }
          } else {
            tiltHoldRef.current = 0;
            tiltProgressRef.current = Math.max(0, tiltProgressRef.current - step);
          }
          spiralGroupRef.current.rotation.x = (-Math.PI / 2.3) * tiltProgressRef.current;
          if (tiltProgressRef.current >= 0.98 && viewModeRef.current === 'tilted') {
            const spinSpeed = (Math.PI * 2) / 45000; // one rotation every ~45s
            spinAngleRef.current = (spinAngleRef.current + delta * spinSpeed) % (Math.PI * 2);
            spiralGroupRef.current.rotation.z = spinAngleRef.current;
          } else {
            spinAngleRef.current = 0;
            spiralGroupRef.current.rotation.z = 0;
          }
        } else {
          tiltProgressRef.current = 0;
          tiltHoldRef.current = 0;
          spiralGroupRef.current.rotation.x = 0;
          spiralGroupRef.current.rotation.z = 0;
          spinAngleRef.current = 0;
        }
      }
      const nextRotationActive = tiltProgressRef.current > 0.01;
      setRotationActive((prev) => (prev === nextRotationActive ? prev : nextRotationActive));
      const nextCanRotate = progressRef.current >= 1;
      setCanRotate((prev) => (prev === nextCanRotate ? prev : nextCanRotate));
      if (labelGroupRef.current) {
        const hideMonths = tiltProgressRef.current > 0;
        labelGroupRef.current.children.forEach((child) => {
          if (child.userData?.type === 'month' || child.userData?.type === 'ring') {
            child.visible = !hideMonths;
          }
        });
      }

      if (rendererReady && rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rendererReady, totalSegments]);

  const handlePlayToggle = () => {
    setPlaying((prev) => !prev);
  };

  const handleReset = () => {
    progressRef.current = 0;
    setAnimationProgress(0);
    setPlaying(false);
    setViewMode('tilted');
  };

  const handleRotateToggle = () => {
    setViewMode((prev) => (prev === 'tilted' ? 'overhead' : 'tilted'));
  };

  if (loading) {
    return (
      <div className={`w-full ${compact ? 'h-[580px]' : 'h-[720px]'} bg-black flex items-center justify-center rounded-lg border border-slate-700`}>
        <div className="text-slate-300">Loading temperature data...</div>
      </div>
    );
  }

  if (compact) {
    const showRotationLabels = rotationActive;
    return (
      <div className="w-full bg-black border border-slate-700 rounded-lg shadow-xl relative overflow-hidden">
        {!showRotationLabels && (
          <>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-48 w-2 rounded-full bg-gradient-to-b from-rose-400 via-slate-200 to-blue-500 opacity-80" />
            <div className="absolute left-6 top-1/2 -translate-y-[5.25rem] text-rose-300" style={{ fontSize: `${TEMP_LABEL_FONT_COMPACT}px` }}>+1°C</div>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-300" style={{ fontSize: `${TEMP_LABEL_FONT_COMPACT}px` }}>0°C</div>
            <div className="absolute left-6 top-1/2 translate-y-[4.25rem] text-blue-300" style={{ fontSize: `${TEMP_LABEL_FONT_COMPACT}px` }}>-1°C</div>
          </>
        )}
        {showRotationLabels && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute left-2 top-8 text-[10px] text-amber-200">+1°C</div>
            <div className="absolute left-[calc(1.5rem+65px)] top-8 text-[10px] text-amber-200">+0°C</div>

            <div className="absolute left-[calc(1rem-5px)] top-12 h-[360px] w-px bg-amber-200/70" />
            <div className="absolute left-[calc(2.5rem+50px)] top-12 h-[360px] w-px bg-amber-200/70" />


            
            <div className="absolute right-[calc(1.5rem+65px)] top-8 text-[10px] text-amber-200">+0°C</div>
            <div className="absolute right-2 top-8 text-[10px] text-amber-200">+1°C</div>
            <div className="absolute right-[calc(1rem-5px)] top-12 h-[360px] w-px bg-amber-200/70" />
            <div className="absolute right-[calc(2.5rem+50px)] top-12 h-[360px] w-px bg-amber-200/70" />


            <div className="absolute inset-0 flex flex-col items-center justify-start pt-24 gap-9 text-[12px] font-semibold text-lime-400">
              {ROTATION_YEAR_LABELS.map((year) => (
                <div key={year}>{year}</div>
              ))}
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-[580px] relative z-10" />
        {canRotate && (
          <button
            onClick={handleRotateToggle}
            className="absolute left-2 bottom-2 z-20 rounded bg-slate-700 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-600 transition"
          >
            Rotate
          </button>
        )}
        {!rendererReady && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Initializing WebGL…
          </div>
        )}
        {rendererReady && data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-amber-300">
            No temperature data loaded.
          </div>
        )}
        {!rotationActive && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="text-3xl font-semibold text-rose-400">{currentYear}</div>
          </div>
        )}
      </div>
    );
  }

  const showRotationLabels = rotationActive;
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="w-full lg:w-48 flex flex-col gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition"
          >
            Reset
          </button>
          <div className="text-slate-200 text-sm font-semibold">
            {currentYear}
          </div>
          <div className="text-xs text-slate-400">Year</div>
          <div className="text-xs text-slate-500 leading-relaxed">
            Global temperature anomalies relative to 1951–1980 baseline (°C).
          </div>
        </div>

      <div className="flex-1 bg-black border border-slate-700 rounded-lg shadow-xl relative overflow-hidden">
          {!showRotationLabels && (
            <>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-52 w-2 rounded-full bg-gradient-to-b from-rose-400 via-slate-200 to-blue-500 opacity-80" />
              <div className="absolute left-7 top-1/2 -translate-y-[5.75rem] text-rose-300" style={{ fontSize: `${TEMP_LABEL_FONT_FULL}px` }}>+1°C</div>
              <div className="absolute left-7 top-1/2 -translate-y-1/2 text-emerald-300" style={{ fontSize: `${TEMP_LABEL_FONT_FULL}px` }}>0°C</div>
              <div className="absolute left-7 top-1/2 translate-y-[4.75rem] text-blue-300" style={{ fontSize: `${TEMP_LABEL_FONT_FULL}px` }}>-1°C</div>
            </>
          )}
          {showRotationLabels && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute left-56 top-10 text-xs text-red-200">+2°F</div>
              <div className="absolute left-8 top-10 text-xs text-red-200">+1°F</div>
              <div className="absolute left-28 top-14 h-[470px] w-px bg-amber-200/70" />
              <div className="absolute left-44 top-14 h-[470px] w-px bg-amber-200/70" />
              <div className="absolute left-58 top-14 h-[470px] w-px bg-amber-200/70" />

              <div className="absolute right-24 top-10 text-xs text-amber-200">0°</div>
              <div className="absolute right-8 top-10 text-xs text-amber-200">+1°F</div>
              <div className="absolute right-56 top-10 text-xs text-amber-200">+2°F</div>
              <div className="absolute right-28 top-14 h-[470px] w-px bg-amber-200/70" />
              <div className="absolute right-44 top-14 h-[470px] w-px bg-amber-200/70" />
              <div className="absolute right-60 top-14 h-[470px] w-px bg-amber-200/70" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-sm font-semibold text-lime-400">
                {ROTATION_YEAR_LABELS.map((year) => (
                  <div key={year}>{year}</div>
                ))}
              </div>
            </div>
          )}
          <div ref={containerRef} className="w-full h-[720px] relative z-10" />
          {canRotate && (
            <button
              onClick={handleRotateToggle}
              className="absolute left-2 bottom-2 z-20 rounded bg-slate-700 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-600 transition"
            >
              Rotate
            </button>
          )}
          {!rendererReady && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              Initializing WebGL…
            </div>
          )}
          {rendererReady && data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-amber-300">
              No temperature data loaded.
            </div>
          )}
          {!rotationActive && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="text-4xl font-semibold text-rose-400">{currentYear}</div>
            </div>
          )}
          <div className="px-3 pb-2 text-[11px] text-slate-500">
            {rendererReady
              ? `WebGL ${rendererSize.width}×${rendererSize.height} · ${data.length} months`
              : 'WebGL initializing...'}
            {dataError ? ` · ${dataError}` : ''}
          </div>
        </div>

        <div className="w-full lg:w-56 flex flex-col gap-3">
          <div className="text-slate-200 text-sm font-semibold">NASA Climate Spiral</div>
          <div className="text-xs text-slate-400">
            Recreated from NASA SVS 5190 using GLB.Ts+dSST monthly anomalies.
          </div>
          <div className="mt-3">
            <div className="text-xs text-slate-400 mb-2">Year gradient</div>
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-rose-300 to-rose-500" />
          </div>
          {dataError && (
            <div className="text-[11px] text-amber-300">{dataError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClimateSpiralAnimation;
