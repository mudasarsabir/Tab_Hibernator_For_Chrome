document.addEventListener('DOMContentLoaded', function() {
  const hibernateBtn = document.getElementById('hibernate-btn');
  
  hibernateBtn.addEventListener('click', function() {
    // Send a message to the background script to start hibernation
    chrome.runtime.sendMessage({ action: 'hibernateAllInactive' }, (response) => {
      console.log(response.status);
      window.close(); // Close the popup after clicking
    });
  });
});