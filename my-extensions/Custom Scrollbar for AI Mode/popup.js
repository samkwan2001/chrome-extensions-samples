// popup.js
document.addEventListener('DOMContentLoaded', async () => {
    // 1. 打開 popup 時，讀取目前的狀態來設定 checkbox
    const data = await chrome.storage.local.get(['featureEnabled']);
    const featureSwitch = document.getElementById('feature-switch');
    if (featureSwitch) {
        featureSwitch.checked = data.featureEnabled || false;
    }

    // 2. 當切換開關時，直接更新 Storage（讓 content.js 自動同步）
    featureSwitch.addEventListener('change', async (event) => {
        const isEnabled = event.target.checked;
        await chrome.storage.local.set({ featureEnabled: isEnabled });
        
        // 也可以同時發送訊息給當前頁面的 content.js 即時反應
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_SWITCH", value: isEnabled }).catch(() => {});
        }
    });
});