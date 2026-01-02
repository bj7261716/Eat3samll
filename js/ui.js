// ====================================
// UI 渲染與互動控制
// ====================================

/**
 * UI 管理模組
 * 處理使用者介面渲染、互動和狀態更新
 */

const UIManager = {
    // 當前視圖模式
    currentView: 'list',

    // DOM 元素快取
    elements: {},

    /**
     * 初始化 UI
     */
    init() {
        // 快取常用 DOM 元素
        this.cacheElements();

        // 初始化搜尋表單
        this.initSearchForm();

        // 綁定事件監聽器
        this.bindEvents();

        // 載入儲存的偏好設定
        this.loadPreferences();
    },

    /**
     * 快取 DOM 元素
     */
    cacheElements() {
        this.elements = {
            // 表單元素
            searchForm: document.getElementById('searchForm'),
            cuisineTypesContainer: document.getElementById('cuisineTypes'),
            priceLevelsContainer: document.getElementById('priceLevels'),
            distanceSlider: document.getElementById('distanceSlider'),
            distanceValue: document.getElementById('distanceValue'),
            resetBtn: document.getElementById('resetBtn'),
            refreshLocationBtn: document.getElementById('refreshLocationBtn'),

            // 結果區域
            resultsSection: document.getElementById('resultsSection'),
            resultsHeader: document.getElementById('resultsHeader'),
            resultsCount: document.getElementById('resultsCount'),
            resultsList: document.getElementById('resultsList'),
            resultsMap: document.getElementById('resultsMap'),
            emptyState: document.getElementById('emptyState'),
            noResultsState: document.getElementById('noResultsState'),
            filtersBar: document.getElementById('filtersBar'),
            sortSelect: document.getElementById('sortSelect'),

            // 視圖切換
            listViewBtn: document.getElementById('listViewBtn'),
            mapViewBtn: document.getElementById('mapViewBtn'),

            // 載入覆蓋層
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),

            // 提示容器
            alertContainer: document.getElementById('alertContainer')
        };
    },

    /**
     * 初始化搜尋表單
     */
    initSearchForm() {
        // 渲染料理類型選項
        this.renderCuisineTypes();

        // 渲染價格等級選項
        this.renderPriceLevels();

        // 初始化距離滑桿
        this.initDistanceSlider();
    },

    /**
     * 渲染料理類型選項
     */
    renderCuisineTypes() {
        const html = CUISINE_TYPES.map(cuisine => `
      <div class="checkbox-item">
        <input 
          type="checkbox" 
          id="cuisine-${cuisine.id}" 
          value="${cuisine.id}"
          name="cuisine"
        >
        <label for="cuisine-${cuisine.id}" class="checkbox-label">
          <span>${cuisine.icon}</span>
          <span>${cuisine.name}</span>
        </label>
      </div>
    `).join('');

        this.elements.cuisineTypesContainer.innerHTML = html;
    },

    /**
     * 渲染價格等級選項
     */
    renderPriceLevels() {
        const html = PRICE_LEVELS.map(price => `
      <div class="checkbox-item">
        <input 
          type="checkbox" 
          id="price-${price.level}" 
          value="${price.level}"
          name="price"
        >
        <label for="price-${price.level}" class="checkbox-label">
          <span>${price.symbol}</span>
          <span class="hidden-mobile">${price.name}</span>
        </label>
      </div>
    `).join('');

        this.elements.priceLevelsContainer.innerHTML = html;
    },

    /**
     * 初始化距離滑桿
     */
    initDistanceSlider() {
        const distances = ['1km', '3km', '5km', '10km'];
        const slider = this.elements.distanceSlider;

        slider.addEventListener('input', (e) => {
            const value = distances[e.target.value];
            this.elements.distanceValue.textContent = value.replace('km', ' 公里');
        });

        // 設定初始值
        this.elements.distanceValue.textContent = '3 公里';
    },

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 搜尋表單提交
        this.elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // 重置按鈕
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetForm();
        });

        // 重新取得位置
        this.elements.refreshLocationBtn.addEventListener('click', () => {
            this.refreshLocation();
        });

        // 視圖切換
        this.elements.listViewBtn.addEventListener('click', () => {
            this.switchView('list');
        });

        this.elements.mapViewBtn.addEventListener('click', () => {
            this.switchView('map');
        });

        // 排序變更
        this.elements.sortSelect.addEventListener('change', (e) => {
            this.handleSortChange(e.target.value);
        });
    },

    /**
     * 處理搜尋
     */
    async handleSearch() {
        console.log('🔍 開始搜尋流程...');

        try {
            // 顯示載入狀態
            this.showLoading(UI_TEXT.loading.search);
            console.log('✅ 顯示載入中介面');

            // 收集篩選條件
            const filters = this.getFilters();
            console.log('📋 篩選條件:', filters);

            // 檢查 Google Maps API 是否載入
            if (!window.google || !window.google.maps) {
                throw new Error('Google Maps API 尚未載入，請重新整理頁面');
            }
            console.log('✅ Google Maps API 已載入');

            // 執行搜尋
            console.log('🔍 呼叫 PlacesService.searchRestaurants...');
            const restaurants = await PlacesService.searchRestaurants(filters);
            console.log(`✅ 搜尋完成，找到 ${restaurants.length} 家餐廳:`, restaurants);

            // 儲存偏好設定
            StorageManager.savePreferences(filters);
            console.log('💾 偏好設定已儲存');

            // 隱藏載入狀態
            this.hideLoading();
            console.log('✅ 隱藏載入中介面');

            // 顯示結果
            if (restaurants.length > 0) {
                console.log('📍 顯示搜尋結果');
                this.displayResults(restaurants);
            } else {
                console.log('❌ 沒有找到餐廳');
                this.showNoResults();
            }

        } catch (error) {
            console.error('❌ 搜尋發生錯誤:', error);
            console.error('錯誤堆疊:', error.stack);

            this.hideLoading();

            // 顯示詳細錯誤訊息
            let errorMessage = error.message || UI_TEXT.error.searchFailed;

            // 針對常見錯誤提供更友善的訊息
            if (errorMessage.includes('API')) {
                errorMessage += '\n\n請檢查：\n1. API 金鑰是否正確\n2. 是否已啟用必要的 API\n3. 瀏覽器控制台（F12）查看詳細錯誤';
            }

            this.showError(errorMessage);

            // 在控制台顯示幫助訊息
            console.log('🔧 診斷建議：');
            console.log('1. 檢查 API 金鑰是否正確設定在 js/config.js');
            console.log('2. 確認已在 Google Cloud Console 啟用以下 API:');
            console.log('   - Maps JavaScript API');
            console.log('   - Places API (New)');
            console.log('   - Geolocation API');
            console.log('3. 檢查 API 金鑰的網域限制是否包含 localhost');
        }
    },

    /**
     * 取得篩選條件
     * @returns {Object} 篩選條件物件
     */
    getFilters() {
        const distances = ['1km', '3km', '5km', '10km'];

        // 料理類型
        const cuisineTypes = Array.from(
            document.querySelectorAll('input[name="cuisine"]:checked')
        ).map(input => input.value);

        // 價格等級
        const priceLevels = Array.from(
            document.querySelectorAll('input[name="price"]:checked')
        ).map(input => parseInt(input.value));

        // 距離
        const distanceIndex = parseInt(this.elements.distanceSlider.value);
        const distance = distances[distanceIndex];

        // 時段
        const timeSlot = document.querySelector('input[name="timeSlot"]:checked').value;

        return {
            cuisineTypes,
            priceLevels,
            distance,
            timeSlot
        };
    },

    /**
     * 顯示搜尋結果
     * @param {Array} restaurants - 餐廳陣列
     */
    displayResults(restaurants) {
        // 隱藏空狀態
        this.elements.emptyState.classList.add('hidden');
        this.elements.noResultsState.classList.add('hidden');

        // 顯示結果區域
        this.elements.resultsHeader.classList.remove('hidden');
        this.elements.filtersBar.classList.remove('hidden');

        // 更新結果計數
        this.elements.resultsCount.textContent = `(找到 ${restaurants.length} 家餐廳)`;

        // 渲染列表
        this.renderRestaurantList(restaurants);

        // 初始化或更新地圖
        if (!MapService.map) {
            GeolocationService.getLocation()
                .then(location => {
                    MapService.initMap('map', location, 15);
                    MapService.addUserMarker(location);
                    MapService.addRestaurantMarkers(restaurants);
                })
                .catch(() => {
                    const defaultLocation = GeolocationService.getDefaultLocation();
                    MapService.initMap('map', defaultLocation, 15);
                    MapService.addRestaurantMarkers(restaurants);
                });
        } else {
            MapService.addRestaurantMarkers(restaurants);
        }

        // 捲動到結果區域
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /**
     * 渲染餐廳列表
     * @param {Array} restaurants - 餐廳陣列
     */
    renderRestaurantList(restaurants) {
        const html = restaurants.map((restaurant, index) => {
            const status = PlacesService.formatOpenStatus(restaurant.isOpen);
            const priceLevel = PlacesService.formatPriceLevel(restaurant.priceLevel);
            const photoUrl = restaurant.photos.length > 0
                ? PlacesService.getPhotoUrl(restaurant.photos[0], 400)
                : null;

            return `
        <div class="restaurant-card animate-slideInUp" style="animation-delay: ${index * 0.1}s">
          <div class="restaurant-card-image">
            ${photoUrl
                    ? `<img src="${photoUrl}" alt="${restaurant.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<span style="font-size: 4rem;">🍽️</span>`
                }
          </div>
          <div class="restaurant-card-content">
            <h3 class="restaurant-card-title">${restaurant.name}</h3>
            <p class="restaurant-card-type">${restaurant.address}</p>
            
            <div class="restaurant-card-meta">
              <span class="restaurant-card-rating">
                ⭐ ${restaurant.rating.toFixed(1)}
              </span>
              <span class="restaurant-card-price">${priceLevel}</span>
              <span class="restaurant-card-distance">
                📍 ${GeolocationService.formatDistance(restaurant.distance)}
              </span>
              ${status.text
                    ? `<span class="restaurant-card-status ${status.class}">${status.text}</span>`
                    : ''
                }
            </div>
            
            <div class="restaurant-card-actions">
              <button 
                class="btn btn-primary btn-sm btn-full"
                onclick="UIManager.navigateToRestaurant(${index})"
              >
                🧭 導航
              </button>
            </div>
          </div>
        </div>
      `;
        }).join('');

        this.elements.resultsList.innerHTML = html;
    },

    /**
     * 導航到餐廳
     * @param {number} index - 餐廳索引
     */
    navigateToRestaurant(index) {
        const restaurant = PlacesService.lastResults[index];
        if (restaurant) {
            MapService.navigateToRestaurant(restaurant.id, restaurant.location.lat, restaurant.location.lng);
        }
    },

    /**
     * 顯示無結果狀態
     */
    showNoResults() {
        this.elements.emptyState.classList.add('hidden');
        this.elements.resultsHeader.classList.add('hidden');
        this.elements.filtersBar.classList.add('hidden');
        this.elements.noResultsState.classList.remove('hidden');
    },

    /**
     * 切換視圖模式
     * @param {string} view - 視圖模式 ('list' 或 'map')
     */
    switchView(view) {
        this.currentView = view;

        if (view === 'list') {
            this.elements.resultsList.classList.remove('hidden');
            this.elements.resultsMap.classList.add('hidden');
            this.elements.listViewBtn.classList.add('active');
            this.elements.mapViewBtn.classList.remove('active');
        } else {
            this.elements.resultsList.classList.add('hidden');
            this.elements.resultsMap.classList.remove('hidden');
            this.elements.listViewBtn.classList.remove('active');
            this.elements.mapViewBtn.classList.add('active');
        }
    },

    /**
     * 處理排序變更
     * @param {string} sortBy - 排序方式
     */
    handleSortChange(sortBy) {
        const restaurants = PlacesService.sortResults(PlacesService.lastResults, sortBy);
        this.renderRestaurantList(restaurants);
        MapService.addRestaurantMarkers(restaurants);
    },

    /**
     * 重置表單
     */
    resetForm() {
        this.elements.searchForm.reset();
        this.elements.distanceSlider.value = 1;
        this.elements.distanceValue.textContent = '3 公里';
    },

    /**
     * 重新取得位置
     */
    async refreshLocation() {
        try {
            this.showLoading(UI_TEXT.loading.location);
            await GeolocationService.getCurrentLocation();
            this.hideLoading();
            this.showSuccess(UI_TEXT.success.locationFound);
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    },

    /**
     * 載入偏好設定
     */
    loadPreferences() {
        const preferences = StorageManager.getPreferences();
        if (!preferences) return;

        // 套用料理類型
        if (preferences.cuisineTypes) {
            preferences.cuisineTypes.forEach(id => {
                const checkbox = document.getElementById(`cuisine-${id}`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // 套用價格等級
        if (preferences.priceLevels) {
            preferences.priceLevels.forEach(level => {
                const checkbox = document.getElementById(`price-${level}`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // 套用距離
        if (preferences.distance) {
            const distances = ['1km', '3km', '5km', '10km'];
            const index = distances.indexOf(preferences.distance);
            if (index !== -1) {
                this.elements.distanceSlider.value = index;
                this.elements.distanceValue.textContent = preferences.distance.replace('km', ' 公里');
            }
        }

        // 套用時段
        if (preferences.timeSlot) {
            const radio = document.getElementById(`timeSlot${preferences.timeSlot.charAt(0).toUpperCase() + preferences.timeSlot.slice(1)}`);
            if (radio) radio.checked = true;
        }
    },

    /**
     * 顯示載入狀態
     * @param {string} message - 載入訊息
     */
    showLoading(message = '載入中...') {
        this.elements.loadingText.textContent = message;
        this.elements.loadingOverlay.classList.remove('hidden');
    },

    /**
     * 隱藏載入狀態
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    },

    /**
     * 顯示成功訊息
     * @param {string} message - 訊息內容
     */
    showSuccess(message) {
        this.showAlert(message, 'success');
    },

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     */
    showError(message) {
        this.showAlert(message, 'error');
    },

    /**
     * 顯示警示訊息
     * @param {string} message - 訊息內容
     * @param {string} type - 訊息類型
     */
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} animate-slideInRight`;
        alertDiv.textContent = message;

        this.elements.alertContainer.appendChild(alertDiv);

        // 3 秒後自動移除
        setTimeout(() => {
            alertDiv.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
