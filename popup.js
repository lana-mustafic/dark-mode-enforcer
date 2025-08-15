const toggleButton = document.getElementById('toggleDarkMode');

toggleButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: enforceDarkMode
  });
});

function enforceDarkMode() {
  document.body.style.filter = document.body.style.filter === 'invert(1) hue-rotate(180deg)' 
    ? 'none' 
    : 'invert(1) hue-rotate(180deg)';
}