<script>
  import { writable, get } from 'svelte/store';
  import { editorStore } from '../stores/editor';
  import { showToast } from '../stores/toast';
  import { gradientToCss } from '../lib/gradient-utils';
  import { onMount } from 'svelte';
  import { Save, Star, Trash2 } from 'lucide-svelte';

  // Load presets from localStorage on mount
  const STORAGE_KEY = 'bettershot-presets';
  const presets = writable([]);
  
  function loadPresets() {
    try {
      const savedPresets = localStorage.getItem(STORAGE_KEY);
      if (savedPresets) {
        presets.set(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
      showToast.error('Failed to load saved presets');
    }
  }
  
  function savePresetsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get(presets)));
    } catch (error) {
      console.error('Failed to save presets:', error);
      showToast.error('Failed to save presets');
    }
  }
  
  // Save current settings as a preset
  function saveCurrentAsPreset() {
    const currentState = get(editorStore);
    const presetsList = get(presets);
    
    // Generate a unique preset name: "Preset N" where N is next available number
    const nums = presetsList
      .map(p => {
        const m = /^Preset\s+(\d+)$/.exec(p.name || '');
        return m ? parseInt(m[1], 10) : null;
      })
      .filter((n) => typeof n === 'number');
    let nextNum = (nums.length ? Math.max(...nums) : 0) + 1;
    let presetName = `Preset ${nextNum}`;
    const names = new Set(presetsList.map(p => p.name));
    while (names.has(presetName)) {
      nextNum += 1;
      presetName = `Preset ${nextNum}`;
    }
    
    // Add new preset
    const newPreset = {
      name: presetName,
      backdrop: { ...currentState.backdrop },
      shadow: { ...currentState.shadow },
      imageHasShadow: currentState.imageHasShadow,
      createdAt: new Date().toISOString()
    };
    
  presets.update(p => [...p, newPreset]);
    savePresetsToStorage();
    showToast.success(`Saved as ${presetName}`);
  }
  
  // Apply preset
  function applyPreset(preset) {
    editorStore.update(state => ({
      ...state,
      backdrop: { ...preset.backdrop },
      shadow: { ...preset.shadow },
      imageHasShadow: preset.imageHasShadow
    }));
    showToast.success(`Applied ${preset.name}`);
  }
  
  // Delete preset
  function deletePreset(presetName) {
    presets.update(p => p.filter(preset => preset.name !== presetName));
    savePresetsToStorage();
    showToast.success(`Deleted ${presetName}`);
  }
  
  // Get preview style for a preset
  function getPreviewStyle(preset) {
    const backdrop = preset.backdrop;
    let background = '';
    
    if (backdrop.fillType === 'solid') {
      background = backdrop.solidColor || '#ffffff';
    } else if (backdrop.fillType === 'gradient' && backdrop.gradient) {
      background = gradientToCss(backdrop.gradient);
    } else if (backdrop.fillType === 'transparent') {
      background = 'transparent';
    } else if (backdrop.fillType === 'image' && backdrop.bgImage) {
      background = `url(${backdrop.bgImage})`;
      return `background: ${background}; background-size: cover; background-position: center;`;
    }
    
  return `background: ${background};`;
  }

  onMount(() => {
    loadPresets();
  });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900">
      <Star class="inline-block w-5 h-5 mr-2 text-yellow-500" />
      Saved Presets
    </h3>
  </div>
  
  {#if $presets.length === 0}
    <div class="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
      <!-- Save Current card shows initially when no presets exist -->
      <button
        class="group bg-white border border-dashed border-blue-300 rounded-lg overflow-hidden hover:border-blue-500 transition-colors flex flex-col"
        on:click={() => { saveCurrentAsPreset(); }}
        title="Save current settings as a new preset"
      >
        <div class="w-full h-20 relative flex items-center justify-center bg-blue-50">
          <div class="flex items-center text-blue-700 text-sm font-medium">
            <Save size={16} class="mr-2" />
            Save Current
          </div>
        </div>
        <div class="p-3">
          <p class="text-xs text-gray-500">as preset</p>
        </div>
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
      {#each $presets as preset, idx}
        <div class="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
          <!-- Preview -->
          <button 
            class="w-full h-20 relative overflow-hidden"
            style={getPreviewStyle(preset)}
            on:click={() => applyPreset(preset)}
            title="Click to apply {preset.name}"
          >
            <!-- Transparent background pattern for transparent presets -->
            {#if preset.backdrop.fillType === 'transparent'}
              <div class="absolute inset-0 opacity-30" style="
                background-image: 
                  linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
                  linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
                  linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
                background-size: 8px 8px;
                background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
              "></div>
            {/if}
    <!-- Mini image placeholder partially visible at bottom-right (approx. 3/5 visible) -->
            <div class="absolute bottom-2 right-2">
              <div
                class="w-20 h-12 bg-white rounded-sm overflow-hidden border border-gray-200"
                style="
                  border-radius: {Math.max(1, (preset.backdrop.innerRadiusPx || 0) / 6)}px;
      box-shadow: ${preset.shadow.inset ? 'inset ' : ''}${preset.shadow.offsetX/4 || 0}px ${preset.shadow.offsetY/4 || 0}px ${preset.shadow.blur/4 || 0}px ${preset.shadow.spread/4 || 0}px rgba(0,0,0,${preset.shadow.opacity || 0});
                  transform: translate(40%, 40%);
                "
                title="Mini subject preview (partial)"
              >
                <!-- Subtle content indicator anchored to bottom-right -->
                <div class="w-2 h-1 bg-gradient-to-l from-gray-300 to-transparent absolute bottom-0.5 right-0.5 rounded-sm"></div>
                <div class="w-1 h-2 bg-gradient-to-t from-gray-300 to-transparent absolute bottom-0.5 right-0.5 rounded-sm"></div>
              </div>
            </div>
          </button>
          
          <!-- Preset Info -->
          <div class="p-3">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-800">{preset.name}</h4>
                <!-- Removed secondary meta text per requirement -->
              </div>
              
              <button
                class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                on:click|stopPropagation={() => deletePreset(preset.name)}
                title="Delete preset"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      {/each}

      <!-- Save Current card at the end (always last) -->
      <button
        class="group bg-white border border-dashed border-blue-300 rounded-lg overflow-hidden hover:border-blue-500 transition-colors flex flex-col"
        on:click={() => { saveCurrentAsPreset(); }}
        title="Save current settings as a new preset"
      >
        <div class="w-full h-20 relative flex items-center justify-center bg-blue-50">
          <div class="flex items-center text-blue-700 text-sm font-medium">
            <Save size={16} class="mr-2" />
            Save Current
          </div>
        </div>
        <div class="p-3">
          <p class="text-xs text-gray-500">in your browser cache</p>
        </div>
      </button>
    </div>
  {/if}
</div>
