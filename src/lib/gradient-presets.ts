import type { GradientConfig } from './types';

export const GRADIENT_PRESETS: Record<string, GradientConfig> = {
  "Sunset Warm": {
    kind: 'linear',
    angle: 45,
    stops: [
      { color: '#ff9a9e', pos: 0 },
      { color: '#fad0c4', pos: 50 },
      { color: '#fad0c4', pos: 100 },
    ],
  },
  "Cool Ocean": {
    kind: 'linear',
    angle: 120,
    stops: [
      { color: '#a8edea', pos: 0 },
      { color: '#fed6e3', pos: 50 },
      { color: '#f5f7fa', pos: 100 },
    ],
  },
  "Vivid Mesh": {
    kind: 'mesh', // we will synthesize as multiple overlapping radial-gradients
    stops: [
      { color: '#FF5F6D', pos: 0 },
      { color: '#FFC371', pos: 40 },
      { color: '#4AC29A', pos: 70 },
      { color: '#3A1C71', pos: 100 }
    ],
    angle: 60
  },
  "Deep Space": {
    kind: 'radial',
    cx: 30, cy: 20,
    stops: [
      { color: '#0f2027', pos: 0 },
      { color: '#2c5364', pos: 60 },
      { color: '#203a43', pos: 100 }
    ]
  },
  "Purple Rain": {
    kind: 'linear',
    angle: 135,
    stops: [
      { color: '#667eea', pos: 0 },
      { color: '#764ba2', pos: 100 }
    ]
  },
  "Tropical": {
    kind: 'linear',
    angle: 90,
    stops: [
      { color: '#00d2ff', pos: 0 },
      { color: '#3a7bd5', pos: 100 }
    ]
  }
};
