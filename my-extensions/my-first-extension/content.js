let highlightTimeout = null;

// 監聽 mouseup 事件（加上安全檢查，不干擾 Ctrl+C 與點擊清單）
document.addEventListener('mouseup', (e) => {
  if (e.target.closest('#extension-helper-list')) return;

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (!selectedText) return;

  clearTimeout(highlightTimeout);
  highlightTimeout = setTimeout(() => {
    console.log('偵測到選取文字:', selectedText);
    findAllAndHighlight(selectedText);
  }, 250);
});

// 尋找 DOM 中所有指定的文字並高亮、建立清單
function findAllAndHighlight(keyword) {
  removeExistingHighlights();

  const matches = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const nodesToProcess = [];

  let node;
  while (node = walker.nextNode()) {
    if (node.nodeValue.toLowerCase().includes(keyword.toLowerCase())) {
      nodesToProcess.push(node);
    }
  }

  nodesToProcess.forEach((textNode) => {
    const parent = textNode.parentNode;
    const content = textNode.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIdx = 0;
    
    const regex = new RegExp(escapeRegExp(keyword), 'gi');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIdx) {
        fragment.appendChild(document.createTextNode(content.slice(lastIdx, match.index)));
      }
      
      const span = document.createElement('span');
      span.className = 'custom-highlight-target';
      span.style.backgroundColor = '#ffeb3b';
      span.style.color = '#000';
      span.style.fontWeight = 'bold';
      span.textContent = match[0];
      
      fragment.appendChild(span);
      matches.push(span);
      
      lastIdx = regex.lastIndex;
    }
    
    if (lastIdx < content.length) {
      fragment.appendChild(document.createTextNode(content.slice(lastIdx)));
    }
    
    parent.replaceChild(fragment, textNode);
  });

  if (matches.length > 0) {
    createFloatingList(matches, keyword);
  }
}

// 建立右側浮動清單 (包含關閉按鈕、上下文、清單自動捲動到觸發項目)
function createFloatingList(matches, keyword) {
  const oldList = document.getElementById('extension-helper-list');
  if (oldList) oldList.remove();

  const container = document.createElement('div');
  container.id = 'extension-helper-list';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    max-height: 400px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    padding: 12px;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 13px;
  `;

  // 標題與關閉按鈕區塊
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    margin-bottom: 8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 6px;
    position:sticky;
    top:0px;
    background:rgb(0,0,0)
  `;
  
  const titleSpan = document.createElement('span');
  titleSpan.textContent = `找到 ${matches.length} 個「${keyword}」`;
  header.appendChild(titleSpan);

  // ❌ 關閉按鈕
  const closeSpan = document.createElement('span');
  closeSpan.textContent = '×';
  closeSpan.style.cssText = `
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    color: #888;
    padding: 0 4px;
    line-height: 1;
  `;
  closeSpan.onmouseenter = () => closeSpan.style.color = '#000';
  closeSpan.onmouseleave = () => closeSpan.style.color = '#888';
  closeSpan.onclick = () => removeExistingHighlights();
  header.appendChild(closeSpan);
  
  container.appendChild(header);

  let targetListItem = null;
  // 為了示範：將「第一個符合的項目」視為本次觸發的對應項目（您也可以根據滑鼠點擊位置動態對應）
  const triggerIndex = 0; 

  matches.forEach((el, idx) => {
    const item = document.createElement('div');
    item.className = 'extension-list-item';
    item.style.cssText = `
      padding: 6px 8px;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;
      border-radius: 4px;
      margin-bottom: 4px;
      transition: background 0.2s;
    `;
    
    item.onmouseenter = () => item.style.background = '#f0f0f0';
    item.onmouseleave = () => {
      // 如果不是目前觸發的項目，恢復透明底色
      if (item !== targetListItem) item.style.background = 'transparent';
    };

    // 取得上下文摘要
    const parentBlock = el.closest('p, li, h1, h2, h3, h4, div') || el.parentNode;
    let fullText = parentBlock ? parentBlock.textContent.trim() : keyword;
    
    if (fullText.length > 35) {
      const pos = fullText.toLowerCase().indexOf(keyword.toLowerCase());
      if (pos !== -1) {
        const start = Math.max(0, pos - 10);
        const end = Math.min(fullText.length, pos + keyword.length + 15);
        fullText = (start > 0 ? '...' : '') + fullText.substring(start, end) + (end < fullText.length ? '...' : '');
      } else {
        fullText = fullText.substring(0, 35) + '...';
      }
    }

    // 顯示帶有編號 (#?) 與上下文
    item.innerHTML = `<span style="color: #007acc; font-weight: bold;">#${idx + 1}</span> ${escapeHtml(fullText)}`;

    // 點擊清單項目：網頁本體捲動到該目標
    item.addEventListener('click', () => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightFlash(el);
    });

    container.appendChild(item);

    // 標記並紀錄觸發該次事件的項目
    if (idx === triggerIndex) {
      targetListItem = item;
    }
  });

  document.body.appendChild(container);

  // 當清單建立後，自動將清單捲動（scroll）到觸發該事件的目標項目位置
  if (targetListItem) {
    targetListItem.style.backgroundColor = '#e6f7ff'; // 給予醒目背景
    targetListItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// 點擊高亮閃爍效果
function highlightFlash(el) {
  const originalBg = el.style.backgroundColor;
  el.style.backgroundColor = '#ff9800';
  setTimeout(() => {
    el.style.backgroundColor = originalBg;
  }, 1000);
}

// 清除高亮與浮動清單
function removeExistingHighlights() {
  const oldList = document.getElementById('extension-helper-list');
  if (oldList) oldList.remove();

  document.querySelectorAll('.custom-highlight-target').forEach(span => {
    const parent = span.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(span.textContent), span);
      parent.normalize();
    }
  });
}

// 正規表達式特殊字元轉義
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 安全 HTML 轉義
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}