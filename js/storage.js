// ====================================
// 本地儲存管理
// ====================================

/**
 * 本地儲存管理模組
 * 處理使用者偏好設定、搜尋歷史和收藏功能
 */

const StorageManager = {
    /**
     * 儲存使用者偏好設定
     * @param {Object} preferences - 偏好設定物件
     */
    savePreferences(preferences) {
        try {
            localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Failed to save preferences:', error);
            return false;
        }
    },

    /**
     * 讀取使用者偏好設定
     * @returns {Object|null} 偏好設定物件或 null
     */
    getPreferences() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.preferences);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return null;
        }
    },

    /**
     * 新增餐廳到搜尋歷史
     * @param {Object} restaurant - 餐廳物件
     */
    addToHistory(restaurant) {
        try {
            let history = this.getHistory() || [];

            // 移除重複項目
            history = history.filter(item => item.id !== restaurant.id);

            // 加入到最前面
            history.unshift({
                ...restaurant,
                timestamp: new Date().toISOString()
            });

            // 保留最近 20 筆
            history = history.slice(0, 20);

            localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Failed to add to history:', error);
            return false;
        }
    },

    /**
     * 取得搜尋歷史
     * @returns {Array} 歷史記錄陣列
     */
    getHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.history);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    },

    /**
     * 清除搜尋歷史
     */
    clearHistory() {
        try {
            localStorage.removeItem(STORAGE_KEYS.history);
            return true;
        } catch (error) {
            console.error('Failed to clear history:', error);
            return false;
        }
    },

    /**
     * 新增餐廳到收藏清單
     * @param {Object} restaurant - 餐廳物件
     */
    addToFavorites(restaurant) {
        try {
            let favorites = this.getFavorites() || [];

            // 檢查是否已經收藏
            if (favorites.some(item => item.id === restaurant.id)) {
                return false;
            }

            favorites.push({
                ...restaurant,
                favoritedAt: new Date().toISOString()
            });

            localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.error('Failed to add to favorites:', error);
            return false;
        }
    },

    /**
     * 從收藏清單移除餐廳
     * @param {string} restaurantId - 餐廳 ID
     */
    removeFromFavorites(restaurantId) {
        try {
            let favorites = this.getFavorites() || [];
            favorites = favorites.filter(item => item.id !== restaurantId);
            localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            return false;
        }
    },

    /**
     * 取得收藏清單
     * @returns {Array} 收藏餐廳陣列
     */
    getFavorites() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.favorites);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load favorites:', error);
            return [];
        }
    },

    /**
     * 檢查餐廳是否已收藏
     * @param {string} restaurantId - 餐廳 ID
     * @returns {boolean}
     */
    isFavorite(restaurantId) {
        const favorites = this.getFavorites();
        return favorites.some(item => item.id === restaurantId);
    },

    /**
     * 儲存最後的位置
     * @param {Object} location - 位置物件 {lat, lng}
     */
    saveLastLocation(location) {
        try {
            localStorage.setItem(STORAGE_KEYS.lastLocation, JSON.stringify(location));
            return true;
        } catch (error) {
            console.error('Failed to save location:', error);
            return false;
        }
    },

    /**
     * 取得最後儲存的位置
     * @returns {Object|null} 位置物件或 null
     */
    getLastLocation() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.lastLocation);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load location:', error);
            return null;
        }
    },

    /**
     * 清除所有儲存的資料
     */
    clearAll() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
