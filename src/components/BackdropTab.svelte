<script>
  import { editorStore, updateBackdrop } from '../stores/editor';
  import { showToast } from '../stores/toast';
  import { GRADIENT_PRESETS } from '../lib/gradient-presets';
  import { gradientToCss, generateRandomGradient, swapGradientColors, rotateGradient } from '../lib/gradient-utils';
  import { Dice6, ArrowLeftRight, RotateCw, Palette, Upload } from 'lucide-svelte';
  import ColorField from './ColorField.svelte';

  $: backdrop = $editorStore.backdrop;

  // Custom gradient state
  let showCustomGradient = false;
  let customColor1 = '#ff6b6b';
  let customColor2 = '#74b9ff';

  // Predefined solid colors
  const solidColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
    '#6c757d', '#495057', '#343a40', '#212529', '#000000',
    '#ff6b6b', '#ee5a24', '#fd79a8', '#a29bfe', '#6c5ce7',
    '#74b9ff', '#0984e3', '#00cec9', '#00b894', '#55a3ff'
  ];

  function handleInsetChange(event) {
    const target = event.target;
    updateBackdrop({ insetPx: parseInt(target.value) });
  }

  function handleOuterRadiusChange(event) {
    const target = event.target;
    updateBackdrop({ outerRadiusPx: parseInt(target.value) });
  }

  function handleInnerRadiusChange(event) {
    const target = event.target;
    updateBackdrop({ innerRadiusPx: parseInt(target.value) });
  }

  function handleFillTypeChange(fillType) {
    updateBackdrop({ fillType: fillType });
  }

  function handleSolidColorSelect(color) {
    updateBackdrop({ solidColor: color, fillType: 'solid' });
  }

  function handleGradientSelect(gradientKey) {
    const gradient = GRADIENT_PRESETS[gradientKey];
    if (gradient) {
      updateBackdrop({ gradient: gradient, fillType: 'gradient' });
    }
  }

  function handleRandomizeGradient() {
    const randomGradient = generateRandomGradient();
    updateBackdrop({ gradient: randomGradient, fillType: 'gradient' });
  }

  function handleSwapGradient() {
    if (backdrop.gradient) {
      const swapped = swapGradientColors(backdrop.gradient);
      updateBackdrop({ gradient: swapped });
    }
  }

  function handleRotateGradient() {
    if (backdrop.gradient) {
      const rotated = rotateGradient(backdrop.gradient, 45);
      updateBackdrop({ gradient: rotated });
    }
  }

  function toggleCustomGradient() {
    showCustomGradient = !showCustomGradient;
    if (showCustomGradient) {
      // Ensure we're in gradient mode when enabling custom colors
      if (backdrop.fillType !== 'gradient') {
        updateBackdrop({ fillType: 'gradient' });
      }
      // Seed colors from current gradient if available
      if (backdrop.gradient && Array.isArray(backdrop.gradient.stops) && backdrop.gradient.stops.length >= 2) {
        customColor1 = backdrop.gradient.stops[0]?.color || customColor1;
        customColor2 = backdrop.gradient.stops[backdrop.gradient.stops.length - 1]?.color || customColor2;
      }
      applyCustomGradient();
    }
  }

  function applyCustomGradient() {
    const customGradient = {
      kind: 'linear',
      angle: 135,
      stops: [
        { color: customColor1, pos: 0 },
        { color: customColor2, pos: 100 }
      ]
    };
    updateBackdrop({ gradient: customGradient, fillType: 'gradient' });
  }

  function handleCustomColor1Change(event) {
    const next = event?.detail ?? event?.target?.value;
    if (typeof next === 'string') customColor1 = next;
    if (showCustomGradient) {
      applyCustomGradient();
    }
  }

  function handleCustomColor2Change(event) {
    const next = event?.detail ?? event?.target?.value;
    if (typeof next === 'string') customColor2 = next;
    if (showCustomGradient) {
      applyCustomGradient();
    }
  }
  
  // Image background functions
  function handleBackgroundImageUpload(event) {
    const input = event.target;
    const file = input.files?.[0];
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          updateBackdrop({ 
            bgImage: result, 
            fillType: 'image' 
          });
          showToast.success('Background image uploaded successfully');
        }
      };
      reader.readAsDataURL(file);
    } else {
      showToast.error('Please select a valid image file');
    }
  }
  
  function handleBgImageBlurChange(event) {
    const target = event.target;
    updateBackdrop({ bgImageBlurPx: parseInt(target.value) });
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
  <!-- Left Column: Layout Controls -->
  <div class="space-y-8">
    <div class="control-section">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-600 lucide lucide-columns3-cog-icon lucide-columns-3-cog" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5"/><path d="m14.3 19.6 1-.4"/><path d="M15 3v7.5"/><path d="m15.2 16.9-.9-.3"/><path d="m16.6 21.7.3-.9"/><path d="m16.8 15.3-.4-1"/><path d="m19.1 15.2.3-.9"/><path d="m19.6 21.7-.4-1"/><path d="m20.7 16.8 1-.4"/><path d="m21.7 19.4-.9-.3"/><path d="M9 3v18"/><circle cx="18" cy="18" r="3"/>
        </svg>
        Layout
      </h3>
      
      <div class="space-y-6">
        <div>
          <label for="inset" class="control-label flex items-center justify-between">
            <span>Inset</span>
            <span class="text-blue-600 font-medium">{backdrop.insetPx}px</span>
          </label>
          <input
            id="inset"
            type="range"
            min="0"
            max="500"
            value={backdrop.insetPx}
            on:input={handleInsetChange}
            class="slider"
          />
        </div>

        <div>
          <label for="outer-radius" class="control-label flex items-center justify-between">
            <span>Outer Radius</span>
            <span class="text-blue-600 font-medium">{backdrop.outerRadiusPx}px</span>
          </label>
          <input
            id="outer-radius"
            type="range"
            min="0"
            max="500"
            value={backdrop.outerRadiusPx}
            on:input={handleOuterRadiusChange}
            class="slider"
          />
        </div>

        <div>
          <label for="inner-radius" class="control-label flex items-center justify-between">
            <span>Inner Radius</span>
            <span class="text-blue-600 font-medium">{backdrop.innerRadiusPx}px</span>
          </label>
          <input
            id="inner-radius"
            type="range"
            min="0"
            max="500"
            value={backdrop.innerRadiusPx}
            on:input={handleInnerRadiusChange}
            class="slider"
          />
        </div>

        <!-- Custom Gradient Colors -->
        {#if showCustomGradient}
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-700">Custom Colors</h4>
            <div class="space-y-4">
              <ColorField
                id="custom-color-1"
                label="Color 1"
                bind:value={customColor1}
                placeholder="#ff6b6b"
                on:input={handleCustomColor1Change}
              />
              <ColorField
                id="custom-color-2"
                label="Color 2"
                bind:value={customColor2}
                placeholder="#74b9ff"
                on:input={handleCustomColor2Change}
              />
            </div>
          </div>
        {/if}

      </div>
    </div>
  </div>

  <!-- Right Column: Background Fill and related controls -->
  <div class="space-y-8">
    <div class="control-section">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-600 lucide lucide-images-icon lucide-images" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16"/><path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/><circle cx="13" cy="7" r="1" fill="currentColor"/><rect x="8" y="2" width="14" height="14" rx="2"/>
        </svg>
        Background Fill
      </h3>
      
      <div class="grid grid-cols-2 gap-2 mb-6">
        <button
          class="px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 {backdrop.fillType === 'solid' 
            ? 'bg-blue-50 border-blue-500 text-blue-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}"
          on:click={() => handleFillTypeChange('solid')}
        >
          Solid
        </button>
        <button
          class="px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 {backdrop.fillType === 'gradient' 
            ? 'bg-blue-50 border-blue-500 text-blue-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}"
          on:click={() => handleFillTypeChange('gradient')}
        >
          Gradient
        </button>
        <button
          class="px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 {backdrop.fillType === 'image' 
            ? 'bg-blue-50 border-blue-500 text-blue-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}"
          on:click={() => handleFillTypeChange('image')}
        >
          Image
        </button>
        <button
          class="px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 {backdrop.fillType === 'transparent' 
            ? 'bg-blue-50 border-blue-500 text-blue-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}"
          on:click={() => handleFillTypeChange('transparent')}
        >
          Transparent
        </button>
      </div>

      <!-- Solid Colors -->
      {#if backdrop.fillType === 'solid'}
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-700">Color Swatches</h4>
          <div class="grid grid-cols-7 gap-2">
            {#each solidColors as color}
              <button
                class="color-swatch {backdrop.solidColor === color 
                  ? 'color-swatch-selected' 
                  : 'color-swatch-unselected'}"
                style="background-color: {color}"
                on:click={() => handleSolidColorSelect(color)}
                aria-label="Select color {color}"
              ></button>
            {/each}
          </div>

          <!-- Custom Solid Color -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700">Custom Color</h4>
            <ColorField
              id="solid-custom-color"
              label=""
              bind:value={backdrop.solidColor}
              placeholder="#ffffff"
              on:input={(e) => updateBackdrop({ solidColor: e.detail, fillType: 'solid' })}
            />
          </div>
        </div>
      {/if}

      <!-- Background Image -->
      {#if backdrop.fillType === 'image'}
        <div class="space-y-4">
          <div class="flex flex-col space-y-4">
            <!-- Image Upload -->
            <div class="space-y-2">
              <h4 class="text-sm font-medium text-gray-700">Background Image</h4>
              
              <label for="bg-image-upload" class="btn-secondary inline-flex items-center justify-center cursor-pointer">
                <Upload size={16} class="mr-2" />
                <span>Upload Image</span>
              </label>
              
              <input
                id="bg-image-upload"
                type="file"
                accept="image/*"
                on:change={handleBackgroundImageUpload}
                class="hidden"
              />
            </div>
            
            <!-- Image Preview -->
            {#if backdrop.bgImage}
              <div class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700">Preview</h4>
                <div class="relative overflow-hidden rounded-lg w-full h-32 border border-gray-200">
                  <img 
                    src={backdrop.bgImage} 
                    alt="Background" 
                    class="w-full h-full object-cover"
                    style={backdrop.bgImageBlurPx ? `filter: blur(${backdrop.bgImageBlurPx}px)` : ''}
                  />
                </div>
              </div>
              
              <!-- Blur Control -->
              <div>
                <label for="blur-control" class="control-label flex items-center justify-between">
                  <span>Blur</span>
                  <span class="text-blue-600 font-medium">{backdrop.bgImageBlurPx || 0}px</span>
                </label>
                <input
                  id="blur-control"
                  type="range"
                  min="0"
                  max="20"
                  value={backdrop.bgImageBlurPx || 0}
                  on:input={handleBgImageBlurChange}
                  class="slider"
                />
              </div>
            {:else}
              <div class="text-sm text-gray-500 italic text-center p-4 bg-gray-50 rounded-lg">
                Upload an image to use as backdrop background
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Transparent Background Info -->
      {#if backdrop.fillType === 'transparent'}
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded" style="
                background-image: 
                  linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
                  linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
                  linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
                background-size: 8px 8px;
                background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
              "></div>
              <div>
                <h4 class="text-sm font-medium text-gray-700">Transparent Background</h4>
                <p class="text-xs text-gray-500">The backdrop will be completely transparent</p>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Gradients -->
      {#if backdrop.fillType === 'gradient'}
        <div class="space-y-6">
          <!-- Gradient Presets -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-700">Gradient Presets</h4>
            <div class="grid grid-cols-2 gap-3">
              {#each Object.entries(GRADIENT_PRESETS) as [key, gradient]}
                <button
                  class="gradient-preset {backdrop.gradient === gradient 
                    ? 'gradient-preset-selected' 
                    : 'gradient-preset-unselected'}"
                  style="background: {gradientToCss(gradient)}"
                  on:click={() => handleGradientSelect(key)}
                  aria-label="Select gradient {key}"
                  title={key}
                ></button>
              {/each}
            </div>
          </div>

          <!-- Gradient Controls -->
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-700">Gradient Tools</h4>
            <div class="grid grid-cols-1 gap-2">
              <div class="grid grid-cols-2 gap-2">
                <button
                  class="btn-secondary justify-center"
                  on:click={handleRandomizeGradient}
                  aria-label="Randomize gradient"
                >
                  <Dice6 size={16} class="mr-1" />
                  <span>Randomize</span>
                </button>
                
                <button
                  class="btn-secondary justify-center {showCustomGradient ? 'bg-blue-50 border-blue-500 text-blue-700' : ''}"
                  on:click={toggleCustomGradient}
                  aria-label="Customize gradient colors"
                >
                  <Palette size={16} class="mr-1" />
                  <span>Customize</span>
                </button>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <button
                  class="btn-secondary justify-center"
                  on:click={handleSwapGradient}
                  aria-label="Swap gradient colors"
                >
                  <ArrowLeftRight size={16} class="mr-1" />
                  <span>Swap</span>
                </button>
                
                <button
                  class="btn-secondary justify-center"
                  on:click={handleRotateGradient}
                  aria-label="Rotate gradient direction"
                >
                  <RotateCw size={16} class="mr-1" />
                  <span>Rotate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-500">
          ✨ For mesh gradients, Rotate and Swap create a new random look!
        </p>
      {/if}
    </div>
  </div>
</div>
