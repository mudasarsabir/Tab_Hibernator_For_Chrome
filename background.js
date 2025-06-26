// --- Core Functions ---

/**
 * Hibernates a single tab by redirecting it to our local hibernated.html page.
 * @param {chrome.tabs.Tab} tab - The tab object to hibernate.
 */
function hibernateTab(tab) {
  // Do not hibernate special chrome pages or tabs that are already hibernated.
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.includes('hibernated.html')) {
    return;
  }

  try {
    // IMPORTANT: encodeURIComponent ensures special characters in the title,
    // like parentheses, don't break the URL. This is the main fix.
    const hibernatedUrl = chrome.runtime.getURL('hibernated.html') +
                          '?url=' + encodeURIComponent(tab.url) +
                          '&title=' + encodeURIComponent(tab.title || 'Untitled') +
                          '&favIconUrl=' + encodeURIComponent(tab.favIconUrl || '');
    
    // Update the tab to point to our hibernation page.
    chrome.tabs.update(tab.id, { url: hibernatedUrl });
    console.log(`Hibernated tab: ${tab.id} (${tab.title})`);
  } catch (error) {
    console.error(`Could not hibernate tab ${tab.id}:`, error);
  }
}

/**
 * Restores a hibernated tab to its original URL.
 * @param {number} tabId - The ID of the tab to restore.
 */
function restoreTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    // Check if the tab is actually one of our hibernated pages.
    if (tab && tab.url && tab.url.includes('hibernated.html')) {
      try {
        const params = new URL(tab.url).searchParams;
        const originalUrl = params.get('url');

        // Restore the tab only if the original URL is valid.
        if (originalUrl) {
          chrome.tabs.update(tabId, { url: originalUrl });
          console.log(`Restored tab: ${tabId}`);
        }
      } catch (error) {
        console.error(`Could not restore tab ${tabId}:`, error);
      }
    }
  });
}

// --- Event Listeners ---

// Listens for the "hibernate" message from the popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'hibernateAllInactive') {
    console.log('Received request to hibernate all inactive tabs.');
    // Find all tabs that are inactive, not playing audio, and not pinned.
    chrome.tabs.query({ active: false, audible: false, pinned: false }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs:", chrome.runtime.lastError);
        return;
      }
      tabs.forEach(hibernateTab);
      sendResponse({ status: 'Hibernation process initiated', count: tabs.length });
    });
  }
  // Return true to indicate that we will send a response asynchronously.
  return true;
});

// Listens for when a user switches to a different tab.
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Restore the tab if it was hibernating.
  restoreTab(activeInfo.tabId);
});
