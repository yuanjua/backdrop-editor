<script>
  import { editorStore, updateShadow, setImageHasShadow } from '../stores/editor';
  import tinycolor from 'tinycolor2';
  import ColorField from './ColorField.svelte';

  $: shadow = $editorStore.shadow;
  $: imageHasShadow = $editorStore.imageHasShadow;

  function handleColorChange(event) {
    // Handle both native input events and ColorField custom events
    const value = event.detail || event.target.value;
    updateShadow({ color: value });
  }

  function handleOpacityChange(event) {
    const target = event.target;
    updateShadow({ opacity: parseFloat(target.value) });
  }

  function handleOffsetXChange(event) {
    const target = event.target;
    updateShadow({ offsetX: parseInt(target.value) });
  }

  function handleOffsetYChange(event) {
    const target = event.target;
    updateShadow({ offsetY: parseInt(target.value) });
  }

  function handleBlurChange(event) {
    const target = event.target;
    updateShadow({ blur: parseInt(target.value) });
  }

  function handleSpreadChange(event) {
    const target = event.target;
    updateShadow({ spread: parseInt(target.value) });
  }

  function handleInsetToggle() {
    updateShadow({ inset: !shadow.inset });
  }
  
  function handleImageShadowToggle() {
    setImageHasShadow(!imageHasShadow);
  }

  // Convert color to rgba for preview
  $: shadowPreview = tinycolor(shadow.color).setAlpha(shadow.opacity).toRgbString();
</script>

<div class="space-y-8">
  <div class="control-section">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
      </svg>
      Shadow Controls
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left column: controls and preview -->
      <div class="space-y-6">
        <!-- Color and Opacity -->
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label for="shadow-opacity" class="control-label flex items-center justify-between">
              <span>Opacity</span>
              <span class="text-blue-600 font-medium">{Math.round(shadow.opacity * 100)}%</span>
            </label>
            <input
              id="shadow-opacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={shadow.opacity}
              on:input={handleOpacityChange}
              class="slider"
            />
          </div>
        </div>

        <!-- Preview -->
        <div class="bg-gray-50 p-6 rounded-xl border">
          <div class="text-sm text-gray-600 mb-4 font-medium">Shadow Preview</div>
          <div class="flex justify-center">
            <div 
              class="w-20 h-20 bg-white rounded-xl transition-all duration-200"
              style="box-shadow: {shadow.inset ? 'inset ' : ''}{shadow.offsetX}px {shadow.offsetY}px {shadow.blur}px {shadow.spread}px {shadowPreview}"
            ></div>
          </div>
        </div>

        <!-- Position Controls -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="shadow-offset-x" class="control-label flex items-center justify-between">
              <span>Offset X</span>
              <span class="text-blue-600 font-medium">{shadow.offsetX}px</span>
            </label>
            <input
              id="shadow-offset-x"
              type="range"
              min="-50"
              max="50"
              value={shadow.offsetX}
              on:input={handleOffsetXChange}
              class="slider"
            />
          </div>

          <div>
            <label for="shadow-offset-y" class="control-label flex items-center justify-between">
              <span>Offset Y</span>
              <span class="text-blue-600 font-medium">{shadow.offsetY}px</span>
            </label>
            <input
              id="shadow-offset-y"
              type="range"
              min="-50"
              max="50"
              value={shadow.offsetY}
              on:input={handleOffsetYChange}
              class="slider"
            />
          </div>
        </div>

        <!-- Effect Controls -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="shadow-blur" class="control-label flex items-center justify-between">
              <span>Blur</span>
              <span class="text-blue-600 font-medium">{shadow.blur}px</span>
            </label>
            <input
              id="shadow-blur"
              type="range"
              min="0"
              max="100"
              value={shadow.blur}
              on:input={handleBlurChange}
              class="slider"
            />
          </div>

          <div>
            <label for="shadow-spread" class="control-label flex items-center justify-between">
              <span>Spread</span>
              <span class="text-blue-600 font-medium">{shadow.spread}px</span>
            </label>
            <input
              id="shadow-spread"
              type="range"
              min="-20"
              max="20"
              value={shadow.spread}
              on:input={handleSpreadChange}
              class="slider"
            />
          </div>
        </div>

        <!-- (Toggles moved to right column) -->
      </div>

      <!-- Right column: Toggles + Preset buttons -->
      <div class="space-y-3">
        <!-- Shadow Color -->
        <h4 class="text-sm font-medium text-gray-700">Shadow Color</h4>
        <div class="space-y-4">
          <ColorField
            id="shadow-color"
            label=""
            bind:value={shadow.color}
            placeholder="#ff6b6b"
            on:input={handleColorChange}
          />
        </div>

        <!-- Shadow Presets -->
        <h4 class="text-sm font-medium text-gray-700">Quick Presets</h4>
        <div class="grid grid-cols-2 gap-2">
          <button
            class="btn-secondary justify-center text-xs py-2"
            on:click={() => updateShadow({ offsetX: 0, offsetY: 4, blur: 6, spread: -1, opacity: 0.1, inset: false })}
          >
            Subtle
          </button>
          <button
            class="btn-secondary justify-center text-xs py-2"
            on:click={() => updateShadow({ offsetX: 0, offsetY: 10, blur: 25, spread: 0, opacity: 0.25, inset: false })}
          >
            Medium
          </button>
          <button
            class="btn-secondary justify-center text-xs py-2"
            on:click={() => updateShadow({ offsetX: 0, offsetY: 20, blur: 40, spread: 0, opacity: 0.35, inset: false })}
          >
            Strong
          </button>
          <button
            class="btn-secondary justify-center text-xs py-2"
            on:click={() => updateShadow({ offsetX: 0, offsetY: 0, blur: 0, spread: 0, opacity: 0, inset: false })}
          >
            None
          </button>
        </div>

        <!-- Shadow Type -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-700">Shadow Type</h4>
          <div class="bg-gray-50 p-4 rounded-lg">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shadow.inset}
                on:change={handleInsetToggle}
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div class="flex-1">
                <span class="text-sm font-medium text-gray-900">Inset Shadow</span>
                <p class="text-xs text-gray-500">Creates an inner shadow effect</p>
              </div>
            </label>
          </div>
          
          
          <!-- Image Shadow Toggle -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={imageHasShadow}
                on:change={handleImageShadowToggle}
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div class="flex-1">
                <span class="text-sm font-medium text-blue-900">Apply to Image</span>
                <p class="text-xs text-blue-700">Adds shadow to the image instead of backdrop</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
