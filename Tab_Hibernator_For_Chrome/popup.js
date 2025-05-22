document.addEventListener('DOMContentLoaded', async () => {
  // Get UI elements
  const hibernateAllBtn = document.getElementById('hibernate-all');
  const autoHibernateToggle = document.getElementById('auto-hibernate');
  const hibernateDelaySelect = document.getElementById('hibernate-delay');
  const excludePinnedToggle = document.getElementById('exclude-pinned');
  const excludeAudibleToggle = document.getElementById('exclude-audible');
  const hibernatedCountEl = document.getElementById('hibernated-count');
  const memorySavedEl = document.getElementById('memory-saved');
  
  // Load settings
  const settings = await chrome.storage.local.get([
    'autoHibernateEnabled',
    'hibernationDelay',
    'excludePinned',
    'excludeAudible'
  ]);
  
  // Apply settings to UI
  autoHibernateToggle.checked = settings.autoHibernateEnabled !== false;
  hibernateDelaySelect.value = settings.hibernationDelay || '5';
  excludePinnedToggle.checked = settings.excludePinned !== false;
  excludeAudibleToggle.checked = settings.excludeAudible !== false;
  
  // Update hibernated count
  updateHibernatedCount();
  
  // Event listeners
  hibernateAllBtn.addEventListener('click', hibernateAllTabs);
  
  autoHibernateToggle.addEventListener('change', () => {
    chrome.storage.local.set({ autoHibernateEnabled: autoHibernateToggle.checked });
  });
  
  hibernateDelaySelect.addEventListener('change', () => {
    chrome.storage.local.set({ hibernationDelay: parseInt(hibernateDelaySelect.value, 10) });
  });
  
  excludePinnedToggle.addEventListener('change', () => {
    chrome.storage.local.set({ excludePinned: excludePinnedToggle.checked });
  });
  
  excludeAudibleToggle.addEventListener('change', () => {
    chrome.storage.local.set({ excludeAudible: excludeAudibleToggle.checked });
  });
  
  // Update memory saved estimate (rough estimate based on 50MB per tab)
  function updateMemorySaved(count) {
    const memorySaved = count * 50; // 50MB per tab is a rough estimate
    memorySavedEl.textContent = `${memorySaved} MB`;
  }
  
  // Update hibernated count
  async function updateHibernatedCount() {
    const response = await chrome.runtime.sendMessage({ action: 'getHibernatedCount' });
    hibernatedCountEl.textContent = response.count;
    updateMemorySaved(response.count);
  }
  
  // Hibernate all tabs except current
  async function hibernateAllTabs() {
    await chrome.runtime.sendMessage({ action: 'hibernateAll' });
    updateHibernatedCount();
  }
});