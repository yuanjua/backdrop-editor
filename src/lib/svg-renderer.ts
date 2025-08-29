import type { EditorState, GradientConfig } from './types';

export interface SvgRenderOptions {
  width?: number;   // CSS px
  height?: number;  // CSS px
  scale?: number;   // export scale multiplier
}

export function renderToSvgString(state: EditorState, opts: SvgRenderOptions = {}): string {
  const width = Math.max(400, opts.width ?? 800);
  const height = Math.max(300, opts.height ?? 600);
  const scale = opts.scale ?? 1;

  const pad = calculateShadowPadding(state);
  const totalWidth = (width + pad * 2) * scale;
  const totalHeight = (height + pad * 2) * scale;

  const { backdrop, shadow, imageHasShadow } = state;

  const defs: string[] = [];

  // Shadow filter (drop-shadow)
  if ((imageHasShadow || !imageHasShadow) && shadow.opacity > 0 && !shadow.inset) {
    const rgba = shadowColor(shadow.color, shadow.opacity);
    // Use feDropShadow, supported in modern browsers
    defs.push(`
      <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="${shadow.offsetX}" dy="${shadow.offsetY}" stdDeviation="${shadow.blur / 2}" flood-color="${rgba}" />
      </filter>
    `);
  }

  // Backdrop fill
  const backdropRect = `
    <rect x="${pad}" y="${pad}" rx="${backdrop.outerRadiusPx}" ry="${backdrop.outerRadiusPx}"
      width="${width}" height="${height}"
      ${!imageHasShadow && shadow.opacity > 0 && !shadow.inset ? 'filter="url(#dropShadow)"' : ''}
      fill="${backdropFill(backdrop, width, height, defs, pad)}" />
  `;

  // Subject image area (clip with inner radius)
  const clipPathId = 'imageClip';
  const clipPath = `
    <clipPath id="${clipPathId}">
      <rect x="${pad + backdrop.insetPx}" y="${pad + backdrop.insetPx}" rx="${backdrop.innerRadiusPx}" ry="${backdrop.innerRadiusPx}"
        width="${width - 2 * backdrop.insetPx}" height="${height - 2 * backdrop.insetPx}" />
    </clipPath>
  `;

  // Subject image element (optional; will be filled by href if present)
  const subjectImage = state.imageSrc ? `
    <image xlink:href="${state.imageSrc}"
      x="${pad + backdrop.insetPx}" y="${pad + backdrop.insetPx}"
      width="${width - 2 * backdrop.insetPx}" height="${height - 2 * backdrop.insetPx}"
      preserveAspectRatio="xMidYMid meet"
      clip-path="url(#${clipPathId})"
      ${state.imageHasShadow && shadow.opacity > 0 && !shadow.inset ? 'filter="url(#dropShadow)"' : ''}
    />
  ` : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
      <defs>
        ${defs.join('\n')}
        ${clipPath}
      </defs>
      ${backdropRect}
      ${subjectImage}
    </svg>
  `;

  return svg;
}

function calculateShadowPadding(state: EditorState): number {
  const { shadow } = state;
  const offsetX = Math.abs(shadow.offsetX || 0);
  const offsetY = Math.abs(shadow.offsetY || 0);
  const blur = Math.max(0, shadow.blur || 0);
  const spread = Math.max(0, shadow.spread || 0);
  const maxOffset = Math.max(offsetX, offsetY);
  const shadowExtent = maxOffset + blur + Math.abs(spread);
  return Math.ceil(shadowExtent + 20);
}

function shadowColor(hexOrRgba: string, opacity: number): string {
  if (hexOrRgba.startsWith('rgba') || hexOrRgba.startsWith('rgb')) return hexOrRgba;
  // crude hex -> rgba conversion fallback
  const hex = hexOrRgba.replace('#', '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${opacity})`;
}

function backdropFill(backdrop: any, width: number, height: number, defs: string[], pad: number): string {
  switch (backdrop.fillType) {
    case 'solid':
      return backdrop.solidColor || '#ffffff';
    case 'transparent':
      return 'none';
    case 'gradient':
      if (backdrop.gradient) {
        const id = 'gradFill';
        defs.push(svgGradient(backdrop.gradient, id, width, height, pad));
        return `url(#${id})`;
      }
      return '#ffffff';
    case 'image':
      // For simplicity, use pattern fill for background image
      if (backdrop.bgImage) {
        const id = 'bgPattern';
        defs.push(`
          <pattern id="${id}" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox">
            <image xlink:href="${backdrop.bgImage}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        `);
        return `url(#${id})`;
      }
      return '#ffffff';
    default:
      return '#ffffff';
  }
}

function svgGradient(g: GradientConfig, id: string, width: number, height: number, pad: number): string {
  if (g.kind === 'linear') {
    // Match CSS: 0deg = to top, 90deg = to right
    const cssAngle = g.angle ?? 0;
    const angle = (cssAngle - 90) * (Math.PI / 180);
    const x1 = 50 - Math.cos(angle) * 50;
    const y1 = 50 - Math.sin(angle) * 50;
    const x2 = 50 + Math.cos(angle) * 50;
    const y2 = 50 + Math.sin(angle) * 50;

    return `
      <linearGradient id="${id}" gradientUnits="objectBoundingBox" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        ${g.stops.map(s => `<stop offset="${s.pos}%" stop-color="${s.color}" />`).join('\n')}
      </linearGradient>
    `;
  }

  if (g.kind === 'radial') {
    const cx = g.cx ?? 50;
    const cy = g.cy ?? 50;
    return `
      <radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="70%">
        ${g.stops.map(s => `<stop offset="${s.pos}%" stop-color="${s.color}" />`).join('\n')}
      </radialGradient>
    `;
  }

  // Fallback simple linear for mesh
  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      ${g.stops.map(s => `<stop offset="${s.pos}%" stop-color="${s.color}" />`).join('\n')}
    </linearGradient>
  `;
}

export function svgStringToBlob(svg: string): Blob {
  return new Blob([svg], { type: 'image/svg+xml' });
}
