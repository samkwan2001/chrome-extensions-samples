// content.js

const SCROLLBAR_ID = "my-custom-scrollbar-iframe";
const CALENDAR_ID = "my-custom-calendar-iframe";

// 1. 頁面載入時先檢查一次狀態
async function initFromStorage() {
    const data = await chrome.storage.local.get(['showScrollbar', 'showCalendar']);
    updateFeatureState('showScrollbar', data.showScrollbar, SCROLLBAR_ID, 'features/scrollbar.html');
    updateFeatureState('showCalendar', data.showCalendar, CALENDAR_ID, 'features/calendar.html');
}

// 2. 監聽儲存空間變更（取代原本複雜的 sendMessage）
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        if (changes.showScrollbar) {
            updateFeatureState('showScrollbar', changes.showScrollbar.newValue, SCROLLBAR_ID, 'features/scrollbar.html');
        }
        if (changes.showCalendar) {
            updateFeatureState('showCalendar', changes.showCalendar.newValue, CALENDAR_ID, 'features/calendar.html');
        }
    }
});

// 3. 核心控制邏輯：根據選擇的模式（'off', 'show in dom', 'show in popup'）來決定 DOM 動作
function updateFeatureState(key, selection, elementId, htmlPath) {
    let iframe = document.getElementById(elementId);

    // 如果選擇的是 "show in dom"
    if (selection === 'show in dom') {
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = elementId;
            iframe.src = chrome.runtime.getURL(htmlPath);
            // 設定 iframe 的基本樣式（可依需求調整位置）
            iframe.style.position = 'fixed';
            iframe.style.top = '20px';
            iframe.style.right = '20px';
            iframe.style.width = '300px';
            iframe.style.height = '400px';
            iframe.style.zIndex = '999999';
            iframe.style.border = '1px solid #ccc';
            document.body.appendChild(iframe);
        } else {
            iframe.style.display = 'block';
        }
    } else {
        // 如果選擇的是 "off" 或 "show in popup"，則在網頁 DOM 上隱藏或移除
        if (iframe) {
            iframe.style.display = 'none';
        }
    }
}

// 執行初始化
initFromStorage();