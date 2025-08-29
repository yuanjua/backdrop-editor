import tinycolor from 'tinycolor2';
import type { GradientConfig, GradientStop } from './types';

export function gradientToCss(g: GradientConfig): string {
  if (g.kind === 'linear') {
    const angle = g.angle ?? 180;
    const stops = g.stops.map(s => `${s.color} ${s.pos}%`).join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  if (g.kind === 'radial') {
    const cx = g.cx ?? 50;
    const cy = g.cy ?? 50;
    const stops = g.stops.map(s => `${s.color} ${s.pos}%`).join(', ');
    // radial at position via circle at coordinates
    return `radial-gradient(circle at ${cx}% ${cy}%, ${stops})`;
  }
  // "mesh": approximate via multiple radial gradients layered
  if (g.kind === 'mesh') {
    // Improved strategy:
    // 1) Use a solid base color layer to guarantee full coverage (no gaps).
    // 2) For each focal layer, fade the color out to a transparent version of itself
    //    over a larger radius (70%) for smoother blending.
    const layers: string[] = [];
    const baseColor = g.stops[0]?.color || 'transparent';
    const count = Math.min(4, Math.max(2, Math.floor(g.stops.length / 1)));

    for (let i = 0; i < count; i++) {
      const hueIndex = i % g.stops.length;
      const color = g.stops[hueIndex].color;
      const transparentColor = tinycolor(color).setAlpha(0).toRgbString();
      layers.push(
        `radial-gradient(circle at ${20 + i*30}% ${10 + (i*20)%80}%, ${color} 0%, ${transparentColor} 70%)`
      );
    }

    // Place base color as the bottom-most layer via a solid gradient.
    const baseLayer = `linear-gradient(0deg, ${baseColor}, ${baseColor})`;
    return [...layers, baseLayer].join(', ');
  }
  return 'transparent';
}

function rand(min: number, max: number) { return Math.floor(Math.random()*(max-min+1)) + min; }

export function generateRandomGradient(): GradientConfig {
  const kindRand = Math.random();
  const kind: GradientConfig['kind'] = kindRand < 0.6 ? 'linear' : kindRand < 0.85 ? 'radial' : 'mesh';
  const baseHue = rand(0, 359);
  const stopsCount = rand(2, 4);
  const stops: GradientStop[] = [];

  // create harmonious colors using HSL offsets: analogous or triadic
  const harmony = Math.random() < 0.6 ? 'analogous' : 'triadic';
  for (let i=0; i<stopsCount; i++) {
    let h = baseHue;
    if (harmony === 'analogous') h = (baseHue + (i - 1) * rand(8,30) + 360) % 360;
    else h = (baseHue + i * 120) % 360;
    const s = rand(50, 85); // saturation
    const l = rand(40, 65); // lightness
    const color = tinycolor({ h, s, l }).toHexString();
    const pos = Math.round((i/(stopsCount-1 || 1))*100);
    stops.push({ color, pos });
  }

  const angle = rand(0, 359);
  return { kind, angle, stops };
}

export function swapGradientColors(g: GradientConfig): GradientConfig {
  // Simple approach: reverse the order of colors while keeping positions
  const reversedColors = [...g.stops].reverse().map(stop => stop.color);
  const swappedStops = g.stops.map((stop, i) => ({
    ...stop,
    color: reversedColors[i]
  }));
  
  return { ...g, stops: swappedStops };
}

export function rotateGradient(g: GradientConfig, deg = 90): GradientConfig {
  if (g.kind === 'linear') {
    // Rotate the angle for linear gradients
    return { ...g, angle: ((g.angle ?? 0) + deg) % 360 };
  } else if (g.kind === 'radial') {
    // For radial gradients, rotate the center position around the middle
    const cx = g.cx ?? 50;
    const cy = g.cy ?? 50;
    const centerX = 50, centerY = 50;
    const radius = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
    const currentAngle = Math.atan2(cy - centerY, cx - centerX);
    const newAngle = currentAngle + (deg * Math.PI / 180);
    const newCx = centerX + radius * Math.cos(newAngle);
    const newCy = centerY + radius * Math.sin(newAngle);
    return { ...g, cx: Math.max(0, Math.min(100, newCx)), cy: Math.max(0, Math.min(100, newCy)) };
  } else if (g.kind === 'mesh') {
    // For mesh gradients, create a new randomized layout (since they don't have a clear rotation axis)
    return generateRandomGradient();
  }
  return g;
}

export function shadowToCss(s: { color: string; opacity: number; offsetX: number; offsetY: number; blur: number; spread: number; inset?: boolean }) {
  const rgba = tinycolor(s.color).setAlpha(s.opacity).toRgbString();
  const inset = s.inset ? 'inset ' : '';
  return `${inset}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${rgba}`;
}
