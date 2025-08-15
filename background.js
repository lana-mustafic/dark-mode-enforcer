chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || tabs[0].url.startsWith('chrome://')) return;
      
      chrome.storage.local.get('darkModeEnabled', (result) => {
        const newState = !result.darkModeEnabled;
        
        chrome.storage.local.set({ darkModeEnabled: newState }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
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
        });
      });
    });
  }
});