// ====================================
// 搜尋歷史管理
// ====================================

/**
 * 搜尋歷史管理模組
 * 處理搜尋歷史的儲存、讀取和重複搜尋
 */

const HistoryManager = {
    // 最大歷史記錄數量
    maxHistory: 20,

    // 歷史記錄
    history: [],

    /**
     * 初始化歷史管理器
     */
    init() {
        this.loadHistory();
    },

    /**
     * 儲存搜尋記錄
     * @param {Object} filters - 篩選條件
     * @param {number} resultCount - 結果數量
     */
    saveSearch(filters, resultCount) {
        const historyItem = {
            filters: filters,
            resultCount: resultCount,
            timestamp: new Date().getTime(),
            id: `search_${Date.now()}`
        };

        // 新增到歷史記錄開頭
        this.history.unshift(historyItem);

        // 限制歷史記錄數量
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }

        // 儲存到 localStorage
        this.saveToStorage();
    },

    /**
     * 從 localStorage 載入歷史記錄
     */
    loadHistory() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.history);
            if (stored) {
                this.history = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.history = [];
        }
    },

    /**
     * 儲存到 localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    },

    /**
     * 取得歷史記錄列表
     * @param {number} limit - 限制數量
     * @returns {Array} 歷史記錄陣列
     */
    getHistory(limit = 10) {
        return this.history.slice(0, limit);
    },

    /**
     * 清除所有歷史記錄
     */
    clearHistory() {
        this.history = [];
        this.saveToStorage();
    },

    /**
     * 刪除單一歷史記錄
     * @param {string} id - 記錄 ID
     */
    removeHistory(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveToStorage();
    },

    /**
     * 格式化時間顯示
     * @param {number} timestamp - 時間戳記
     * @returns {string} 格式化的時間字串
     */
    formatTime(timestamp) {
        const now = new Date().getTime();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return '剛剛';
        if (minutes < 60) return `${minutes} 分鐘前`;
        if (hours < 24) return `${hours} 小時前`;
        if (days < 7) return `${days} 天前`;

        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    },

    /**
     * 格式化篩選條件顯示
     * @param {Object} filters - 篩選條件
     * @returns {string} 格式化的字串
     */
    formatFilters(filters) {
        const parts = [];

        if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
            const names = filters.cuisineTypes.map(id => {
                const cuisine = CUISINE_TYPES.find(c => c.id === id);
                return cuisine ? cuisine.name : id;
            });
            parts.push(names.join('、'));
        }

        if (filters.distance) {
            parts.push(`${filters.distance.replace('km', ' 公里內')}`);
        }

        if (filters.minRating && filters.minRating > 0) {
            parts.push(`⭐${filters.minRating}+`);
        }

        return parts.length > 0 ? parts.join(' • ') : '所有餐廳';
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}
