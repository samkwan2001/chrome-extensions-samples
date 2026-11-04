// popup.js
document.getElementById('feature-switch').addEventListener('change', async (event) => {
    const isEnabled = event.target.checked;

    // 1. Get the current active browser tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) return;

    // 2. Send the switch state to the content script running on that tab
    chrome.tabs.sendMessage(tab.id, {
        action: "TOGGLE_SWITCH",
        value: isEnabled
    }).catch(err => {
        console.log("Content script might not be loaded on this page yet:", err);
    });
});
