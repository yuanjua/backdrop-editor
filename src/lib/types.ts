export type FillType = 'solid' | 'gradient' | 'image' | 'transparent';

export interface GradientStop {
  color: string;      // hex or rgba
  pos: number;        // 0-100 percentage
}

export interface GradientConfig {
  kind: 'linear' | 'radial' | 'mesh';
  angle?: number;            // degrees (for linear)
  stops: GradientStop[];     // 2..6 stops
  // optional radial focus:
  cx?: number; cy?: number;  // 0..100 for radial center
}

export interface BackdropConfig {
  insetPx: number;           // padding between image and backdrop (px)
  outerRadiusPx: number;     // border-radius of backdrop (px)
  innerRadiusPx: number;     // border-radius of inner image (px)
  fillType: FillType;
  solidColor?: string;       // hex or rgba
  gradient?: GradientConfig;
  bgImage?: string | null;   // data url or asset url
  bgImageBlurPx?: number;
}

export interface ShadowConfig {
  color: string;      // hex or rgba
  opacity: number;    // 0..1
  offsetX: number;    // px
  offsetY: number;    // px
  blur: number;       // px
  spread: number;     // px
  inset?: boolean;
}

export interface EditorState {
  imageSrc: string | null;     // data URL or null
  backdrop: BackdropConfig;
  shadow: ShadowConfig;
  imageHasShadow: boolean;     // whether to apply shadow to image
}
