"use client";

import dynamic from "next/dynamic";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import * as THREE from "three";

type CountryFeature = {
  properties: {
    ISO_A2: string;
    ISO_A3: string;
    ADMIN: string;
    POP_EST: number;
    CONTINENT?: string;
  };
};

type StoryMetric = {
  label: string;
  value: number;
  color: string;
};

type RareEarthCard = {
  symbol: string;
  atomicNumber: number;
  name: string;
  note: string;
  accent: string;
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
    }
  | {
      kind: "sources";
      title: string;
      subtitle: string;
      methods: string[];
      sources: { label: string; href: string }[];
      zipHref: string;
  };

type StoryStep = {
  title: string;
  label: string;
  description: string;
  pov: { lat: number; lng: number; altitude: number };
  lines: string[];
  flagCountries: string[];
  rareEarths: RareEarthCard[];
  graphic: StoryGraphic;
  accent: string;
};

type StoryTextBlock = {
  kind: "title" | "label" | "description" | "body";
  text: string;
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
  polygonCapColor?: (feature: CountryFeature) => string;
  polygonCapMaterial: (feature: CountryFeature) => THREE.Material;
  polygonSideColor: () => string;
  polygonStrokeColor: () => string;
  polygonLabel: (feature: CountryFeature) => string;
  onPolygonHover: (feature: CountryFeature | null) => void;
  polygonsTransitionDuration: number;
};

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false }) as unknown as ForwardRefExoticComponent<
  GlobeProps & RefAttributes<GlobeHandle>
>;

const COUNTRIES_DATA_URL = "/608/Story7/datasets/ne_110m_admin_0_countries.geojson";
const EARTH_TEXTURE = "https://cdn.jsdelivr.net/npm/three-globe@2.32/example/img/earth-night.jpg";
const BACKGROUND_TEXTURE = "https://cdn.jsdelivr.net/npm/three-globe@2.32/example/img/night-sky.png";
const STORY_TRANSITION_MS = 1450;
const IDLE_ROTATE_DELAY_MS = 4200;
const AUTO_ROTATE_SPEED = 0.28;
const TYPEWRITER_SLOWDOWN = 1.433;
const NARRATION_SLOWDOWN = 1.0;
const LINE_DELAY_MS = Math.round(260 * TYPEWRITER_SLOWDOWN);
const PRESENTATION_ZIP_HREF = "/608/Story7/artifacts/story7-presentation-source.zip";
const STORY_VOICE_LANG = "en-GB";
const STORY_VOICE_HINTS = [
  "google uk english female",
  "microsoft libby online",
  "susan",
  "serena",
  "victoria",
  "kate",
  "george"
];
const FLAG_IMAGE_URLS: Record<string, string> = {
  US: "/608/Story7/flags/us.png",
  FR: "/608/Story7/flags/fr.svg",
  NO: "/608/Story7/flags/no.svg",
  CN: "/608/Story7/flags/cn.png",
  CL: "/608/Story7/flags/cl.png",
  AR: "/608/Story7/flags/ar.png",
  PE: "/608/Story7/flags/pe.png",
  BR: "/608/Story7/flags/br.png",
  RU: "/608/Story7/flags/ru.png",
  EU: "/608/Story7/flags/eu.png"
};
const FULL_RARE_EARTH_CARDS: RareEarthCard[] = [
  { symbol: "Sc", atomicNumber: 21, name: "Scandium", note: "aerospace alloys", accent: "#38bdf8" },
  { symbol: "Y", atomicNumber: 39, name: "Yttrium", note: "ceramics and optics", accent: "#67e8f9" },
  { symbol: "La", atomicNumber: 57, name: "Lanthanum", note: "battery chemistry", accent: "#22c55e" },
  { symbol: "Ce", atomicNumber: 58, name: "Cerium", note: "polishing and catalysts", accent: "#a78bfa" },
  { symbol: "Pr", atomicNumber: 59, name: "Praseodymium", note: "motors and alloys", accent: "#f59e0b" },
  { symbol: "Nd", atomicNumber: 60, name: "Neodymium", note: "high-strength magnets", accent: "#34d399" },
  { symbol: "Pm", atomicNumber: 61, name: "Promethium", note: "specialized research", accent: "#fb7185" },
  { symbol: "Sm", atomicNumber: 62, name: "Samarium", note: "defense magnets", accent: "#60a5fa" },
  { symbol: "Eu", atomicNumber: 63, name: "Europium", note: "displays and phosphors", accent: "#a78bfa" },
  { symbol: "Gd", atomicNumber: 64, name: "Gadolinium", note: "medical imaging", accent: "#f97316" },
  { symbol: "Tb", atomicNumber: 65, name: "Terbium", note: "efficient magnets", accent: "#22c55e" },
  { symbol: "Dy", atomicNumber: 66, name: "Dysprosium", note: "heat resistance", accent: "#67e8f9" },
  { symbol: "Ho", atomicNumber: 67, name: "Holmium", note: "precision lasers", accent: "#38bdf8" },
  { symbol: "Er", atomicNumber: 68, name: "Erbium", note: "fiber optics", accent: "#fb7185" },
  { symbol: "Tm", atomicNumber: 69, name: "Thulium", note: "specialty lasers", accent: "#a78bfa" },
  { symbol: "Yb", atomicNumber: 70, name: "Ytterbium", note: "precision tools", accent: "#34d399" },
  { symbol: "Lu", atomicNumber: 71, name: "Lutetium", note: "advanced catalysts", accent: "#f59e0b" }
];

function flagImageUrl(code: string) {
  return FLAG_IMAGE_URLS[code.toUpperCase()] ?? `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}

function getPolygonFlagKey(feature: CountryFeature) {
  return feature.properties.ISO_A2;
}

function selectBritishVoice(voices: SpeechSynthesisVoice[]) {
  const britishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en-gb"));

  for (const hint of STORY_VOICE_HINTS) {
    const matchedVoice = britishVoices.find((voice) => voice.name.toLowerCase().includes(hint));
    if (matchedVoice) {
      return matchedVoice;
    }
  }

  return britishVoices[0] ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? voices[0] ?? null;
}

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
    flagCountries: ["US"],
    rareEarths: FULL_RARE_EARTH_CARDS,
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
    flagCountries: ["CN"],
    rareEarths: FULL_RARE_EARTH_CARDS,
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
    flagCountries: ["CL", "AR", "PE", "BR"],
    rareEarths: FULL_RARE_EARTH_CARDS,
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
    flagCountries: ["RU"],
    rareEarths: FULL_RARE_EARTH_CARDS,
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
    flagCountries: [],
    rareEarths: FULL_RARE_EARTH_CARDS,
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
    flagCountries: ["US"],
    rareEarths: FULL_RARE_EARTH_CARDS,
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
  },
  {
    title: "Methods & Sources",
    label: "Source pack",
    description:
      "This slide captures the method in plain language and points to the source files and archive used to build the presentation.",
    pov: { lat: 22, lng: 5, altitude: 2.25 },
    lines: [
      "Method: this presentation combines narrative copy with synchronized charts to turn each geography into a single visual argument.",
      "Sources: country geometry, public population estimates, and the project data files stored with the presentation source bundle.",
      "Use the archive to recreate the deck structure, data inputs, and export settings."
    ],
    flagCountries: [],
    rareEarths: FULL_RARE_EARTH_CARDS,
    graphic: {
      kind: "sources",
      title: "Methods and sources",
      subtitle: "Methods and source links for the deck.",
      methods: [
        "Narrative timing is driven by a character-by-character terminal typewriter.",
        "The globe view advances one section at a time and stays fixed on the closing slides.",
        "Charts are synchronized to the typed copy so the visual builds with the story."
      ],
      sources: [
        { label: "GeoJSON countries", href: "/608/Story7/datasets/ne_110m_admin_0_countries.geojson" },
        { label: "App source", href: "/608/Story7/" },
        { label: "Presentation zip", href: PRESENTATION_ZIP_HREF }
      ],
      zipHref: PRESENTATION_ZIP_HREF
    },
    accent: "#a78bfa"
  }
];

const ALL_FLAG_COUNTRIES = Array.from(new Set(STORY_STEPS.flatMap((step) => step.flagCountries)));

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

function getCharDelay(current: string, next: string | undefined) {
  if (current === " ") {
    return 18;
  }

  if (",;:".includes(current)) {
    return 58;
  }

  if (".!?".includes(current)) {
    return 110;
  }

  if (current === "-") {
    return 30;
  }

  if (next === " ") {
    return 34;
  }

  return 24;
}

function estimateTextDuration(text: string) {
  let duration = 0;

  for (let index = 0; index < text.length; index += 1) {
    duration += getCharDelay(text[index] ?? "", text[index + 1]);
  }

  return duration;
}

function useTypewriter(blocks: StoryTextBlock[], stepKey: string, reducedMotion: boolean, enabled: boolean) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(() => {
      setBlockIndex(0);
      setCharIndex(0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [enabled, stepKey]);

  useEffect(() => {
    if (!enabled || reducedMotion || blocks.length === 0) return;

    if (blockIndex >= blocks.length) {
      return;
    }

    const text = blocks[blockIndex]?.text ?? "";
    let timer: number | undefined;

    if (charIndex < text.length) {
      const current = text[charIndex] ?? "";
      const next = text[charIndex + 1];
      timer = window.setTimeout(() => {
        setCharIndex((value) => value + 1);
      }, Math.round(getCharDelay(current, next) * TYPEWRITER_SLOWDOWN));
    } else if (blockIndex < blocks.length - 1) {
      timer = window.setTimeout(() => {
        setBlockIndex((value) => value + 1);
        setCharIndex(0);
      }, LINE_DELAY_MS);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [blockIndex, blocks, charIndex, enabled, reducedMotion]);

  const renderedLines = useMemo(() => {
    if (!enabled) {
      return blocks.map(() => "");
    }

    if (reducedMotion) {
      return blocks.map((block) => block.text);
    }

    return blocks.map((block, index) => {
      if (index < blockIndex) {
        return block.text;
      }

      if (index > blockIndex) {
        return "";
      }

      return block.text.slice(0, charIndex);
    });
  }, [blockIndex, blocks, charIndex, enabled, reducedMotion]);

  const progress = useMemo(() => {
    if (!enabled) {
      return 0;
    }

    const totalChars = blocks.reduce((sum, block) => sum + block.text.length, 0);

    if (reducedMotion || totalChars === 0) {
      return 1;
    }

    let charsTyped = 0;

    for (let index = 0; index < Math.min(blockIndex, blocks.length); index += 1) {
      charsTyped += blocks[index].text.length;
    }

    if (blockIndex < blocks.length) {
      charsTyped += Math.min(charIndex, blocks[blockIndex]?.text.length ?? 0);
    } else {
      charsTyped = totalChars;
    }

    return clamp(charsTyped / totalChars);
  }, [blockIndex, blocks, charIndex, enabled, reducedMotion]);

  const cursorBlockIndex = reducedMotion
    ? Math.max(0, blocks.length - 1)
    : !enabled
      ? 0
      : Math.min(blockIndex, Math.max(0, blocks.length - 1));

  return { renderedLines, progress, cursorBlockIndex, blockIndex };
}

function useFlagMaterials(flagCountries: string[]) {
  const uniqueFlagCountries = useMemo(() => Array.from(new Set(flagCountries)), [flagCountries]);

  const [materials, setMaterials] = useState<Record<string, THREE.MeshBasicMaterial>>({});

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    if (uniqueFlagCountries.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    async function loadFlagMaterials() {
      const entries = (
        await Promise.allSettled(
          uniqueFlagCountries.map(async (code) => {
            const texture = await loader.loadAsync(flagImageUrl(code));
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;

            const material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              opacity: 0.5,
              depthWrite: false,
              side: THREE.DoubleSide
            });

            material.needsUpdate = true;
            return [code, material] as const;
          })
        )
      )
        .filter((result): result is PromiseFulfilledResult<readonly [string, THREE.MeshBasicMaterial]> => result.status === "fulfilled")
        .map((result) => result.value);

      if (!cancelled) {
        setMaterials(Object.fromEntries(entries));
      }
    }

    loadFlagMaterials().catch(() => {
      if (!cancelled) {
        setMaterials({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [uniqueFlagCountries]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((material) => {
        material.map?.dispose();
        material.dispose();
      });
    };
  }, [materials]);

  return materials;
}

function useSpeechNarration(blocks: StoryTextBlock[], stepKey: string, enabled: boolean) {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const lastSpokenKeyRef = useRef<string>("");
  const sessionIdRef = useRef(0);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const [narrationStarted, setNarrationStarted] = useState(false);

  const speakBlocks = useCallback((blocksToSpeak: StoryTextBlock[], key: string, lockImmediately = false) => {
    if (!("speechSynthesis" in window) || blocksToSpeak.length === 0 || lastSpokenKeyRef.current === key) {
      return;
    }

    const synth = window.speechSynthesis;

    if (stopSpeechRef.current) {
      stopSpeechRef.current();
    }

    synth.cancel();
    synth.resume?.();

    if (lockImmediately) {
      lastSpokenKeyRef.current = key;
    }

    const sessionId = sessionIdRef.current + 1;
    sessionIdRef.current = sessionId;
    const sessionTimers: number[] = [];
    const speakBlock = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = STORY_VOICE_LANG;
      utterance.rate = Math.max(0.82, Math.min(1.08, (1.12 - text.length / 1200) / NARRATION_SLOWDOWN));
      utterance.pitch = 1.04;
      utterance.volume = 1;
      utterance.onstart = () => {
        lastSpokenKeyRef.current = key;
        setNarrationStarted(true);
      };

      const voice = voiceRef.current;
      if (voice) {
        utterance.voice = voice;
      }

      synth.speak(utterance);
    };

    const stop = () => {
      sessionTimers.forEach((timer) => window.clearTimeout(timer));
      if (sessionIdRef.current === sessionId) {
        synth.cancel();
      }
      if (stopSpeechRef.current === stop) {
        stopSpeechRef.current = null;
      }
    };

    stopSpeechRef.current = stop;

    let elapsed = lockImmediately ? 0 : Math.round(120 * NARRATION_SLOWDOWN);
    blocksToSpeak.forEach((block, index) => {
      const text = block.text.trim();
      if (!text) {
        return;
      }

      if (lockImmediately && index === 0) {
        speakBlock(text);
      } else {
        const timer = window.setTimeout(() => {
          speakBlock(text);
        }, elapsed);

        sessionTimers.push(timer);
      }

      elapsed += Math.round(estimateTextDuration(block.text) * NARRATION_SLOWDOWN) + (index < blocksToSpeak.length - 1 ? LINE_DELAY_MS : 0);
    });

    return stop;
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const updateVoice = () => {
      voiceRef.current = selectBritishVoice(window.speechSynthesis.getVoices());
    };

    updateVoice();
    window.speechSynthesis.addEventListener?.("voiceschanged", updateVoice);

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", updateVoice);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !("speechSynthesis" in window) || blocks.length === 0) {
      return;
    }

    const stop = speakBlocks(blocks, stepKey);
    const retryTimer = window.setTimeout(() => {
      const synth = window.speechSynthesis;
      if (!synth.speaking && !synth.pending && lastSpokenKeyRef.current !== stepKey) {
        speakBlocks(blocks, stepKey);
      }
    }, 800);

    return () => {
      window.clearTimeout(retryTimer);
      stop?.();
    };
  }, [blocks, enabled, speakBlocks, stepKey]);

  return { speakBlocks, narrationStarted };
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
        const barWidth = orientation === "vertical" ? `${12 + (metric.value / maxValue) * 10}px` : undefined;

        return (
          <div key={metric.label} className={`support-bar support-bar-${orientation}`}>
            <div className="support-bar-label" style={{ color: metric.color }}>
              {metric.label}
            </div>
            <div
              className={`support-bar-track support-bar-track-${orientation}`}
              style={barWidth ? { width: barWidth } : undefined}
            >
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
            <div className="support-bar-value" style={{ color: metric.color }}>
              {percent}%
            </div>
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
  const width = 680;
  const height = 310;
  const margin = 34;
  const labelPadding = 24;
  const maxValue = Math.max(1, ...metrics.map((metric) => metric.value));
  const step = metrics.length > 1 ? (width - margin * 2) / (metrics.length - 1) : 0;
  const points = metrics.map((metric, index) => {
    const x = margin + index * step;
    const y = height - margin - 12 - (metric.value / maxValue) * (height - margin * 2 - 18);
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
        <line x1={margin} y1={height - margin - 12} x2={width - margin} y2={height - margin - 12} className="support-grid-line" />
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
          const isEdge = index === 0 || index === points.length - 1;
          const labelY = isEdge ? point.y + labelPadding : point.y - labelPadding;
          const labelAnchor = index === 0 ? "start" : index === points.length - 1 ? "end" : "middle";
          const dx = index === 0 ? 6 : index === points.length - 1 ? -6 : 0;
          const dy = isEdge ? 8 : -2;

          return (
            <g key={point.metric.label} style={{ opacity: 0.3 + reveal * 0.7 }}>
              <circle cx={point.x} cy={point.y} r={7} fill={point.metric.color} />
              <circle cx={point.x} cy={point.y} r={12} className="support-line-glow" style={{ stroke: point.metric.color }} />
              <text
                x={point.x}
                y={labelY}
                dx={dx}
                dy={dy}
                textAnchor={labelAnchor}
                className={`support-line-label${isEdge ? " is-edge" : ""}`}
              >
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

function MethodsSourcesCard({
  title,
  subtitle,
  methods,
  sources,
  zipHref,
  progress
}: {
  title: string;
  subtitle: string;
  methods: string[];
  sources: { label: string; href: string }[];
  zipHref: string;
  progress: number;
}) {
  return (
    <div className="support-methods-card">
      <div className="support-methods-panel">
        <div className="support-methods-section-title">Methods</div>
        <ul className="support-methods-list">
          {methods.map((method) => (
            <li key={method} className="support-methods-item">
              {method}
            </li>
          ))}
        </ul>
      </div>
      <div className="support-methods-panel">
        <div className="support-methods-section-title">Sources</div>
        <ul className="support-methods-list">
          {sources.map((source) => (
            <li key={source.label} className="support-methods-item">
              <a href={source.href} target={source.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="support-zip-link" href={zipHref}>
          Download presentation zip
        </a>
        <div className="support-methods-progress">
          <div className="support-progress-track">
            <span className="support-progress-fill" style={{ width: `${Math.max(8, progress * 100)}%` }} />
          </div>
          <div className="support-methods-note">{title}</div>
          <div className="support-methods-note support-methods-note-muted">{subtitle}</div>
        </div>
      </div>
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
        {step.graphic.kind === "sources" ? (
          <MethodsSourcesCard
            title={step.graphic.title}
            subtitle={step.graphic.subtitle}
            methods={step.graphic.methods}
            sources={step.graphic.sources}
            zipHref={step.graphic.zipHref}
            progress={progress}
          />
        ) : null}
      </div>
    </div>
  );
}

function RareEarthCards({ cards, progress }: { cards: RareEarthCard[]; progress: number }) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="story-rare-earths" aria-label="Rare earth element cards">
      <div className="story-rare-earths-header">
        <span className="story-rare-earths-kicker">Rare earth lens</span>
        <span className="story-rare-earths-sub">Elements tied to the current geography</span>
      </div>
      <div className="story-rare-earths-grid">
        {cards.map((card, index) => {
          const reveal = clamp(progress * cards.length - index * 0.28);

          return (
            <article
              key={card.symbol}
              className="rare-earth-card"
              style={{
                opacity: 0.28 + reveal * 0.72,
                borderColor: `${card.accent}55`
              }}
            >
              <div className="rare-earth-card-top">
                <span className="rare-earth-number">{card.atomicNumber}</span>
                <span className="rare-earth-symbol" style={{ color: card.accent }}>
                  {card.symbol}
                </span>
              </div>
              <div className="rare-earth-name">{card.name}</div>
              <div className="rare-earth-note">{card.note}</div>
            </article>
          );
        })}
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
  const [presentationStarted, setPresentationStarted] = useState(false);

  const reducedMotion = useReducedMotion();
  const activeStep = STORY_STEPS[activeStepIndex];
  const lastStepIndex = STORY_STEPS.length - 1;
  const typedBlocks = useMemo<StoryTextBlock[]>(
    () => [
      { kind: "title", text: activeStep.title },
      { kind: "label", text: activeStep.label },
      { kind: "description", text: activeStep.description },
      ...activeStep.lines.map((text): StoryTextBlock => ({ kind: "body", text }))
    ],
    [activeStep.description, activeStep.label, activeStep.lines, activeStep.title]
  );
  const { renderedLines, progress, cursorBlockIndex } = useTypewriter(
    typedBlocks,
    `${activeStepIndex}-${activeStep.title}`,
    reducedMotion,
    presentationStarted
  );
  const { speakBlocks, narrationStarted } = useSpeechNarration(
    typedBlocks,
    `${activeStepIndex}-${activeStep.title}`,
    presentationStarted
  );
  const startNarration = () => {
    setPresentationStarted(true);
    speakBlocks(typedBlocks, `${activeStepIndex}-${activeStep.title}`, true);
  };

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

  const europeFlagCountries = useMemo(
    () =>
      Array.from(
        new Set([
          "FR",
          "NO",
          ...countryFeatures
            .filter((country) => country.properties.CONTINENT === "Europe" && country.properties.ISO_A2 !== "RU")
            .map((country) => country.properties.ISO_A2)
        ])
      ).filter((code) => code !== "AQ" && code !== "RU"),
    [countryFeatures]
  );

  const maxPopulation = useMemo(
    () => Math.max(1, ...countryFeatures.map((feature) => Number(feature.properties.POP_EST) || 0)),
    [countryFeatures]
  );

  const colorScale = useMemo(
    () => d3.scaleSequentialSqrt((t) => d3.interpolateRgb("#143a64", "#67e8f9")(t)).domain([0, maxPopulation]),
    [maxPopulation]
  );

  const defaultCapMaterials = useMemo(() => {
    const materials = new Map<string, THREE.MeshPhongMaterial>();

    countryFeatures.forEach((feature) => {
      const code = feature.properties.ISO_A2;
      const color = colorScale(Number(feature.properties.POP_EST) || 0);
      materials.set(
        code,
        new THREE.MeshPhongMaterial({
          color,
          flatShading: true,
          shininess: 10
        })
      );
    });

    return materials;
  }, [colorScale, countryFeatures]);

  const flagMaterials = useFlagMaterials(Array.from(new Set([...ALL_FLAG_COUNTRIES, ...europeFlagCountries])));
  const activeFlagCountries = useMemo(
    () => new Set(activeStep.title === "Europe" ? europeFlagCountries : activeStep.flagCountries),
    [activeStep.flagCountries, activeStep.title, europeFlagCountries]
  );
  const polygonCapMaterial = useMemo(() => {
    return (feature: CountryFeature) => {
      const code = getPolygonFlagKey(feature);
      return (
        (activeFlagCountries.has(code) ? flagMaterials[code] : undefined) ??
        defaultCapMaterials.get(feature.properties.ISO_A2) ??
        new THREE.MeshPhongMaterial({ color: colorScale(Number(feature.properties.POP_EST) || 0), flatShading: true })
      );
    };
  }, [activeFlagCountries, colorScale, defaultCapMaterials, flagMaterials]);

  const markInteraction = () => {
    lastInteractionAtRef.current = Date.now();
    setInteractionTick((value) => value + 1);
  };

  const goToStep = (index: number) => {
    const normalized = (index + STORY_STEPS.length) % STORY_STEPS.length;
    setPresentationStarted(true);
    speakBlocks(
      [
        { kind: "title", text: STORY_STEPS[normalized].title },
        { kind: "label", text: STORY_STEPS[normalized].label },
        { kind: "description", text: STORY_STEPS[normalized].description },
        ...STORY_STEPS[normalized].lines.map((text): StoryTextBlock => ({ kind: "body", text }))
      ],
      `${normalized}-${STORY_STEPS[normalized].title}`,
      true
    );
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

    const lockRotation = reducedMotion || isTransitioning || activeStepIndex !== lastStepIndex;
    if (lockRotation) {
      controls.autoRotate = false;
      return undefined;
    }

    controls.autoRotate = true;

    idleTimerRef.current = window.setTimeout(() => {
      const latestControls = globeRef.current?.controls?.();
      if (latestControls) {
        latestControls.autoRotate = true;
      }
    }, IDLE_ROTATE_DELAY_MS);

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
        polygonCapMaterial={polygonCapMaterial}
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
          {activeStepIndex === 0 && !narrationStarted ? (
            <button type="button" className="story-narration-trigger" onClick={startNarration}>
              Click to start narration
            </button>
          ) : null}
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
              const showCursor = index === cursorBlockIndex;
              const kind = typedBlocks[index]?.kind ?? "body";

              return (
                <p
                  key={`${activeStepIndex}-${index}`}
                  className={`story-typed-line story-typed-${kind}${line ? "" : " is-empty"}`}
                >
                  <span className="story-typed-text">
                    {line || "\u00A0"}
                    {showCursor ? <span className="story-cursor" aria-hidden="true" /> : null}
                  </span>
                </p>
              );
            })}
          </div>

          <div className="story-terminal-footer">
            <div className="story-progress-block">
              <div className="story-progress-track">
                <span className="story-progress-fill" style={{ width: `${Math.max(6, progress * 100)}%`, background: activeStep.accent }} />
              </div>
              <div className="story-progress-copy">
                <span>{Math.round(progress * 100)}% typed</span>
                <span>{progress >= 1 ? "chart settled" : "chart building"}</span>
              </div>
            </div>
            <RareEarthCards cards={activeStep.rareEarths} progress={progress} />
          </div>
        </div>

        <div className="story-dots" aria-label="Story navigation">
          {STORY_STEPS.map((step, index) => (
            <button
              key={`${step.title}-${step.label}-${index}`}
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
