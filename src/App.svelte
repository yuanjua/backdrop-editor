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

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
  <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <p>Create beautiful image backdrops with ease</p>
        <div class="flex items-center space-x-4">
          <span>Built with Svelte & TailwindCSS</span>
        </div>
      </div>
    </div>
  </footer>
  
  <!-- Toast Notifications -->
  <Toast />
</main>
