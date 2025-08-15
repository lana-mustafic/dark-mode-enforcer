const toggleButton = document.getElementById('toggleDarkMode');

// Load saved state on popup open
chrome.storage.local.get('darkModeEnabled', (data) => {
  updateButtonState(data.darkModeEnabled || false);
});

// Handle button click
toggleButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  toggleDarkMode(tab.id);
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        toggleDarkMode(tabs[0].id);
      }
    });
  }
});

async function toggleDarkMode(tabId) {
  const data = await chrome.storage.local.get('darkModeEnabled');
  const darkModeEnabled = !data.darkModeEnabled;
  
  // Save the new state
  await chrome.storage.local.set({ darkModeEnabled });
  
  // Update button text
  updateButtonState(darkModeEnabled);
  
  // Apply/remove dark mode
  await chrome.scripting.executeScript({
    target: { tabId },
    function: enforceDarkMode,
    args: [darkModeEnabled]
  });
}

function updateButtonState(darkModeEnabled) {
  toggleButton.textContent = darkModeEnabled ? 'Disable Dark Mode' : 'Enable Dark Mode';
  toggleButton.style.backgroundColor = darkModeEnabled ? '#4CAF50' : '#333';
}

function enforceDarkMode(darkModeEnabled) {
  // Apply to body
  document.body.style.filter = darkModeEnabled 
    ? 'invert(1) hue-rotate(180deg)' 
    : 'none';
  
  // Handle media elements separately
  const mediaElements = document.querySelectorAll('img, video, picture, svg, iframe');
  mediaElements.forEach(el => {
    el.style.filter = darkModeEnabled ? 'invert(1) hue-rotate(180deg)' : 'none';
  });
  
  // Adjust background for better contrast
  if (darkModeEnabled) {
    document.body.style.backgroundColor = '#121212';
  }
}