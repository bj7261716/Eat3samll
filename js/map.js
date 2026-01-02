// ====================================
// Google Maps 地圖功能
// ====================================

/**
 * 地圖服務模組
 * 處理 Google Maps 初始化、標記管理和導航功能
 */

const MapService = {
    // Google Map 實例
    map: null,

    // 標記陣列
    markers: [],

    // 資訊視窗
    infoWindow: null,

    // 使用者位置標記
    userMarker: null,

    /**
     * 初始化地圖
     * @param {string} elementId - 地圖容器元素 ID
     * @param {Object} center - 中心座標
     * @param {number} zoom - 縮放層級
     */
    initMap(elementId, center, zoom) {
        const mapElement = document.getElementById(elementId);
        if (!mapElement) {
            console.error('Map element not found');
            return;
        }

        // 建立地圖
        this.map = new google.maps.Map(mapElement, {
            center: center,
            zoom: zoom || APP_CONFIG.defaultZoom,
            styles: APP_CONFIG.mapStyles,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });

        // 建立資訊視窗
        this.infoWindow = new google.maps.InfoWindow();

        // 初始化 Places Service
        PlacesService.init(this.map);

        return this.map;
    },

    /**
     * 設定地圖中心
     * @param {Object} center - 中心座標 {lat, lng}
     */
    setCenter(center) {
        if (this.map) {
            this.map.setCenter(center);
        }
    },

    /**
     * 設定縮放層級
     * @param {number} zoom - 縮放層級
     */
    setZoom(zoom) {
        if (this.map) {
            this.map.setZoom(zoom);
        }
    },

    /**
     * 添加使用者位置標記
     * @param {Object} location - 位置座標
     */
    addUserMarker(location) {
        // 移除舊的標記
        if (this.userMarker) {
            this.userMarker.setMap(null);
        }

        // 建立新標記
        this.userMarker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: '您的位置',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            zIndex: 1000
        });
    },

    /**
     * 添加餐廳標記
     * @param {Array} restaurants - 餐廳陣列
     */
    addRestaurantMarkers(restaurants) {
        // 清除舊的標記
        this.clearMarkers();

        // 建立新標記
        restaurants.forEach((restaurant, index) => {
            const marker = new google.maps.Marker({
                position: restaurant.location,
                map: this.map,
                title: restaurant.name,
                label: {
                    text: `${index + 1}`,
                    color: '#FFFFFF',
                    fontWeight: 'bold'
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#FF6B6B',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                }
            });

            // 點擊標記時顯示資訊視窗
            marker.addListener('click', () => {
                this.showInfoWindow(marker, restaurant);
            });

            this.markers.push(marker);
        });

        // 調整地圖視野以包含所有標記
        this.fitBounds(restaurants.map(r => r.location));
    },

    /**
     * 清除所有餐廳標記
     */
    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
    },

    /**
     * 調整地圖視野以包含所有位置
     * @param {Array} locations - 位置座標陣列
     */
    fitBounds(locations) {
        if (!this.map || locations.length === 0) return;

        const bounds = new google.maps.LatLngBounds();

        // 加入使用者位置
        if (this.userMarker) {
            bounds.extend(this.userMarker.getPosition());
        }

        // 加入所有餐廳位置
        locations.forEach(location => {
            bounds.extend(location);
        });

        this.map.fitBounds(bounds);

        // 如果只有一個位置，設定固定縮放層級
        if (locations.length === 1) {
            this.map.setZoom(15);
        }
    },

    /**
     * 顯示資訊視窗
     * @param {Object} marker - 標記物件
     * @param {Object} restaurant - 餐廳資料
     */
    showInfoWindow(marker, restaurant) {
        const status = PlacesService.formatOpenStatus(restaurant.isOpen);
        const priceLevel = PlacesService.formatPriceLevel(restaurant.priceLevel);

        const content = `
      <div class="map-info-window">
        <h3 class="map-info-title">${restaurant.name}</h3>
        <div class="map-info-meta">
          <div>⭐ ${restaurant.rating.toFixed(1)} (${restaurant.reviewCount} 則評論)</div>
          <div>💰 ${priceLevel}</div>
          <div>📍 ${GeolocationService.formatDistance(restaurant.distance)}</div>
          ${status.text ? `<div class="badge badge-${status.class}">${status.text}</div>` : ''}
        </div>
        <button 
          class="btn btn-primary btn-sm map-info-btn" 
          onclick="MapService.navigateToRestaurant('${restaurant.id}', ${restaurant.location.lat}, ${restaurant.location.lng})"
        >
          🧭 開始導航
        </button>
      </div>
    `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    },

    /**
     * 導航至餐廳
     * @param {string} restaurantId - 餐廳 ID
     * @param {number} lat - 緯度
     * @param {number} lng - 經度
     */
    navigateToRestaurant(restaurantId, lat, lng) {
        const destination = `${lat},${lng}`;
        const url = this.getNavigationUrl(destination);
        window.open(url, '_blank');

        // 記錄到歷史
        const restaurant = PlacesService.lastResults.find(r => r.id === restaurantId);
        if (restaurant) {
            StorageManager.addToHistory(restaurant);
        }
    },

    /**
     * 產生導航 URL
     * @param {string} destination - 目的地座標或地址
     * @returns {string} 導航 URL
     */
    getNavigationUrl(destination) {
        // 偵測使用者裝置
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile && isIOS) {
            // iOS 裝置：優先使用 Apple Maps
            return `http://maps.apple.com/?daddr=${encodeURIComponent(destination)}`;
        } else {
            // 其他裝置：使用 Google Maps
            return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        }
    },

    /**
     * 高亮顯示特定標記
     * @param {number} index - 標記索引
     */
    highlightMarker(index) {
        if (index >= 0 && index < this.markers.length) {
            const marker = this.markers[index];

            // 暫時放大標記
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 700);

            // 移動地圖中心到標記
            this.map.panTo(marker.getPosition());
        }
    },

    /**
     * 將地圖重設為預設狀態
     */
    reset() {
        this.clearMarkers();
        if (this.userMarker) {
            this.userMarker.setMap(null);
            this.userMarker = null;
        }
        if (this.infoWindow) {
            this.infoWindow.close();
        }
    }
};

// 全域回調函數，供 Google Maps API 腳本載入完成後呼叫
function initMap() {
    console.log('Google Maps API loaded successfully');
    // 地圖會在首次搜尋時初始化
}

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapService;
}
