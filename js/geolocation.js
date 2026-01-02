// ====================================
// 地理位置服務
// ====================================

/**
 * 地理位置服務模組
 * 處理使用者位置取得與距離計算
 */

const GeolocationService = {
    // 當前位置
    currentLocation: null,

    /**
     * 取得使用者目前位置
     * @returns {Promise<Object>} 位置物件 {lat, lng}
     */
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            // 檢查瀏覽器是否支援 Geolocation API
            if (!navigator.geolocation) {
                reject(new Error('您的瀏覽器不支援地理位置功能'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    this.currentLocation = location;
                    StorageManager.saveLastLocation(location);

                    resolve(location);
                },
                (error) => {
                    // 處理錯誤
                    let errorMessage;

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = UI_TEXT.error.locationDenied;
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = UI_TEXT.error.locationUnavailable;
                            break;
                        case error.TIMEOUT:
                            errorMessage = UI_TEXT.error.locationTimeout;
                            break;
                        default:
                            errorMessage = '無法取得位置資訊';
                    }

                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 分鐘內的快取位置可接受
                }
            );
        });
    },

    /**
     * 取得位置（優先使用快取）
     * @returns {Promise<Object>} 位置物件
     */
    async getLocation() {
        // 如果已有當前位置，直接回傳
        if (this.currentLocation) {
            return this.currentLocation;
        }

        // 嘗試從 localStorage 讀取
        const savedLocation = StorageManager.getLastLocation();
        if (savedLocation) {
            this.currentLocation = savedLocation;
            return savedLocation;
        }

        // 否則取得新位置
        return await this.getCurrentLocation();
    },

    /**
     * 使用預設位置（台北 101）
     * @returns {Object} 預設位置物件
     */
    getDefaultLocation() {
        return APP_CONFIG.defaultCenter;
    },

    /**
     * 計算兩點之間的距離（公里）
     * 使用 Haversine 公式
     * @param {Object} point1 - 第一個座標點 {lat, lng}
     * @param {Object} point2 - 第二個座標點 {lat, lng}
     * @returns {number} 距離（公里）
     */
    calculateDistance(point1, point2) {
        const R = 6371; // 地球半徑（公里）

        const lat1 = this.toRadians(point1.lat);
        const lat2 = this.toRadians(point2.lat);
        const deltaLat = this.toRadians(point2.lat - point1.lat);
        const deltaLng = this.toRadians(point2.lng - point1.lng);

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 10) / 10; // 四捨五入到小數點一位
    },

    /**
     * 轉換角度為弧度
     * @param {number} degrees - 角度
     * @returns {number} 弧度
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * 格式化距離顯示
     * @param {number} distance - 距離（公里）
     * @returns {string} 格式化的字串
     */
    formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)} 公尺`;
        }
        return `${distance} 公里`;
    },

    /**
     * 檢查位置是否在指定範圍內
     * @param {Object} point - 要檢查的座標點
     * @param {Object} center - 中心座標點
     * @param {number} radius - 半徑（公里）
     * @returns {boolean}
     */
    isWithinRadius(point, center, radius) {
        const distance = this.calculateDistance(point, center);
        return distance <= radius;
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeolocationService;
}
