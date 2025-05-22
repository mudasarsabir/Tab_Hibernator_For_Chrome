// Tab activity tracking
const tabActivity = {};
const hibernatedTabs = {};
const HIBERNATION_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Hibernator extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    autoHibernateEnabled: true,
    hibernationDelay: 5,
    excludePinned: true,
    excludeAudible: true
  });
  
  // Create alarm for checking inactive tabs
  chrome.alarms.create('checkInactiveTabs', { periodInMinutes: 1 });
});

// Track tab activity
chrome.tabs.onActivated.addListener(activeInfo => {
  const tabId = activeInfo.tabId;
  tabActivity[tabId] = Date.now();
  
  // If this tab was hibernated, restore it
  if (hibernatedTabs[tabId]) {
    delete hibernatedTabs[tabId];
  }
});

// Track tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    tabActivity[tabId] = Date.now();
  }
});

// Remove closed tabs from tracking
chrome.tabs.onRemoved.addListener(tabId => {
  delete tabActivity[tabId];
  delete hibernatedTabs[tabId];
});

// Check for inactive tabs periodically
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkInactiveTabs') {
    checkInactiveTabs();
  }
});

// Function to check and hibernate inactive tabs
async function checkInactiveTabs() {
  // Get settings
  const settings = await chrome.storage.local.get([
    'autoHibernateEnabled',
    'hibernationDelay',
    'excludePinned',
    'excludeAudible'
  ]);
  
  if (!settings.autoHibernateEnabled) return;
  
  const now = Date.now();
  const delay = (settings.hibernationDelay || 5) * 60 * 1000;
  
  // Get all tabs
  const tabs = await chrome.tabs.query({});
  const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  
  for (const tab of tabs) {
    // Skip the active tab
    if (activeTab && tab.id === activeTab.id) continue;
    
    // Skip pinned tabs if setting is enabled
    if (settings.excludePinned && tab.pinned) continue;
    
    // Skip audible tabs if setting is enabled
    if (settings.excludeAudible && tab.audible) continue;
    
    // Skip already hibernated tabs
    if (hibernatedTabs[tab.id]) continue;
    
    const lastActivity = tabActivity[tab.id] || now;
    
    // Hibernate if inactive for the specified delay
    if (now - lastActivity > delay) {
      hibernateTab(tab.id, tab.url);
    }
  }
}

// Function to hibernate a tab
function hibernateTab(tabId, url) {
  // Store the tab URL for later restoration
  hibernatedTabs[tabId] = {
    url: url,
    hibernatedAt: Date.now()
  };
  
  // Replace tab content with placeholder
  chrome.tabs.update(tabId, {
    url: `hibernated.html?tabId=${tabId}`
  });
  
  // Update badge to show number of hibernated tabs
  updateBadge();
}

// Function to restore a hibernated tab
function restoreTab(tabId) {
  if (hibernatedTabs[tabId]) {
    const originalUrl = hibernatedTabs[tabId].url;
    chrome.tabs.update(tabId, { url: originalUrl });
    delete hibernatedTabs[tabId];
    updateBadge();
  }
}

// Function to hibernate all tabs except the active one
async function hibernateAllTabs() {
  const tabs = await chrome.tabs.query({});
  const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  
  // Get settings
  const settings = await chrome.storage.local.get([
    'excludePinned',
    'excludeAudible'
  ]);
  
  for (const tab of tabs) {
    // Skip the active tab
    if (activeTab && tab.id === activeTab.id) continue;
    
    // Skip pinned tabs if setting is enabled
    if (settings.excludePinned && tab.pinned) continue;
    
    // Skip audible tabs if setting is enabled
    if (settings.excludeAudible && tab.audible) continue;
    
    // Skip already hibernated tabs
    if (hibernatedTabs[tab.id]) continue;
    
    hibernateTab(tab.id, tab.url);
  }
}

// Update badge to show number of hibernated tabs
function updateBadge() {
  const count = Object.keys(hibernatedTabs).length;
  chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#0071E3' });
}

// Listen for messages from popup or hibernated page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'hibernateAll') {
    hibernateAllTabs();
    sendResponse({ success: true });
  } else if (request.action === 'restoreTab') {
    restoreTab(request.tabId);
    sendResponse({ success: true });
  } else if (request.action === 'getHibernatedCount') {
    sendResponse({ count: Object.keys(hibernatedTabs).length });
  } else if (request.action === 'getTabInfo') {
    const tabId = request.tabId;
    if (hibernatedTabs[tabId]) {
      sendResponse({
        url: hibernatedTabs[tabId].url,
        hibernatedAt: hibernatedTabs[tabId].hibernatedAt
      });
    } else {
      sendResponse({ error: 'Tab not found' });
    }
  }
  return true;
});