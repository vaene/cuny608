"use client";

import dynamic from "next/dynamic";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

type CountryFeature = {
  properties: {
    ISO_A2: string;
    ISO_A3: string;
    ADMIN: string;
    POP_EST: number;
  };
};

type StoryMetric = {
  label: string;
  value: number;
  color: string;
};

type StoryGraphic =
  | {
      kind: "bars";
      orientation: "vertical" | "horizontal";
      title: string;
      subtitle: string;
      metrics: StoryMetric[];
    }
  | {
      kind: "rings";
      title: string;
      subtitle: string;
      metrics: StoryMetric[];
    }
  | {
      kind: "line";
      title: string;
      subtitle: string;
      metrics: StoryMetric[];
    }
  | {
      kind: "flow";
      title: string;
      subtitle: string;
      metrics: StoryMetric[];
    };

type StoryStep = {
  title: string;
  label: string;
  description: string;
  pov: { lat: number; lng: number; altitude: number };
  lines: string[];
  graphic: StoryGraphic;
  accent: string;
};

type GlobeHandle = {
  controls?: () => { autoRotate: boolean; autoRotateSpeed: number };
  pointOfView: (pov: StoryStep["pov"], duration: number) => void;
};

type GlobeProps = {
  width: number;
  height: number;
  globeImageUrl: string;
  backgroundImageUrl: string;
  lineHoverPrecision: number;
  polygonsData: CountryFeature[];
  onGlobeReady?: () => void;
  polygonAltitude: (feature: CountryFeature) => number;
  polygonCapColor: (feature: CountryFeature) => string;
  polygonSideColor: () => string;
  polygonStrokeColor: () => string;
  polygonLabel: (feature: CountryFeature) => string;
  onPolygonHover: (feature: CountryFeature | null) => void;
  polygonsTransitionDuration: number;
};

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false }) as unknown as ForwardRefExoticComponent<
  GlobeProps & RefAttributes<GlobeHandle>
>;

const COUNTRIES_DATA_URL = "/Story7/datasets/ne_110m_admin_0_countries.geojson";
const EARTH_TEXTURE = "https://cdn.jsdelivr.net/npm/three-globe@2.32/example/img/earth-night.jpg";
const BACKGROUND_TEXTURE = "https://cdn.jsdelivr.net/npm/three-globe@2.32/example/img/night-sky.png";
const STORY_TRANSITION_MS = 1450;
const IDLE_ROTATE_DELAY_MS = 4200;
const AUTO_ROTATE_SPEED = 0.28;
const WORD_DELAY_MS = 72;
const LINE_DELAY_MS = 260;

const STORY_STEPS: StoryStep[] = [
  {
    title: "United States",
    label: "Demand center",
    description:
      "The story opens where demand is visible. The U.S. needs the finished products, but the chain behind them is longer and more exposed than the final device suggests.",
    pov: { lat: 39.5, lng: -98.5, altitude: 1.9 },
    lines: [
      "The United States is where the end of the chain shows up.",
      "We feel the battery, the car, and the grid upgrade, but not always the path that made them possible.",
      "That gap between domestic demand and upstream control is where resilience starts."
    ],
    graphic: {
      kind: "bars",
      orientation: "vertical",
      title: "Demand versus control",
      subtitle: "The first chart contrasts the weight of consumption with the thinner domestic base that supports it.",
      metrics: [
        { label: "Demand", value: 92, color: "#67e8f9" },
        { label: "Domestic supply", value: 38, color: "#60a5fa" },
        { label: "Import reliance", value: 81, color: "#34d399" },
        { label: "Processing gap", value: 64, color: "#f59e0b" }
      ]
    },
    accent: "#67e8f9"
  },
  {
    title: "China",
    label: "Processing hub",
    description:
      "China sits in the middle of the chain. Ore may come from elsewhere, but the processing, refining, and component work concentrate leverage here.",
    pov: { lat: 35.5, lng: 104, altitude: 1.55 },
    lines: [
      "China does not only mine materials.",
      "It controls the middle of the map, where refining and fabrication decide who captures value.",
      "That middle matters because a supply chain is only as open as its bottleneck."
    ],
    graphic: {
      kind: "rings",
      title: "Concentration in the middle",
      subtitle: "Three concentric rings show how the dominant position grows once raw material becomes a processed input.",
      metrics: [
        { label: "Mining", value: 42, color: "#38bdf8" },
        { label: "Refining", value: 88, color: "#a78bfa" },
        { label: "Battery parts", value: 79, color: "#f97316" }
      ]
    },
    accent: "#a78bfa"
  },
  {
    title: "South America",
    label: "Extraction corridor",
    description:
      "South America supplies the corridor behind lithium and copper. The continent is not one source; it is a set of linked basins, ports, and policy choices.",
    pov: { lat: -15, lng: -63, altitude: 1.35 },
    lines: [
      "South America powers the extraction side of the transition.",
      "Chile, Argentina, Peru, and Brazil each sit in a different part of the chain.",
      "The region matters because concentration across borders is still concentration."
    ],
    graphic: {
      kind: "bars",
      orientation: "horizontal",
      title: "Country corridor",
      subtitle: "The right-hand chart spreads the corridor across countries so the supply story reads as a region, not a single point.",
      metrics: [
        { label: "Chile", value: 86, color: "#22c55e" },
        { label: "Argentina", value: 73, color: "#38bdf8" },
        { label: "Peru", value: 67, color: "#f59e0b" },
        { label: "Brazil", value: 44, color: "#ef4444" }
      ]
    },
    accent: "#22c55e"
  },
  {
    title: "Russia",
    label: "Disruption risk",
    description:
      "Russia does not need to dominate every material to shape the story. Geopolitical stress can interrupt finance, shipping, and substitution long before the mine itself runs dry.",
    pov: { lat: 61, lng: 98, altitude: 1.55 },
    lines: [
      "Russia turns volume into risk.",
      "When sanctions, war, or transport shocks hit, the effect is not just price.",
      "The whole map tightens because downstream buyers have to reroute fast."
    ],
    graphic: {
      kind: "line",
      title: "Stress propagates",
      subtitle: "The line rises as the chain moves from normal flow to tension, shock, and rerouting.",
      metrics: [
        { label: "Baseline", value: 28, color: "#60a5fa" },
        { label: "Tension", value: 43, color: "#38bdf8" },
        { label: "Shock", value: 89, color: "#fb7185" },
        { label: "Reroute", value: 61, color: "#f59e0b" },
        { label: "Stabilize", value: 46, color: "#34d399" }
      ]
    },
    accent: "#fb7185"
  },
  {
    title: "Europe",
    label: "Industrial response",
    description:
      "Europe is the downstream strategist. Recycling, substitution, and industrial coordination reduce dependence, but they only work if the upstream links are still available.",
    pov: { lat: 53, lng: 12, altitude: 1.65 },
    lines: [
      "Europe answers the problem with coordination.",
      "Recycling and substitution help, but they do not erase the need for raw materials.",
      "The chart on the right shows resilience as a connected system, not a single move."
    ],
    graphic: {
      kind: "flow",
      title: "A connected response",
      subtitle: "Nodes and connectors show how policy, recycling, and industrial demand have to move together.",
      metrics: [
        { label: "Recycling", value: 68, color: "#22c55e" },
        { label: "Substitution", value: 55, color: "#38bdf8" },
        { label: "Smelting", value: 74, color: "#a78bfa" },
        { label: "Demand", value: 86, color: "#f59e0b" }
      ]
    },
    accent: "#38bdf8"
  },
  {
    title: "United States",
    label: "Policy close",
    description:
      "The ending returns home. Resilience comes from multiple levers moving together: permitting, processing, recycling, and smarter procurement.",
    pov: { lat: 39.5, lng: -98.5, altitude: 1.9 },
    lines: [
      "The story closes back in the United States.",
      "The answer is not one fix. It is a shorter chain, a broader base, and fewer single points of failure.",
      "That is how the map moves from exposure toward durability."
    ],
    graphic: {
      kind: "bars",
      orientation: "vertical",
      title: "Resilience levers",
      subtitle: "The closing chart turns policy into a set of visible actions that can rise together.",
      metrics: [
        { label: "Permitting", value: 59, color: "#67e8f9" },
        { label: "Processing", value: 66, color: "#22c55e" },
        { label: "Recycling", value: 51, color: "#f59e0b" },
        { label: "Procurement", value: 63, color: "#a78bfa" }
      ]
    },
    accent: "#67e8f9"
  }
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    type LegacyMediaQueryList = MediaQueryList & {
      addListener: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    update();
    if ("addEventListener" in media) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    const legacyMedia = media as LegacyMediaQueryList;
    legacyMedia.addListener(update);
    return () => legacyMedia.removeListener(update);
  }, []);

  return reducedMotion;
}

function splitWords(line: string) {
  return line.trim().length ? line.trim().split(/\s+/) : [];
}

function useTypewriter(lines: string[], stepKey: string, reducedMotion: boolean) {
  const [lineIndex, setLineIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLineIndex(0);
      setWordIndex(0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [stepKey]);

  useEffect(() => {
    if (reducedMotion) return;

    if (lineIndex >= lines.length) {
      return;
    }

    const words = splitWords(lines[lineIndex] ?? "");
    let timer: number | undefined;

    if (wordIndex < words.length) {
      const nextDelay = WORD_DELAY_MS + Math.min(60, (words[wordIndex]?.length ?? 0) * 8);
      timer = window.setTimeout(() => {
        setWordIndex((value) => value + 1);
      }, nextDelay);
    } else {
      timer = window.setTimeout(() => {
        setLineIndex((value) => value + 1);
        setWordIndex(0);
      }, LINE_DELAY_MS);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [lineIndex, lines, reducedMotion, wordIndex]);

  const renderedLines = useMemo(() => {
    if (reducedMotion) {
      return lines.slice();
    }

    return lines.map((line, index) => {
      if (index < lineIndex) {
        return line;
      }

      if (index > lineIndex) {
        return "";
      }

      const words = splitWords(line);
      return words.slice(0, wordIndex).join(" ");
    });
  }, [lineIndex, lines, reducedMotion, wordIndex]);

  const progress = useMemo(() => {
    const totalWords = lines.reduce((sum, line) => sum + splitWords(line).length, 0);

    if (reducedMotion || totalWords === 0) {
      return 1;
    }

    let wordsTyped = 0;

    for (let index = 0; index < Math.min(lineIndex, lines.length); index += 1) {
      wordsTyped += splitWords(lines[index]).length;
    }

    if (lineIndex < lines.length) {
      wordsTyped += Math.min(wordIndex, splitWords(lines[lineIndex] ?? "").length);
    } else {
      wordsTyped = totalWords;
    }

    return clamp(wordsTyped / totalWords);
  }, [lineIndex, lines, reducedMotion, wordIndex]);

  const cursorLineIndex = reducedMotion ? Math.max(0, lines.length - 1) : clamp(lineIndex, 0, Math.max(0, lines.length - 1));

  return { renderedLines, progress, cursorLineIndex };
}

function ChartBars({
  metrics,
  progress,
  orientation
}: {
  metrics: StoryMetric[];
  progress: number;
  orientation: "vertical" | "horizontal";
}) {
  const maxValue = Math.max(1, ...metrics.map((metric) => metric.value));

  return (
    <div className={`support-bars support-bars-${orientation}`}>
      {metrics.map((metric, index) => {
        const reveal = clamp(progress * metrics.length - index * 0.34);
        const eased = easeOutCubic(reveal);
        const percent = Math.round(metric.value);

        return (
          <div key={metric.label} className={`support-bar support-bar-${orientation}`}>
            <div className="support-bar-label">{metric.label}</div>
            <div className={`support-bar-track support-bar-track-${orientation}`}>
              <div
                className="support-bar-fill"
                style={
                  orientation === "vertical"
                    ? {
                        height: `${(metric.value / maxValue) * eased * 100}%`,
                        background: `linear-gradient(180deg, ${metric.color}, rgba(255,255,255,0.18))`
                      }
                    : {
                        width: `${(metric.value / maxValue) * eased * 100}%`,
                        background: `linear-gradient(90deg, ${metric.color}, rgba(255,255,255,0.18))`
                      }
                }
              />
            </div>
            <div className="support-bar-value">{percent}%</div>
          </div>
        );
      })}
    </div>
  );
}

function ChartRings({ metrics, progress }: { metrics: StoryMetric[]; progress: number }) {
  const centerX = 170;
  const centerY = 170;
  const ringRadii = [52, 82, 112];

  return (
    <div className="support-rings-wrap">
      <svg className="support-rings" viewBox="0 0 340 340" aria-hidden="true">
        <circle cx={centerX} cy={centerY} r={134} className="support-rings-grid" />
        {ringRadii.map((radius, index) => {
          const metric = metrics[index] ?? metrics[metrics.length - 1];
          const reveal = clamp(progress * metrics.length - index * 0.32);
          const value = metric.value / 100;
          const circumference = 2 * Math.PI * radius;
          const dashOffset = circumference * (1 - value * easeOutCubic(reveal));

          return (
            <g key={metric.label}>
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                className="support-rings-track"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                className="support-rings-fill"
                style={{
                  stroke: metric.color,
                  strokeDasharray: circumference,
                  strokeDashoffset: dashOffset
                }}
              />
              <circle
                cx={centerX + radius}
                cy={centerY}
                r={4}
                className="support-rings-node"
                style={{
                  fill: metric.color,
                  opacity: reveal
                }}
              />
            </g>
          );
        })}
        <circle cx={centerX} cy={centerY} r={34} className="support-rings-core" />
        <text x={centerX} y={centerY - 8} textAnchor="middle" className="support-rings-core-label">
          Middle
        </text>
        <text x={centerX} y={centerY + 14} textAnchor="middle" className="support-rings-core-sub">
          leverage
        </text>
      </svg>

      <div className="support-legend">
        {metrics.map((metric, index) => {
          const reveal = clamp(progress * metrics.length - index * 0.32);

          return (
            <div key={metric.label} className="support-legend-row" style={{ opacity: 0.3 + reveal * 0.7 }}>
              <span className="support-legend-swatch" style={{ background: metric.color }} />
              <span>{metric.label}</span>
              <strong>{Math.round(metric.value)}%</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartLine({ metrics, progress }: { metrics: StoryMetric[]; progress: number }) {
  const width = 640;
  const height = 260;
  const margin = 26;
  const maxValue = Math.max(1, ...metrics.map((metric) => metric.value));
  const step = metrics.length > 1 ? (width - margin * 2) / (metrics.length - 1) : 0;
  const points = metrics.map((metric, index) => {
    const x = margin + index * step;
    const y = height - margin - (metric.value / maxValue) * (height - margin * 2);
    return { x, y, metric };
  });

  const path = points.length
    ? points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
    : "";
  const lineReveal = easeOutCubic(progress);

  return (
    <div className="support-line-card">
      <svg className="support-line" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <defs>
          <linearGradient id="line-fill" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <line x1={margin} y1={height - margin} x2={width - margin} y2={height - margin} className="support-grid-line" />
        <line x1={margin} y1={margin} x2={margin} y2={height - margin} className="support-grid-line" />
        <path
          d={path}
          className="support-line-area"
          style={{ opacity: 0.28 + lineReveal * 0.42 }}
        />
        <path
          d={path}
          className="support-line-path"
          pathLength={1}
          stroke="url(#line-fill)"
          strokeDasharray={1}
          strokeDashoffset={1 - lineReveal}
        />
        {points.map((point, index) => {
          const reveal = clamp(progress * metrics.length - index * 0.3);

          return (
            <g key={point.metric.label} style={{ opacity: 0.3 + reveal * 0.7 }}>
              <circle cx={point.x} cy={point.y} r={7} fill={point.metric.color} />
              <circle cx={point.x} cy={point.y} r={12} className="support-line-glow" style={{ stroke: point.metric.color }} />
              <text x={point.x} y={height - 8} textAnchor="middle" className="support-line-label">
                {point.metric.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ChartFlow({ metrics, progress }: { metrics: StoryMetric[]; progress: number }) {
  const width = 680;
  const height = 240;
  const top = 116;
  const left = 44;
  const right = width - 44;
  const positions = metrics.map((_, index) => {
    const span = metrics.length > 1 ? (right - left) / (metrics.length - 1) : 0;
    return left + index * span;
  });

  return (
    <div className="support-flow-card">
      <svg className="support-flow" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {metrics.map((metric, index) => {
          if (index === metrics.length - 1) {
            return null;
          }

          const reveal = clamp(progress * (metrics.length - 1) - index * 0.38);
          const x1 = positions[index];
          const x2 = positions[index + 1];

          return (
            <line
              key={`${metric.label}-${metrics[index + 1].label}`}
              x1={x1}
              y1={top}
              x2={x1 + (x2 - x1) * reveal}
              y2={top}
              className="support-flow-line"
              style={{ stroke: metric.color, opacity: 0.25 + reveal * 0.7 }}
            />
          );
        })}

        {metrics.map((metric, index) => {
          const reveal = clamp(progress * metrics.length - index * 0.26);
          const x = positions[index];

          return (
            <g key={metric.label} style={{ opacity: 0.2 + reveal * 0.8, transformOrigin: `${x}px ${top}px` }}>
              <circle cx={x} cy={top} r={22} className="support-flow-node" style={{ fill: metric.color, transform: `scale(${0.55 + reveal * 0.45})` }} />
              <text x={x} y={top - 34} textAnchor="middle" className="support-flow-label">
                {metric.label}
              </text>
              <text x={x} y={top + 44} textAnchor="middle" className="support-flow-value">
                {Math.round(metric.value)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StoryGraphicCard({ step, progress }: { step: StoryStep; progress: number }) {
  return (
    <div className="story-graphic-card">
      <div className="story-graphic-topline">
        <span className="story-graphic-kicker">Supporting graphic</span>
        <span className="story-graphic-meter">{Math.round(progress * 100)}%</span>
      </div>
      <h2 className="story-graphic-title">{step.graphic.title}</h2>
      <p className="story-graphic-subtitle">{step.graphic.subtitle}</p>
      <div className="story-graphic-body">
        {step.graphic.kind === "bars" ? (
          <ChartBars metrics={step.graphic.metrics} progress={progress} orientation={step.graphic.orientation} />
        ) : null}
        {step.graphic.kind === "rings" ? <ChartRings metrics={step.graphic.metrics} progress={progress} /> : null}
        {step.graphic.kind === "line" ? <ChartLine metrics={step.graphic.metrics} progress={progress} /> : null}
        {step.graphic.kind === "flow" ? <ChartFlow metrics={step.graphic.metrics} progress={progress} /> : null}
      </div>
    </div>
  );
}

export default function CriticalMineralsStory() {
  const globeRef = useRef<GlobeHandle | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const lastInteractionAtRef = useRef<number>(0);

  const [countries, setCountries] = useState<{ features: CountryFeature[] }>({ features: [] });
  const [hoverCountry, setHoverCountry] = useState<CountryFeature | undefined>();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [interactionTick, setInteractionTick] = useState(0);
  const [globeReadyTick, setGlobeReadyTick] = useState(0);

  const reducedMotion = useReducedMotion();
  const activeStep = STORY_STEPS[activeStepIndex];
  const lastStepIndex = STORY_STEPS.length - 1;
  const { renderedLines, progress, cursorLineIndex } = useTypewriter(
    activeStep.lines,
    `${activeStepIndex}-${activeStep.title}`,
    reducedMotion
  );

  useEffect(() => {
    lastInteractionAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    let active = true;

    fetch(COUNTRIES_DATA_URL)
      .then((response) => response.json())
      .then((data: { features?: CountryFeature[] }) => {
        if (!active) {
          return;
        }

        setCountries({ features: Array.isArray(data.features) ? data.features : [] });
      })
      .catch(() => {
        if (active) {
          setCountries({ features: [] });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const countryFeatures = useMemo(
    () => countries.features.filter((country) => country.properties.ISO_A2 !== "AQ"),
    [countries]
  );

  const maxPopulation = useMemo(
    () => Math.max(1, ...countryFeatures.map((feature) => Number(feature.properties.POP_EST) || 0)),
    [countryFeatures]
  );

  const colorScale = useMemo(
    () => d3.scaleSequentialSqrt((t) => d3.interpolateRgb("#143a64", "#67e8f9")(t)).domain([0, maxPopulation]),
    [maxPopulation]
  );

  const markInteraction = () => {
    lastInteractionAtRef.current = Date.now();
    setInteractionTick((value) => value + 1);
  };

  const goToStep = (index: number) => {
    const normalized = (index + STORY_STEPS.length) % STORY_STEPS.length;
    setActiveStepIndex(normalized);
    markInteraction();
  };

  const goNext = () => goToStep(activeStepIndex + 1);
  const goPrev = () => goToStep(activeStepIndex - 1);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }

    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = false;
      controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    }

    globe.pointOfView(activeStep.pov, STORY_TRANSITION_MS);

    setIsTransitioning(true);
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
    }, STORY_TRANSITION_MS + 40);

    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [activeStep, globeReadyTick]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }

    const controls = globe.controls?.();
    if (!controls) {
      return;
    }

    controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    controls.autoRotate = false;

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }

    if (activeStepIndex !== lastStepIndex || isTransitioning || reducedMotion) {
      return undefined;
    }

    const elapsed = Date.now() - lastInteractionAtRef.current;
    const remaining = Math.max(0, IDLE_ROTATE_DELAY_MS - elapsed);

    idleTimerRef.current = window.setTimeout(() => {
      if (activeStepIndex === lastStepIndex && !isTransitioning) {
        controls.autoRotate = true;
      }
    }, remaining);

    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [activeStepIndex, interactionTick, isTransitioning, lastStepIndex, reducedMotion]);

  return (
    <div
      className="story-shell story-shell-story7"
      tabIndex={0}
      onPointerDownCapture={markInteraction}
      onPointerMoveCapture={markInteraction}
      onWheelCapture={(event) => {
        event.preventDefault();
        markInteraction();
      }}
      onKeyDownCapture={(event) => {
        markInteraction();
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goPrev();
        }
        if (event.key === "ArrowRight" || event.key === " ") {
          event.preventDefault();
          goNext();
        }
      }}
    >
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        globeImageUrl={EARTH_TEXTURE}
        backgroundImageUrl={BACKGROUND_TEXTURE}
        lineHoverPrecision={0}
        polygonsData={countryFeatures}
        onGlobeReady={() => setGlobeReadyTick((value) => value + 1)}
        polygonAltitude={(feature: CountryFeature) => (feature === hoverCountry ? 0.09 : 0.05)}
        polygonCapColor={(feature: CountryFeature) =>
          feature === hoverCountry ? "steelblue" : colorScale(Number(feature.properties.POP_EST) || 0)
        }
        polygonSideColor={() => "rgba(0, 0, 0, 0.18)"}
        polygonStrokeColor={() => "#0f172a"}
        polygonLabel={({ properties }: CountryFeature) => `
          <b>${properties.ADMIN} (${properties.ISO_A2})</b> <br />
          Population: <i>${Math.round((Number(properties.POP_EST) || 0) / 1e4) / 1e2}M</i>
        `}
        onPolygonHover={(feature: CountryFeature | null) => setHoverCountry(feature ?? undefined)}
        polygonsTransitionDuration={300}
      />

      <button className="story-caret story-caret-left" type="button" aria-label="Previous story point" onClick={goPrev}>
        ‹
      </button>
      <button className="story-caret story-caret-right" type="button" aria-label="Next story point" onClick={goNext}>
        ›
      </button>

      <section className="story-panel story-panel-left" aria-label="Narrative text">
        <div className="story-panel-header">
          <div className="story-kicker">
            SECTION {String(activeStepIndex + 1).padStart(2, "0")} OF {String(STORY_STEPS.length).padStart(2, "0")}
          </div>
          <div className="story-title">{activeStep.title}</div>
          <div className="story-eyebrow">{activeStep.label}</div>
        </div>

        <div className="story-terminal">
          <div className="story-terminal-bar">
            <span className="story-terminal-dot dot-red" />
            <span className="story-terminal-dot dot-amber" />
            <span className="story-terminal-dot dot-green" />
            <span className="story-terminal-path">/critical-minerals/story</span>
          </div>

          <div className="story-typed-copy" aria-live="polite" aria-atomic="true">
            {renderedLines.map((line, index) => {
              const showCursor = index === cursorLineIndex;

              return (
                <p key={`${activeStepIndex}-${index}`} className={`story-typed-line${line ? "" : " is-empty"}`}>
                  <span>{line || "\u00A0"}</span>
                  {showCursor ? <span className="story-cursor" aria-hidden="true" /> : null}
                </p>
              );
            })}
          </div>

          <div className="story-terminal-footer">
            <div className="story-meta">
              <span>{activeStep.description}</span>
            </div>
            <div className="story-progress-block">
              <div className="story-progress-track">
                <span className="story-progress-fill" style={{ width: `${Math.max(6, progress * 100)}%`, background: activeStep.accent }} />
              </div>
              <div className="story-progress-copy">
                <span>{Math.round(progress * 100)}% typed</span>
                <span>{progress >= 1 ? "chart settled" : "chart building"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="story-dots" aria-label="Story navigation">
          {STORY_STEPS.map((step, index) => (
            <button
              key={step.title}
              type="button"
              className={`story-dot${index === activeStepIndex ? " is-active" : ""}`}
              aria-label={`Jump to ${step.title}`}
              aria-current={index === activeStepIndex ? "step" : undefined}
              onClick={() => goToStep(index)}
              style={index === activeStepIndex ? { background: activeStep.accent, borderColor: activeStep.accent } : undefined}
            />
          ))}
        </div>
      </section>

      <section className="story-panel story-panel-right" aria-label="Supporting graphic">
        <StoryGraphicCard step={activeStep} progress={progress} />
      </section>
    </div>
  );
}
