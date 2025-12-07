// Background Service Worker
// Listens for clicks on the extension icon and opens the app in a new tab.

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'popup.html' });
});
