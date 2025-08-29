<script>
  import { editorStore } from '../stores/editor';
  import { gradientToCss, shadowToCss } from '../lib/gradient-utils';

  $: state = $editorStore;
  $: backdrop = state.backdrop;
  $: shadow = state.shadow;
  $: imageHasShadow = state.imageHasShadow;

  // Background styles with inset padding, shadow, and corners
  $: backgroundStyle = (() => {
    let background = '';
    if (backdrop.fillType === 'solid') {
      background = `background-color: ${backdrop.solidColor || '#ffffff'};`;
    } else if (backdrop.fillType === 'gradient' && backdrop.gradient) {
      background = `background: ${gradientToCss(backdrop.gradient)};`;
    } else if (backdrop.fillType === 'transparent') {
      background = 'background-color: transparent;';
    } else if (backdrop.fillType === 'image' && backdrop.bgImage) {
      background = `background-image: url(${backdrop.bgImage}); background-size: cover; background-position: center;`;
      if (backdrop.bgImageBlurPx && backdrop.bgImageBlurPx > 0) {
        background += ` filter: blur(${backdrop.bgImageBlurPx}px);`;
      }
    }

    // Only apply shadow to backdrop if not applying to image
    const shadowStyle = !imageHasShadow ? `box-shadow: ${shadowToCss(shadow)};` : '';

    return `
      padding: ${backdrop.insetPx}px;
      border-radius: ${backdrop.outerRadiusPx}px;
      ${shadowStyle}
      ${background}
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 400px;
      min-height: 300px;
    `;
  })();

  // Subject shadow wrapper (carries the shadow, no overflow clipping)
  $: subjectShadowWrapperStyle = (() => {
    const wrapperShadow = imageHasShadow ? `box-shadow: ${shadowToCss(shadow)};` : '';
    return `
      display: inline-block;
      border-radius: ${backdrop.innerRadiusPx}px;
  overflow: visible;
      ${wrapperShadow}
    `;
  })();

  // Inner clip wrapper to apply rounding and clip the image
  $: subjectClipWrapperStyle = (() => {
    return `
      border-radius: ${backdrop.innerRadiusPx}px;
      overflow: hidden;
    `;
  })();

  // Subject image styles (no shadow here; handled by wrapper for export compatibility)
  $: subjectImageStyle = (() => {
    return `
      display: block;
      max-width: 100%;
      max-height: 500px;
      object-fit: contain;
    `;
  })();
</script>

<div class="workspace" role="region" aria-label="Editor canvas">
  {#if state.imageSrc}
    <div class="background" style={backgroundStyle}>
      <div class="subject-shadow-wrapper" style={subjectShadowWrapperStyle}>
        <div class="inner-image-wrapper" style={subjectClipWrapperStyle}>
          <img src={state.imageSrc} alt="Uploaded" class="subject" style={subjectImageStyle} />
        </div>
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <div class="empty-content">
        <h3 class="text-lg font-medium text-gray-900">No image uploaded</h3>
        <p class="text-gray-500 text-sm max-w-sm">You can also drag and drop an image here.</p>
      </div>
      <label for="file-upload" class="btn-primary cursor-pointer">
        Choose Image
      </label>
    </div>
  {/if}
</div>
