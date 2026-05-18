"use client";

import dynamic from "next/dynamic";
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

type StoryStep = {
  title: string;
  label: string;
  description: string;
  pov: { lat: number; lng: number; altitude: number };
};

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false }) as any;
const COUNTRIES_DATA_URL = "/Story7/datasets/ne_110m_admin_0_countries.geojson";
const EARTH_TEXTURE = "https://cdn.jsdelivr.net/npm/three-globe@2.32/example/img/earth-night.jpg";
const BACKGROUND_TEXTURE = "https://cdn.jsdelivr.net/npm/three-globe@2.32/example/img/night-sky.png";
const STORY_TRANSITION_MS = 1400;
const IDLE_ROTATE_DELAY_MS = 5000;
const AUTO_ROTATE_SPEED = 0.32;

const STORY_STEPS: StoryStep[] = [
  {
    title: "United States",
    label: "US",
    description: "Start at the demand center. The globe opens on the United States as the reference point for the rest of the narrative.",
    pov: { lat: 39.5, lng: -98.5, altitude: 1.9 }
  },
  {
    title: "China",
    label: "China",
    description: "Rotate east to the dominant refining and processing center where many critical mineral chains concentrate.",
    pov: { lat: 35.5, lng: 104, altitude: 1.55 }
  },
  {
    title: "South America",
    label: "South America",
    description: "Pull back to the lithium and copper corridor, where continent-scale supply patterns matter more than a single country.",
    pov: { lat: -15, lng: -63, altitude: 1.35 }
  },
  {
    title: "Russia",
    label: "Russia",
    description: "Shift north to a high-risk supplier region where geopolitical stress can interrupt strategic mineral flows.",
    pov: { lat: 61, lng: 98, altitude: 1.55 }
  },
  {
    title: "Europe",
    label: "Europe",
    description: "Move to allied processing and industrial demand nodes that shape downstream resilience and substitution capacity.",
    pov: { lat: 53, lng: 12, altitude: 1.65 }
  },
  {
    title: "Back to the United States",
    label: "US",
    description: "Return home to close the loop: the story resolves back to U.S. vulnerability, resilience, and policy choices.",
    pov: { lat: 39.5, lng: -98.5, altitude: 1.9 }
  }
];

export default function ChoroplethCountriesGlobe() {
  const globeRef = useRef<any>(null);
  const idleTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const lastInteractionAtRef = useRef<number>(performance.now());

  const [countries, setCountries] = useState<{ features: CountryFeature[] }>({ features: [] });
  const [hoverCountry, setHoverCountry] = useState<CountryFeature | undefined>();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [interactionTick, setInteractionTick] = useState(0);
  const [globeReadyTick, setGlobeReadyTick] = useState(0);

  const activeStep = STORY_STEPS[activeStepIndex];
  const lastStepIndex = STORY_STEPS.length - 1;

  useEffect(() => {
    let active = true;

    fetch(COUNTRIES_DATA_URL)
      .then((response) => response.json())
      .then((data: { features?: CountryFeature[] }) => {
        if (!active) return;
        setCountries({ features: Array.isArray(data.features) ? data.features : [] });
      })
      .catch(() => {
        if (active) setCountries({ features: [] });
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
    () => d3.scaleSequentialSqrt((t) => d3.interpolateRgb("green", "red")(t)).domain([0, maxPopulation]),
    [maxPopulation]
  );

  const markInteraction = () => {
    lastInteractionAtRef.current = performance.now();
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
    if (!globe) return;

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
    if (!globe) return;

    const controls = globe.controls?.();
    if (!controls) return;

    controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    controls.autoRotate = false;

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }

    if (activeStepIndex !== lastStepIndex || isTransitioning) {
      return undefined;
    }

    const elapsed = performance.now() - lastInteractionAtRef.current;
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
  }, [activeStepIndex, isTransitioning, interactionTick, lastStepIndex, globeReadyTick]);

  return (
    <div
      className="story-shell"
      tabIndex={0}
      onPointerDownCapture={markInteraction}
      onPointerMoveCapture={markInteraction}
      onWheelCapture={(event) => {
        event.preventDefault();
        markInteraction();
      }}
      onKeyDownCapture={markInteraction}
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
          feature === hoverCountry
            ? "steelblue"
            : colorScale(Number(feature.properties.POP_EST) || 0)
        }
        polygonSideColor={() => "rgba(0, 0, 0, 0.2)"}
        polygonStrokeColor={() => "#111"}
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

      <div className="story-hud">
        <div className="story-kicker">
          Section {String(activeStepIndex + 1).padStart(2, "0")} of {String(STORY_STEPS.length).padStart(2, "0")}
        </div>
        <div className="story-title">{activeStep.title}</div>
        <div className="story-description">{activeStep.description}</div>
        <div className="story-dots" aria-label="Story navigation">
          {STORY_STEPS.map((step, index) => (
            <button
              key={step.title}
              type="button"
              className={`story-dot${index === activeStepIndex ? " is-active" : ""}`}
              aria-label={`Jump to ${step.title}`}
              aria-current={index === activeStepIndex ? "step" : undefined}
              onClick={() => goToStep(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
