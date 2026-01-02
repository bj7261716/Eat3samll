// ====================================
// 收藏管理
// ====================================

/**
 * 收藏管理模組
 * 處理餐廳收藏的新增、刪除和讀取
 */

const FavoritesManager = {
    // 收藏列表
    favorites: [],

    /**
     * 初始化收藏管理器
     */
    init() {
        this.loadFavorites();
    },

    /**
     * 新增收藏
     * @param {Object} restaurant - 餐廳物件
     */
    addFavorite(restaurant) {
        // 檢查是否已收藏
        if (this.isFavorite(restaurant.id)) {
            return false;
        }

        const favorite = {
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            rating: restaurant.rating,
            reviewCount: restaurant.reviewCount,
            priceLevel: restaurant.priceLevel,
            location: restaurant.location,
            savedAt: new Date().getTime()
        };

        this.favorites.unshift(favorite);
        this.saveToStorage();
        return true;
    },

    /**
     * 移除收藏
     * @param {string} placeId - Place ID
     */
    removeFavorite(placeId) {
        this.favorites = this.favorites.filter(fav => fav.id !== placeId);
        this.saveToStorage();
    },

    /**
     * 檢查是否已收藏
     * @param {string} placeId - Place ID
     * @returns {boolean}
     */
    isFavorite(placeId) {
        return this.favorites.some(fav => fav.id === placeId);
    },

    /**
     * 取得所有收藏
     * @returns {Array} 收藏列表
     */
    getFavorites() {
        return this.favorites;
    },

    /**
     * 從 localStorage 載入收藏
     */
    loadFavorites() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.favorites);
            if (stored) {
                this.favorites = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
            this.favorites = [];
        }
    },

    /**
     * 儲存到 localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    },

    /**
     * 切換收藏狀態
     * @param {Object} restaurant - 餐廳物件
     * @returns {boolean} true=已收藏, false=已取消收藏
     */
    toggleFavorite(restaurant) {
        if (this.isFavorite(restaurant.id)) {
            this.removeFavorite(restaurant.id);
            return false;
        } else {
            this.addFavorite(restaurant);
            return true;
        }
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesManager;
}
