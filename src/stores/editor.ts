import { writable } from 'svelte/store';
import type { EditorState, BackdropConfig, ShadowConfig } from '../lib/types';

// Default state
const defaultBackdrop: BackdropConfig = {
  insetPx: 40,
  outerRadiusPx: 20,
  innerRadiusPx: 12,
  fillType: 'gradient',
  solidColor: '#ffffff',
  gradient: {
    kind: 'linear',
    angle: 45,
    stops: [
      { color: '#ff9a9e', pos: 0 },
      { color: '#fad0c4', pos: 100 }
    ]
  },
  bgImage: null,
  bgImageBlurPx: 0
};

const defaultShadow: ShadowConfig = {
  color: '#000000',
  opacity: 0.25,
  offsetX: 0,
  offsetY: 10,
  blur: 25,
  spread: 0,
  inset: false
};

const defaultState: EditorState = {
  imageSrc: null,
  backdrop: defaultBackdrop,
  shadow: defaultShadow,
  imageHasShadow: false
};

export const editorStore = writable<EditorState>(defaultState);

// Helper functions
export function updateBackdrop(updates: Partial<BackdropConfig>) {
  editorStore.update(state => ({
    ...state,
    backdrop: { ...state.backdrop, ...updates }
  }));
}

export function updateShadow(updates: Partial<ShadowConfig>) {
  editorStore.update(state => ({
    ...state,
    shadow: { ...state.shadow, ...updates }
  }));
}

export function setImageSrc(imageSrc: string | null) {
  editorStore.update(state => ({
    ...state,
    imageSrc
  }));
}

export function setImageHasShadow(imageHasShadow: boolean) {
  editorStore.update(state => ({
    ...state,
    imageHasShadow
  }));
}

export function resetEditor() {
  editorStore.set(defaultState);
}
