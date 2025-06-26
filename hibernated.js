try {
  // Use URLSearchParams on window.location.search.
  // This is a more robust way to get URL parameters.
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title');
  const favIconUrl = params.get('favIconUrl');

  // Update the page title
  document.title = title ? `(Hibernating) ${title}` : 'Tab Hibernated';

  // Update the favicon
  const faviconEl = document.getElementById('favicon');
  const fallbackIcon = 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23606770\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"></path></svg>';
  
  if (favIconUrl && favIconUrl !== 'undefined' && favIconUrl !== 'null') {
      faviconEl.src = favIconUrl;
      // Set a fallback in case the favicon URL is broken or fails to load
      faviconEl.onerror = () => { 
        faviconEl.onerror = null; // Prevent infinite loops if fallback also fails
        faviconEl.src = fallbackIcon;
      }
  } else {
      faviconEl.src = fallbackIcon;
  }
} catch (e) {
  console.error("Error parsing hibernated tab data:", e);
  // If a critical error occurs, show a default safe state
  document.title = 'Hibernated Tab (Error)';
  document.querySelector('h1').textContent = 'This tab is hibernating.';
  document.querySelector('p').textContent = 'There was an error loading its original information.';
}
