chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.checkFeed) {
    const noFeed = document.body.innerText.includes("ERROR: Sorry,")
    sendResponse({ feedAvailable: !noFeed });
  }
});