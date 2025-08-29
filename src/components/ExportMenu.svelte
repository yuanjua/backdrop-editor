<script lang="ts">
  import { saveAs } from 'file-saver';
  import { Download, Copy, Image, FileImage } from 'lucide-svelte';
  import { showToast } from '../stores/toast';
  import { editorStore } from '../stores/editor';
  import { CanvasRenderer } from '../lib/canvas-renderer';
  import { get } from 'svelte/store';

  let isExporting = false;

  type ExportFormat = 'png' | 'jpeg';
  
  async function exportAs(format: ExportFormat, quality = 0.92) {
    const state = get(editorStore);
    
    if (!state.imageSrc) {
      showToast.error('No image uploaded to export.');
      return;
    }

    isExporting = true;
    const renderer = new CanvasRenderer();
    
  try {
      // Measure preview composition and inner wrapper for 1:1 export
      const bgEl = document.querySelector('.background') as HTMLElement | null;
      const innerEl = document.querySelector('.inner-image-wrapper') as HTMLElement | null;
      const width = bgEl ? bgEl.clientWidth : undefined;
      const height = bgEl ? bgEl.clientHeight : undefined;
      const measuredInnerWidth = innerEl ? innerEl.clientWidth : undefined;
      const measuredInnerHeight = innerEl ? innerEl.clientHeight : undefined;

      // Render to canvas
      const canvas = await renderer.render(state, {
        scale: (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 2,
        width,
        height,
        measuredInnerWidth,
        measuredInnerHeight,
        format,
        quality,
        cropToBackdrop: format === 'jpeg'
      });

      // Export as blob
      const blob = await renderer.toBlob(format, quality);
      
      if (blob) {
        const filename = `backdrop-${Date.now()}.${format}`;
        saveAs(blob, filename);
  showToast.success(`${format.toUpperCase()} image downloaded successfully`);
      } else {
        throw new Error('Failed to create blob');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showToast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      renderer.destroy();
      isExporting = false;
    }
  }

  async function copyToClipboard() {
    const state = get(editorStore);
    
    if (!state.imageSrc) {
      showToast.error('No image uploaded to copy.');
      return;
    }

    isExporting = true;
    const renderer = new CanvasRenderer();
    
  try {
      // Measure preview composition and inner wrapper for 1:1 export
      const bgEl = document.querySelector('.background') as HTMLElement | null;
      const innerEl = document.querySelector('.inner-image-wrapper') as HTMLElement | null;
      const width = bgEl ? bgEl.clientWidth : undefined;
      const height = bgEl ? bgEl.clientHeight : undefined;
      const measuredInnerWidth = innerEl ? innerEl.clientWidth : undefined;
      const measuredInnerHeight = innerEl ? innerEl.clientHeight : undefined;

      // Render to canvas
      const canvas = await renderer.render(state, {
        scale: (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 2,
        width,
        height,
        measuredInnerWidth,
        measuredInnerHeight,
        format: 'png'
      });

      // Export as PNG blob for clipboard
      const blob = await renderer.toBlob('png', 1.0);
      
      if (!blob) {
        throw new Error('Failed to create blob for clipboard');
      }
      
      const ClipboardItemCtor = (window as any).ClipboardItem;
      if (navigator.clipboard && ClipboardItemCtor) {
        try {
          await navigator.clipboard.write([
            new ClipboardItemCtor({ 'image/png': blob })
          ]);
          showToast.success('Image copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
          showToast.error('Failed to copy to clipboard. Your browser may not support this feature.');
        }
      } else {
        // Fallback for browsers without clipboard API
        const url = URL.createObjectURL(blob);
        const img = document.createElement('img');
        img.src = url;
        
        showToast.info('Clipboard API not supported. Right-click the image to copy or download it.');
        const newWindow = window.open('');
        if (newWindow) {
          newWindow.document.write(img.outerHTML);
        } else {
          showToast.error('Failed to open new window. Your browser may be blocking popups.');
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
      showToast.error('Copy failed. Please try again.');
    } finally {
      renderer.destroy();
      isExporting = false;
    }
  }

  // (SVG export helper removed during cleanup; can be re-added if needed.)
</script>

<div class="control-panel">
  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
    Export Your Creation
  </h3>
  
  <div class="space-y-4">
    <!-- Primary Export Buttons -->
    <div class="grid grid-cols-2 gap-3">
      <button
        class="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
        on:click={() => exportAs('png')}
        disabled={isExporting}
      >
        <Image size={16} />
        <span class="text-sm">{isExporting ? 'Exporting...' : 'PNG'}</span>
      </button>
      
      <button
        class="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
        on:click={() => exportAs('jpeg')}
        disabled={isExporting}
      >
        <FileImage size={16} />
        <span class="text-sm">{isExporting ? 'Exporting...' : 'JPG'}</span>
      </button>
    </div>
    
    <!-- Copy Button -->
    <button
      class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
      on:click={copyToClipboard}
      disabled={isExporting}
    >
      <Copy size={16} />
      <span class="text-sm">{isExporting ? 'Copying...' : 'Copy to Clipboard'}</span>
    </button>
  </div>
  
  <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
    <div class="text-xs text-blue-700 space-y-1">
      <div class="flex justify-between">
        <span>PNG: Transparency + 1:1 Preview</span>
        <span>JPG: Cropped to Backdrop</span>
      </div>
      <p>• PNG: preserves transparency at preview resolution</p>
      <p>• JPG: crops to the backdrop bounds with square corners</p>
      <p>• Direct canvas rendering ensures WYSIWYG gradients & shadows</p>
    </div>
  </div>
</div>
