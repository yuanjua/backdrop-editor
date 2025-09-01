import tinycolor from 'tinycolor2';
import type { EditorState, GradientConfig } from './types';

interface RenderOptions {
  scale?: number;
  // If provided, these take precedence and should match preview composition size
  width?: number;
  height?: number;
  // Fallback sizing if width/height not provided
  maxWidth?: number;
  maxHeight?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  // Measured inner image wrapper dimensions from the preview (in CSS px)
  measuredInnerWidth?: number;
  measuredInnerHeight?: number;
  // For JPEG: crop to backdrop bounds and remove outer radius
  cropToBackdrop?: boolean;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScale = 1;
  private baseWidth = 0;
  private baseHeight = 0;
  private measuredInnerWidth?: number;
  private measuredInnerHeight?: number;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    this.ctx = ctx;
  }

  async render(state: EditorState, options: RenderOptions = {}): Promise<HTMLCanvasElement> {
    const {
  scale = 1,
  width,
  height,
  maxWidth = 1200,
  maxHeight = 800,
      format = 'png'
    } = options;

  this.currentScale = scale;

  // Calculate base dimensions based on provided exact size or fallback
  const baseWidth = width ? Math.max(1, width) : Math.max(400, maxWidth / scale);
  const baseHeight = height ? Math.max(1, height) : Math.max(300, maxHeight / scale);
  this.baseWidth = baseWidth;
  this.baseHeight = baseHeight;
  this.measuredInnerWidth = options.measuredInnerWidth;
  this.measuredInnerHeight = options.measuredInnerHeight;

  // Calculate shadow padding (skip when cropping to backdrop)
  const cropToBackdrop = options.cropToBackdrop ?? (format === 'jpeg');
  const shadowPadding = cropToBackdrop ? 0 : this.calculateShadowPadding(state);
    
    // Set canvas dimensions with padding for shadows
    const canvasWidth = (baseWidth + shadowPadding * 2) * scale;
    const canvasHeight = (baseHeight + shadowPadding * 2) * scale;
    
  // Use integer pixel sizes for the backing store to avoid subpixel resampling
  this.canvas.width = Math.round(canvasWidth);
  this.canvas.height = Math.round(canvasHeight);
    
    // Scale context for high DPI
    this.ctx.scale(scale, scale);
  this.ctx.imageSmoothingEnabled = true;
  this.ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width / scale, this.canvas.height / scale);

    // Start drawing from shadow padding offset
    const offsetX = shadowPadding;
    const offsetY = shadowPadding;

    // If exporting JPEG with transparent backdrop, fill white background
    if (format === 'jpeg' && state.backdrop.fillType === 'transparent') {
      this.ctx.save();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width / scale, this.canvas.height / scale);
      this.ctx.restore();
    }

  // Render backdrop
  await this.renderBackdrop(state, offsetX, offsetY, baseWidth, baseHeight, { cropToBackdrop, format });

    // Render image with shadow if present
    if (state.imageSrc) {
      await this.renderImage(state, offsetX, offsetY, baseWidth, baseHeight);
    }

    return this.canvas;
  }

  private calculateShadowPadding(state: EditorState): number {
    const { shadow } = state;
    const offsetX = Math.abs(shadow.offsetX || 0);
    const offsetY = Math.abs(shadow.offsetY || 0);
    const blur = Math.max(0, shadow.blur || 0);
    const spread = Math.max(0, shadow.spread || 0);
    
    // Calculate maximum shadow extent
    const maxOffset = Math.max(offsetX, offsetY);
    const shadowExtent = maxOffset + blur + Math.abs(spread);
    
    // Add some buffer
    return Math.ceil(shadowExtent + 20);
  }

  private async renderBackdrop(state: EditorState, x: number, y: number, width: number, height: number, opts: { cropToBackdrop: boolean; format: 'png'|'jpeg' }): Promise<void> {
    const { backdrop, shadow, imageHasShadow } = state;
    const outerRadius = opts.cropToBackdrop && opts.format === 'jpeg' ? 0 : backdrop.outerRadiusPx;
    
    // Calculate backdrop dimensions with inset
    const backdropX = x;
    const backdropY = y;
    const backdropWidth = width;
    const backdropHeight = height;
    
    // Save context state
    this.ctx.save();

    // 1) Draw shadow first for backdrop (if shadow is not applied to image)
    if (!imageHasShadow && shadow.opacity > 0) {
      // Configure shadow
      this.applyDropShadow(shadow);
      // Shape that casts the shadow
      this.createRoundedRect(backdropX, backdropY, backdropWidth, backdropHeight, outerRadius);
      // Use opaque fill so the shadow is actually drawn (transparent fill would not render a shadow)
      this.ctx.fillStyle = tinycolor(shadow.color).toRgbString();
      this.ctx.fill();
      // Reset shadow before drawing content
      this.applyDropShadow({ opacity: 0, blur: 0, offsetX: 0, offsetY: 0, color: 'transparent' });
    }

    // 2) Draw actual backdrop content on top
    this.createRoundedRect(backdropX, backdropY, backdropWidth, backdropHeight, outerRadius);
    await this.fillBackdrop(backdrop, backdropX, backdropY, backdropWidth, backdropHeight, outerRadius);

    // Restore context state
    this.ctx.restore();
  }

  private async fillBackdrop(backdrop: any, x: number, y: number, width: number, height: number, radius: number): Promise<void> {
    switch (backdrop.fillType) {
      case 'solid':
        this.ctx.fillStyle = backdrop.solidColor || '#ffffff';
        this.ctx.fill();
        break;
        
      case 'gradient':
        if (backdrop.gradient) {
          if (backdrop.gradient.kind === 'mesh') {
            // Layered radial gradient approximation (to match DOM mesh preset)
            this.renderMeshGradient(backdrop.gradient, x, y, width, height);
          } else {
            const gradient = this.createCanvasGradient(backdrop.gradient, x, y, width, height);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
          }
        }
        break;
        
      case 'image':
        if (backdrop.bgImage) {
          await this.fillWithBackgroundImage(backdrop, x, y, width, height, radius);
        }
        break;
        
      case 'transparent':
        // Don't fill, leave transparent
        break;
        
      default:
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
    }
  }

  private async fillWithBackgroundImage(backdrop: any, x: number, y: number, width: number, height: number, radius: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.ctx.save();
        // Clip to rounded rect and draw the background image inside
  this.createRoundedRect(x, y, width, height, radius);
        this.ctx.clip();
        
        // Apply blur if specified
        if (backdrop.bgImageBlurPx && backdrop.bgImageBlurPx > 0) {
          this.ctx.filter = `blur(${backdrop.bgImageBlurPx}px)`;
        }
        
        // Draw image to cover the backdrop area
        this.drawImageCover(img, x, y, width, height);
        
        this.ctx.restore();
        resolve();
      };
      
      img.onerror = () => reject(new Error('Failed to load background image'));
      img.src = backdrop.bgImage;
    });
  }

  private async renderImage(state: EditorState, offsetX: number, offsetY: number, backdropWidth: number, backdropHeight: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const { backdrop, shadow, imageHasShadow } = state;

  // Content box inside backdrop padding (where the subject sits)
  const contentX = offsetX + backdrop.insetPx;
  const contentY = offsetY + backdrop.insetPx;
  const contentWidth = backdropWidth - backdrop.insetPx * 2;
  const contentHeight = backdropHeight - backdrop.insetPx * 2;

        // Calculate image dimensions while maintaining aspect ratio
        const imageAspect = img.width / img.height;
  const areaAspect = contentWidth / contentHeight;

        // Determine wrapper size: prefer measured inner wrapper dims from preview
        let wrapperWidth: number;
        let wrapperHeight: number;

        if (this.measuredInnerWidth && this.measuredInnerHeight) {
          // Clamp measured to content box
          wrapperWidth = Math.min(contentWidth, this.measuredInnerWidth);
          wrapperHeight = Math.min(contentHeight, this.measuredInnerHeight);
          // Maintain aspect ratio from measured; if mismatch, adjust by contain
          const measuredAspect = this.measuredInnerWidth / this.measuredInnerHeight;
          const targetAspect = wrapperWidth / wrapperHeight;
          if (Math.abs(measuredAspect - targetAspect) > 0.01) {
            // contain into wrapper bounds preserving measured aspect
            if (measuredAspect > targetAspect) {
              wrapperHeight = wrapperWidth / measuredAspect;
            } else {
              wrapperWidth = wrapperHeight * measuredAspect;
            }
          }
        } else {
          // Compute by contain into content box with max-height 500
          if (imageAspect > areaAspect) {
            wrapperHeight = contentHeight;
            wrapperWidth = wrapperHeight * imageAspect;
            if (wrapperWidth > contentWidth) {
              wrapperWidth = contentWidth;
              wrapperHeight = wrapperWidth / imageAspect;
            }
          } else {
            wrapperWidth = Math.min(contentWidth, contentHeight * imageAspect);
            wrapperHeight = wrapperWidth / imageAspect;
          }
        }

        // Position centered inside content box
        const wrapperX = contentX + (contentWidth - wrapperWidth) / 2;
        const wrapperY = contentY + (contentHeight - wrapperHeight) / 2;

        // Compute draw size: do not upscale beyond image natural size
        const maxScale = Math.min(wrapperWidth / img.width, wrapperHeight / img.height);
        const safeScale = Math.min(1, maxScale);
        const drawWidth = img.width * safeScale;
        const drawHeight = img.height * safeScale;
        const localX = (wrapperWidth - drawWidth) / 2;
        const localY = (wrapperHeight - drawHeight) / 2;

  // Render clipped image to offscreen canvas for correct shadowing at device scale
  const exportScale = this.currentScale;
  const off = document.createElement('canvas');
  off.width = Math.max(1, Math.floor(wrapperWidth * exportScale));
  off.height = Math.max(1, Math.floor(wrapperHeight * exportScale));
        const offCtx = off.getContext('2d');
        if (!offCtx) {
          resolve();
          return;
        }
        offCtx.save();
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.scale(exportScale, exportScale);

        // Clip to rounded rect
        offCtx.beginPath();
        // Recreate rounded rect path at (0,0)
  this.roundedRectPath(offCtx, 0, 0, wrapperWidth, wrapperHeight, backdrop.innerRadiusPx);
        offCtx.clip();

  offCtx.drawImage(img, localX, localY, drawWidth, drawHeight);
        offCtx.restore();

        // Draw offscreen onto main with optional shadow
        this.ctx.save();
        if (imageHasShadow && shadow.opacity > 0) {
          this.applyDropShadow(shadow);
        }
  this.ctx.drawImage(off, wrapperX, wrapperY, wrapperWidth, wrapperHeight);
        this.ctx.restore();

        resolve();
      };

      img.onerror = () => reject(new Error('Failed to load source image'));
      img.src = state.imageSrc!;
    });
  }

  private roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  private applyDropShadow(shadow: any): void {
    if (shadow.inset) {
      // Inset shadows are complex in canvas, skip for now or implement with compositing
      return;
    }
    
    const color = tinycolor(shadow.color).setAlpha(shadow.opacity).toRgbString();
    
    this.ctx.shadowColor = color;
    this.ctx.shadowOffsetX = shadow.offsetX || 0;
    this.ctx.shadowOffsetY = shadow.offsetY || 0;
    this.ctx.shadowBlur = shadow.blur || 0;
    // Note: Canvas doesn't support shadow spread, we'd need to simulate it
  }

  private createCanvasGradient(gradientConfig: GradientConfig, x: number, y: number, width: number, height: number): CanvasGradient {
    let gradient: CanvasGradient;
    
    if (gradientConfig.kind === 'linear') {
      // Match CSS angle: 0deg = to top, 90deg = to right
      // Convert CSS angle to canvas radians
      const cssAngle = gradientConfig.angle ?? 0;
      const a = (cssAngle - 90) * (Math.PI / 180);
      const cx = x + width / 2;
      const cy = y + height / 2;
      const x1 = cx - Math.cos(a) * width / 2;
      const y1 = cy - Math.sin(a) * height / 2;
      const x2 = cx + Math.cos(a) * width / 2;
      const y2 = cy + Math.sin(a) * height / 2;
      
      gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    } else if (gradientConfig.kind === 'radial') {
      const centerX = x + width * (gradientConfig.cx || 50) / 100;
      const centerY = y + height * (gradientConfig.cy || 50) / 100;
      const radius = Math.max(width, height) / 2;
      
      gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    } else {
      // Fallback to linear for mesh
      const a = (45 - 90) * (Math.PI / 180);
      const cx = x + width / 2;
      const cy = y + height / 2;
      const x1 = cx - Math.cos(a) * width / 2;
      const y1 = cy - Math.sin(a) * height / 2;
      const x2 = cx + Math.cos(a) * width / 2;
      const y2 = cy + Math.sin(a) * height / 2;
      gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    }
    
    // Add color stops
    gradientConfig.stops.forEach(stop => {
      gradient.addColorStop(stop.pos / 100, stop.color);
    });
    
    return gradient;
  }

  private renderMeshGradient(gradientConfig: GradientConfig, x: number, y: number, width: number, height: number) {
    // Approximate mesh by layering radial gradients like CSS preset
  // Paint a solid base using the first stop color to guarantee full coverage
  this.ctx.save();
  const baseColor = gradientConfig.stops[0]?.color || '#000000';
  this.ctx.fillStyle = baseColor;
  this.ctx.fillRect(x, y, width, height);
    const layers: { cx: number; cy: number; color: string }[] = [];
    const count = Math.min(4, Math.max(2, Math.floor(gradientConfig.stops.length / 1)));
    for (let i = 0; i < count; i++) {
      const hueIndex = i % gradientConfig.stops.length;
      const color = gradientConfig.stops[hueIndex].color;
      const cxPct = 20 + i * 30; // matches gradient-utils preset
      const cyPct = 10 + (i * 20) % 80;
      const cxPos = x + (cxPct / 100) * width;
      const cyPos = y + (cyPct / 100) * height;
      layers.push({ cx: cxPos, cy: cyPos, color });
    }

    const r = 0.7 * Math.min(width, height);
    layers.forEach(layer => {
      const transparentColor = tinycolor(layer.color).setAlpha(0).toRgbString();
      const rg = this.ctx.createRadialGradient(layer.cx, layer.cy, 0, layer.cx, layer.cy, r);
      rg.addColorStop(0, layer.color);
      rg.addColorStop(0.7, transparentColor);
      this.ctx.fillStyle = rg;
      this.ctx.fillRect(x, y, width, height);
    });
    this.ctx.restore();
  }

  private createRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  private drawImageCover(img: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    const imageAspect = img.width / img.height;
    const areaAspect = width / height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > areaAspect) {
      // Image is wider, scale by height and crop width
      drawHeight = height;
      drawWidth = height * imageAspect;
      drawX = x - (drawWidth - width) / 2;
      drawY = y;
    } else {
      // Image is taller, scale by width and crop height
      drawWidth = width;
      drawHeight = width / imageAspect;
      drawX = x;
      drawY = y - (drawHeight - height) / 2;
    }
    
    this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  toBlob(format: 'png' | 'jpeg' = 'png', quality: number = 0.92): Promise<Blob | null> {
    return new Promise(resolve => {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      this.canvas.toBlob(resolve, mimeType, quality);
    });
  }

  destroy(): void {
    // Clean up canvas
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
