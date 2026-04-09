'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Hurricane Intensity Spiral Animation
 * Inspired by NASA's Climate Spiral (https://svs.gsfc.nasa.gov/5190)
 * Shows hurricane wind speeds and categories over time in an animated spiral
 */

interface HurricaneData {
  year: number;
  month: number;
  windSpeed: number;
  category: number;
  tempAnomaly: number;
  hurricaneCount: number;
}

const HurricaneSpiralAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const dataRef = useRef<HurricaneData[]>([]);

  // Color scale for wind intensity (Saffir-Simpson categories)
  const getColorForWindSpeed = (windSpeed: number): string => {
    if (windSpeed < 74) return '#FFEB3B'; // Yellow: Tropical Storm (39-73 mph)
    if (windSpeed < 96) return '#FF9800'; // Orange: Category 1 (74-95)
    if (windSpeed < 111) return '#FF5722'; // Deep Orange: Category 2 (96-110)
    if (windSpeed < 130) return '#D32F2F'; // Red: Category 3 (111-129)
    if (windSpeed < 157) return '#B71C1C'; // Dark Red: Category 4 (130-156)
    return '#7B1FA2'; // Purple: Category 5 (157+)
  };

  const getCategoryLabel = (windSpeed: number): string => {
    if (windSpeed < 39) return 'TD'; // Tropical Depression
    if (windSpeed < 74) return 'TS'; // Tropical Storm
    if (windSpeed < 96) return 'Cat1';
    if (windSpeed < 111) return 'Cat2';
    if (windSpeed < 130) return 'Cat3';
    if (windSpeed < 157) return 'Cat4';
    return 'Cat5';
  };

  // Generate sample data from 1980-2025
  useEffect(() => {
    const generateData = () => {
      const data: HurricaneData[] = [];
      const startYear = 1980;
      const endYear = 2025;

      for (let year = startYear; year <= endYear; year++) {
        // Simulate increasing hurricane intensity trend
        const warmingTrend = (year - startYear) / (endYear - startYear) * 0.8;
        const tempAnomaly = -0.2 + warmingTrend;
        
        // Number of hurricanes per year
        const baseHurricanes = 80 + warmingTrend * 60;
        const hurricaneCount = Math.round(baseHurricanes + Math.random() * 30);

        // Generate monthly data for each hurricane season month (June-November)
        for (let month = 6; month <= 11; month++) {
          const monthlyVariation = Math.sin((month - 6) * Math.PI / 5) * 20;
          const baseWind = 100 + warmingTrend * 30 + monthlyVariation;
          const windSpeed = Math.max(39, baseWind + (Math.random() - 0.5) * 40);

          data.push({
            year,
            month,
            windSpeed: Math.round(windSpeed),
            category: Math.ceil((Math.max(39, windSpeed) - 39) / 18),
            tempAnomaly,
            hurricaneCount,
          });
        }
      }

      return data;
    };

    dataRef.current = generateData();
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 40;

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, width, height);

      // Draw spiral grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      // Draw concentric circles (years)
      for (let i = 0; i <= 45; i += 5) {
        const radius = (i / 45) * maxRadius;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw radial lines (months)
      for (let month = 0; month < 12; month++) {
        const angle = (month / 12) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * maxRadius;
        const y = centerY + Math.sin(angle) * maxRadius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Draw data points
      const progressYear = 1980 + animationProgress * (2025 - 1980);

      dataRef.current.forEach((point) => {
        if (point.year > progressYear) return;

        const yearProgress = point.year - 1980;
        const radiusNormalized = yearProgress / 45;
        const monthAngle = (point.month / 12) * Math.PI * 2 - Math.PI / 2;

        const radius = radiusNormalized * maxRadius;
        const x = centerX + Math.cos(monthAngle) * radius;
        const y = centerY + Math.sin(monthAngle) * radius;

        // Draw point sized by wind speed
        const pointSize = Math.max(3, (point.windSpeed - 39) / 120 * 15);
        const color = getColorForWindSpeed(point.windSpeed);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for strong hurricanes
        if (point.windSpeed > 120) {
          ctx.fillStyle = color + '40';
          ctx.beginPath();
          ctx.arc(x, y, pointSize * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';

      // Year labels
      for (let i = 0; i <= 45; i += 5) {
        const year = 1980 + i;
        const radius = (i / 45) * maxRadius;
        ctx.fillText(year.toString(), centerX, centerY - radius - 5);
      }

      // Month labels
      const months = ['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV'];
      for (let month = 0; month < 6; month++) {
        const angle = (month / 6) * Math.PI * 2 - Math.PI / 2;
        const labelRadius = maxRadius + 30;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;
        ctx.fillText(months[month], x, y);
      }

      // Draw title and info
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('Hurricane Intensity Spiral', 20, 30);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Inspired by NASA Climate Spiral', 20, 55);

      const currentYear = Math.round(1980 + animationProgress * 45);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Year: ${currentYear}`, 20, height - 20);

      // Draw legend
      const legendY = height - 100;
      ctx.font = '12px Arial';
      const categories = [
        { label: 'Tropical Storm', wind: 55, color: '#FFEB3B' },
        { label: 'Category 2', wind: 105, color: '#FF5722' },
        { label: 'Category 4', wind: 145, color: '#B71C1C' },
        { label: 'Category 5', wind: 160, color: '#7B1FA2' },
      ];

      categories.forEach((cat, i) => {
        ctx.fillStyle = cat.color;
        ctx.fillRect(width - 200, legendY + i * 20, 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`${cat.label} (${cat.wind} mph)`, width - 180, legendY + i * 20 + 10);
      });
    };

    animate();
  }, [animationProgress]);

  // Animation loop
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        const next = prev + 0.002;
        return next > 1 ? 0 : next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl space-y-4">
        <canvas
          ref={canvasRef}
          width={1000}
          height={900}
          className="w-full border-2 border-slate-600 rounded-lg shadow-2xl"
        />

        <div className="flex gap-4 justify-center items-center mx-auto px-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={() => setAnimationProgress(0)}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-semibold transition"
          >
            ↻ Reset
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={animationProgress}
            onChange={(e) => {
              setAnimationProgress(parseFloat(e.target.value));
              setPlaying(false);
            }}
            className="w-64 cursor-pointer"
          />

          <span className="text-white font-semibold min-w-[100px]">
            {Math.round(1980 + animationProgress * 45)}
          </span>
        </div>

        <div className="text-slate-300 text-center text-sm space-y-2 px-4">
          <p>
            Each point represents a hurricane track position colored by wind intensity.
            The spiral shows how hurricane strength has evolved from 1980 to 2025.
          </p>
          <p className="text-slate-400">
            Warmer colors (red/purple) indicate stronger storms. Larger points indicate higher wind speeds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HurricaneSpiralAnimation;
