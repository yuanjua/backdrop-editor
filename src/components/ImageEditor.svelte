<script>
  import ImageCanvas from './ImageCanvas.svelte';
  import ControlPanel from './ControlPanel.svelte';
  import ExportMenu from './ExportMenu.svelte';
  import { editorStore } from '../stores/editor';

  $: hasImage = $editorStore.imageSrc !== null;
</script>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
  <!-- Canvas Area -->
  <div class="xl:col-span-3">
    <div class="space-y-6">
      <!-- Canvas -->
      <div class="canvas-outer bg-transparent" style="min-height: 400px;">
        <ImageCanvas />
      </div>
      
  <!-- Export moved to Control Panel tab -->
    </div>
  </div>
  
  <!-- Control Panel Sidebar -->
  <div class="xl:col-span-2">
    <div class="sticky top-24">
      <ControlPanel />
    </div>
  </div>
</div>
