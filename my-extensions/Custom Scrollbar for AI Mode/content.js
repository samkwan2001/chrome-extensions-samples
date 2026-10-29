// ==========================================
// 1. 初始化側邊欄 UI 與互動邏輯
// ==========================================
function initChatNavigator() {
    if (document.getElementById("ai-chat-navigator-panel")) return;

    // 建立導覽側邊欄容器
    const panel = document.createElement("div");
    panel.id = "ai-chat-navigator-panel";
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        max-height: 85vh;
        background: #1e1e2f;
        color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        font-family: sans-serif;
        overflow: hidden;
        border: 1px solid #3d3d5c;
    `;

    panel.innerHTML = `
        <div style="padding: 12px 16px; background: #2a2a3c; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #3d3d5c;">
            <span>🧭 對話導覽與檔案列表</span>
            <button id="nav-refresh-btn" style="background: #00ff87; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: bold; color: #000;">重新整理</button>
        </div>
        <div id="nav-list-body" style="padding: 10px; overflow-y: auto; flex-grow: 1; font-size: 13px;"></div>
    `;

    document.body.appendChild(panel);

    const listBody = document.getElementById("nav-list-body");

    // 重新整理並建立導覽項目
    const buildNavigator = () => {
        listBody.innerHTML = "";
        
        // 抓取頁面上的對話訊息節點（請根據你的 DOM 結構調整 Selector）
        const messageNodes = document.querySelectorAll('.CKgc1d');

        if (!messageNodes || messageNodes.length === 0) {
            listBody.innerHTML = `<div style="color: #aaa; text-align: center; padding: 20px;">未偵測到對話內容</div>`;
            return;
        }

        messageNodes.forEach((node, index) => {
            const textContainer = node.querySelector('.VndcI')
            const stringContainer = textContainer?.querySelector('span');
            const text = stringContainer ? stringContainer.innerText.trim() : `訊息 #${index + 1}`;
            
            // 建立導覽清單項目
            const itemEl = document.createElement("div");
            itemEl.className = "nav-item";
            itemEl.title = text;
            itemEl.dataset.index = index;
            itemEl.style.cssText = `
                background: #252538;
                margin-bottom: 6px;
                padding: 8px 10px;
                border-radius: 6px;
                cursor: pointer;
                border-left: 3px solid #555;
                transition: all 0.2s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            itemEl.innerText = `#${index + 1}: ${text}`;

            // 🎯 核心功能 1：點擊列表項，主對話平滑滾動到該位置
            itemEl.addEventListener("click", () => {
                node.scrollIntoView({ behavior: "smooth", block: "center" });
                
                // 視覺回饋效果
                node.style.transition = "background 0.3s";
                node.style.background = "rgba(0, 255, 135, 0.2)";
                setTimeout(() => { node.style.background = ""; }, 1000);
            });

            listBody.appendChild(itemEl);
        });

        setupScrollSync(messageNodes);
    };

    buildNavigator();
    document.getElementById("nav-refresh-btn").addEventListener("click", buildNavigator);
}

// ==========================================
// 2. 核心功能 2：滾動主對話時，即時高亮對應項目
// ==========================================
function setupScrollSync(messageNodes) {
    const listBody = document.getElementById("nav-list-body");
    
    // 使用 IntersectionObserver 監聽主對話各訊息是否進入可視區域
    const observerOptions = {
        root: null, // 以視窗或滾動容器為基準
        threshold: 0.3 // 當元素有 30% 進入視野時觸發
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 找到當前進入視野的節點索引
                const index = Array.from(messageNodes).indexOf(entry.target);
                if (index !== -1) {
                    // 更新側邊欄高亮狀態
                    const navItems = listBody.querySelectorAll('.nav-item');
                    navItems.forEach((item, i) => {
                        if (i === index) {
                            item.style.background = "#2a2a4e";
                            item.style.borderLeftColor = "#00ff87";
                            item.style.color = "#00ff87";
                            
                            // 讓側邊欄自動捲動到目前高亮的位置
                            item.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        } else {
                            item.style.background = "#252538";
                            item.style.borderLeftColor = "#555";
                            item.style.color = "#ffffff";
                        }
                    });
                }
            }
        });
    }, observerOptions);

    messageNodes.forEach(node => observer.observe(node));
}

// 頁面載入後自動執行
setTimeout(initChatNavigator, 1500);