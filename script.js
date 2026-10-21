/* =============================================================
 *  即時時鐘 - script.js
 *  功能:即時時間、日期、秒數進度環、12/24 小時制切換
 *  依賴:index.html (特定 id)、style.css (特定 class)
 * ============================================================= */

'use strict';

/* ===================== 1. 設定與常數 ===================== */

const CONFIG = {
    RADIUS: 100,              // SVG 圓環半徑
    STORAGE_KEY: 'clockFormat',
    WEEKDAYS: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
};

/* ===================== 2. DOM 元素快取 ===================== */

const el = {
    clock:       document.getElementById('clock'),
    ampm:        document.getElementById('ampm'),
    date:        document.getElementById('dateDisplay'),
    ring:        document.getElementById('ringProgress'),
    toggleBtn:   document.getElementById('formatToggle'),
    toggleLabel: document.getElementById('toggleLabel'),
};

/* ===================== 3. 狀態 ===================== */

const state = {
    is24Hour: loadFormatPreference(),
    timerId:  null,
};

/* ===================== 4. 初始化 ===================== */

function init() {
    setupRing();
    updateToggleLabel();
    bindEvents();
    startClock();
}

/* ===================== 5. 秒數圓環初始化 ===================== */

let CIRCUMFERENCE = 0;   // 由 setupRing 計算後填入

function setupRing() {
    CIRCUMFERENCE = 2 * Math.PI * CONFIG.RADIUS;

    el.ring.style.strokeDasharray  = CIRCUMFERENCE;
    el.ring.style.strokeDashoffset = 0;
    el.ring.style.transform        = 'rotate(-90deg)';
    el.ring.style.transformOrigin  = '110px 110px';
}

/* ===================== 6. 核心更新 ===================== */

function updateClock() {
    const now       = new Date();
    const hours     = now.getHours();
    const minutes   = now.getMinutes();
    const seconds   = now.getSeconds();

    renderTime(hours, minutes, seconds);
    renderRing(seconds);
    renderDate(now);
}

function renderTime(hours, minutes, seconds) {
    let displayHours = hours;

    if (state.is24Hour) {
        el.ampm.textContent = '';
    } else {
        el.ampm.textContent = hours >= 12 ? 'PM' : 'AM';
        displayHours = hours % 12 || 12;
    }

    el.clock.textContent =
        `${String(displayHours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`;
}

function renderRing(seconds) {
    const progress = seconds / 60;                  // 0 ~ 1
    const offset   = CIRCUMFERENCE * (1 - progress);
    el.ring.style.strokeDashoffset = offset;
}

function renderDate(now) {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const w = CONFIG.WEEKDAYS[now.getDay()];
    el.date.textContent = `${y}年${m}月${d}日 ${w}`;
}

/* ===================== 7. 計時器 (對齊整秒) ===================== */

function preciseTick() {
    updateClock();
    const delay = 1000 - (Date.now() % 1000);
    state.timerId = setTimeout(preciseTick, delay);
}

function startClock() {
    stopClock();
    updateClock();          // 立即顯示,避免延遲
    preciseTick();
}

function stopClock() {
    if (state.timerId !== null) {
        clearTimeout(state.timerId);
        state.timerId = null;
    }
}

/* ===================== 8. 12/24 制切換 ===================== */

function toggleFormat() {
    state.is24Hour = !state.is24Hour;
    saveFormatPreference(state.is24Hour);
    updateToggleLabel();
    updateClock();          // 立即反映,不等下一秒
}

function updateToggleLabel() {
    el.toggleLabel.textContent = state.is24Hour ? '24 小時制' : '12 小時制';
}

function loadFormatPreference() {
    return localStorage.getItem(CONFIG.STORAGE_KEY) !== '12';
}

function saveFormatPreference(is24Hour) {
    localStorage.setItem(CONFIG.STORAGE_KEY, is24Hour ? '24' : '12');
}

/* ===================== 9. 事件綁定 ===================== */

function bindEvents() {
    el.toggleBtn.addEventListener('click', toggleFormat);

    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function handleVisibilityChange() {
    if (document.hidden) {
        stopClock();        // 切到別的分頁時暫停,省電
    } else {
        startClock();       // 回來時立即恢復並校正時間
    }
}

/* ===================== 10. 啟動 ===================== */

init();