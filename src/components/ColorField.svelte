<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let id: string = '';
  export let label: string = '';
  export let value: string = '';
  export let placeholder: string = '#000000';
  const dispatch = createEventDispatcher<{ input: string }>();

  function handleInput() {
    dispatch('input', value);
  }
</script>

<div>
  {#if label}
    <label for=id_{id} class="control-label">{label}</label>
  {/if}
  <div class="flex items-center space-x-3">
    <input
      id={id}
      type="color"
      bind:value
      on:input={handleInput}
      class="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
      aria-label={label || 'Color picker'}
    />
    <input
      type="text"
      bind:value
      on:input={handleInput}
      class="flex-1 w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      {placeholder}
      aria-label={label || 'Color hex'}
    />
  </div>
</div>

<style>
  /* Reuse app control-label class defined elsewhere */
</style>
