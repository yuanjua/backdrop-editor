<script>
  import ImageEditor from './components/ImageEditor.svelte'
  import Toast from './components/Toast.svelte'
  import { setImageSrc } from './stores/editor';

  function handleFileUpload(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e && e.target ? e.target.result : null;
        const dataUrl = typeof result === 'string' ? result : null;
        setImageSrc(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e && e.target ? e.target.result : null;
          const dataUrl = typeof result === 'string' ? result : null;
          setImageSrc(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }
</script>

<div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
  <!-- Header -->
  <header class="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <h1 class="text-xl font-bold text-gray-900">Backdrop Editor</h1>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <a
            href="https://github.com/yuanjua/backdrop-editor"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary"
            aria-label="Open GitHub"
            title="GitHub"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="mr-2">
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.33-.27 2.01-.27.68 0 1.37.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>Star</span>
          </a>

          <label for="file-upload" class="btn-primary cursor-pointer">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Upload Image
          </label>
          <input 
            id="file-upload"
            type="file" 
            accept="image/*"
            on:change={handleFileUpload}
            class="hidden"
          />
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
    <div 
      class="w-full"
      on:drop={handleDrop}
      on:dragover={handleDragOver}
      role="main"
    >
      <ImageEditor />
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-gray-200 bg-white mt-16">
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <p>This website does not collect data and processes images locally in the browser</p>
        <div class="flex items-center space-x-4">
          <span>Built with Svelte & TailwindCSS</span>
        </div>
      </div>
    </div>
  </footer>
  
  <!-- Toast Notifications -->
  <Toast />
</div>
