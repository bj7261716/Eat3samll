// ====================================/
// 深色模式管理
// ====================================

/**
 * 深色模式管理模組
 * 處理主題切換和儲存
 */

const ThemeManager = {
    currentTheme: 'light',

    /**
     * 初始化主題管理器
     */
    init() {
        this.loadTheme();
        this.bindEvents();
    },

    /**
     * 載入儲存的主題
     */
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.currentTheme = savedTheme;
            } else {
                // 檢查系統偏好
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    this.currentTheme = 'dark';
                }
            }
            this.applyTheme();
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    },

    /**
     * 套用主題
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // 更新切換按鈕圖示和文字
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const emoji = toggleBtn.querySelector('.btn-emoji');
            const label = toggleBtn.querySelector('.btn-label');

            if (emoji && label) {
                emoji.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
                label.textContent = '主題';
            }

            toggleBtn.setAttribute('title', this.currentTheme === 'dark' ? '切換到淺色模式' : '切換到深色模式');
        }
    },

    /**
     * 切換主題
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    },

    /**
     * 儲存主題偏好
     */
    saveTheme() {
        try {
            localStorage.setItem('theme', this.currentTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    },

    /**
     * 綁定事件
     */
    bindEvents() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // 監聽系統主題變更
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
