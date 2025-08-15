const toggleButton = document.getElementById('toggleDarkMode');

// Initialize with default state
let darkModeEnabled = false;

// Safe storage access with fallback
function getStorage() {
  return new Promise((resolve) => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get('darkModeEnabled', (data) => {
        resolve(data.darkModeEnabled || false);
      });
    } else {
      console.warn("Storage API not available, using default state");
      resolve(false);
    }
  });
}

// Main initialization
async function init() {
  try {
    darkModeEnabled = await getStorage();
    updateButtonState(darkModeEnabled);
  } catch (error) {
    console.error("Initialization error:", error);
    updateButtonState(false);
  }
}

// Button click handler
toggleButton.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    darkModeEnabled = !darkModeEnabled;
    
    // Save state if storage is available
    if (chrome.storage?.local) {
      await chrome.storage.local.set({ darkModeEnabled });
    }
    
    updateButtonState(darkModeEnabled);
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: enforceDarkMode,
      args: [darkModeEnabled]
    });
  } catch (error) {
    console.error("Toggle error:", error);
  }
});

// Handle keyboard shortcut
chrome.commands?.onCommand?.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        toggleButton.click(); // Trigger the button click handler
      }
    });
  }
});

function updateButtonState(isEnabled) {
  toggleButton.textContent = isEnabled ? 'Disable Dark Mode' : 'Enable Dark Mode';
  toggleButton.style.backgroundColor = isEnabled ? '#4CAF50' : '#333';
}

function enforceDarkMode(shouldEnable) {
  try {
    // Apply to body
    document.body.style.filter = shouldEnable 
      ? 'invert(1) hue-rotate(180deg)' 
      : 'none';
    
    // Handle media elements
    const mediaElements = document.querySelectorAll('img, video, picture, svg');
    mediaElements.forEach(el => {
      el.style.filter = shouldEnable ? 'invert(1) hue-rotate(180deg)' : 'none';
    });
  } catch (error) {
    console.error("Content script error:", error);
  }
}

// Start the extension
init();