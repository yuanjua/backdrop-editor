<script>
  import BackdropTab from './BackdropTab.svelte';
  import ShadowTab from './ShadowTab.svelte';
  import PresetsTab from './PresetsTab.svelte';
  
  let activeTab = 'backdrop';
</script>

<div class="control-panel">
  <!-- Tab Navigation -->
  <div class="border-b border-gray-200 mb-6">
    <nav class="-mb-px flex space-x-4">
      <button
        class="btn-tab {activeTab === 'backdrop' ? 'btn-tab-active' : 'btn-tab-inactive'}"
        on:click={() => activeTab = 'backdrop'}
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        Backdrop
      </button>
      <button
        class="btn-tab {activeTab === 'shadow' ? 'btn-tab-active' : 'btn-tab-inactive'}"
        on:click={() => activeTab = 'shadow'}
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
        </svg>
        Shadow
      </button>
      <button
        class="btn-tab {activeTab === 'presets' ? 'btn-tab-active' : 'btn-tab-inactive'}"
        on:click={() => activeTab = 'presets'}
      >
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        Presets
      </button>
    </nav>
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    {#if activeTab === 'backdrop'}
      <BackdropTab />
    {:else if activeTab === 'shadow'}
      <ShadowTab />
    {:else if activeTab === 'presets'}
      <PresetsTab />
    {/if}
  </div>
</div>
