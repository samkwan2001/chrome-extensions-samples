(function() {
    // 1. 查找页面右下角的导出区域或相关按钮（基于页面上的 AI Exporter / 菜单栏）
    // 这里我们寻找包含 “AI Exporter” 或者导出按钮的容器
    let targetContainer = null;
    
    // 尝试寻找页面上的特定菜单或按钮容器
    const allElements = document.querySelectorAll('div, span, button');
    for (let el of allElements) {
        if (el.innerText && el.innerText.includes('AI Exporter')) {
            targetContainer = el.closest('div'); // 向上找到其所在的工具栏区块
            break;
        }
    }

    // 如果没找到具体的工具栏，我们就回退到在页面右侧固定创建一个时间戳悬浮窗
    let timeBadge = document.getElementById('my-live-timestamp-badge');
    if (!timeBadge) {
        timeBadge = document.createElement("div");
        timeBadge.id = "my-live-timestamp-badge";
        timeBadge.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: #00ffcc;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            z-index: 999999;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(timeBadge);
    }

    // 2. 实时更新并显示当前时间戳，以及抓取到的近期话题数量
    function updateTimestampAndTopics() {
        const now = new Date();
        const timeString = now.toLocaleTimeString() + "." + String(now.getMilliseconds()).padStart(3, '0');
        const dateString = now.toISOString().split('T')[0];

        // 顺便精准抓取左侧的近期话题
        const topics = [];
        document.querySelectorAll('a, div, span').forEach(el => {
            const text = el.innerText.trim();
            // 过滤并锁定左侧的有效近期话题
            if (text && text.length > 2 && text.length < 50 && !topics.includes(text)) {
                if (!text.includes("近期话题月历") && !text.includes("AI Exporter")) {
                    topics.push(text);
                }
            }
        });

        // 在右下角悬浮条或指定位置显示时间戳
        timeBadge.innerHTML = `
            <div style="font-weight: bold; border-bottom: 1px solid #444; margin-bottom: 4px; padding-bottom: 2px;">
                ⏱️ 实时时间戳: ${dateString} ${timeString}
            </div>
            <div style="color: #fff; font-size: 11px;">
                已捕获左侧近期话题数: ${topics.length} 个
            </div>
        `;
    }

    // 3. 立即执行并开启循环更新
    updateTimestampAndTopics();
    if (window.timestampInterval) clearInterval(window.timestampInterval);
    window.timestampInterval = setInterval(updateTimestampAndTopics, 1000); // 每秒刷新时间戳

    console.log("时间戳挂载成功！已绑定至右下角。");
})();