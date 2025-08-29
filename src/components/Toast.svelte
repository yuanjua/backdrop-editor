<script>
  import { toastStore } from '../stores/toast';
  import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  $: toasts = $toastStore;

  function getIcon(type) {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  }

  function getColorClasses(type) {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  }

  function getIconColor(type) {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  }
</script>

{#if toasts.length > 0}
  <div class="fixed top-4 right-4 z-50 space-y-2">
    {#each toasts as toast (toast.id)}
      <div
        class="flex items-center p-4 rounded-lg border shadow-lg max-w-sm {getColorClasses(toast.type)}"
        transition:fly={{ x: 300, duration: 300 }}
      >
        <svelte:component this={getIcon(toast.type)} size={20} class="{getIconColor(toast.type)} mr-3 flex-shrink-0" />
        <p class="text-sm font-medium flex-1">{toast.message}</p>
        <button
          on:click={() => toastStore.remove(toast.id)}
          class="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    {/each}
  </div>
{/if}
