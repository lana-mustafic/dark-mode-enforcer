document.addEventListener('DOMContentLoaded', async () => {
  const toggleButton = document.getElementById('toggleDarkMode');
  
  if (!toggleButton) {
    console.error('Toggle button not found!');
    return;
  }

  // Initialize
  async function init() {
    try {
      const result = await chrome.storage.local.get('darkModeEnabled');
      updateButtonState(result.darkModeEnabled || false);
    } catch (error) {
      console.error("Storage error:", error);
      updateButtonState(false);
    }
  }

  // Button click handler
  toggleButton.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Skip restricted URLs
      if (tab.url?.startsWith('chrome://') || 
          tab.url?.startsWith('edge://') || 
          tab.url?.startsWith('about:')) {
        console.warn('Cannot modify browser internal pages');
        return;
      }

      const result = await chrome.storage.local.get('darkModeEnabled');
      const newState = !result.darkModeEnabled;
      
      await chrome.storage.local.set({ darkModeEnabled: newState });
      updateButtonState(newState);
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: (state) => {
          document.body.style.filter = state 
            ? 'invert(1) hue-rotate(180deg)' 
            : 'none';
          document.querySelectorAll('img, video, picture, svg').forEach(el => {
            el.style.filter = state ? 'invert(1) hue-rotate(180deg)' : 'none';
          });
        },
        args: [newState]
      });
    } catch (error) {
      console.error("Toggle error:", error);
    }
  });

  function updateButtonState(isEnabled) {
    toggleButton.textContent = isEnabled ? 'Disable Dark Mode' : 'Enable Dark Mode';
    toggleButton.style.backgroundColor = isEnabled ? '#4CAF50' : '#333';
  }

  // Start the extension
  init();
});