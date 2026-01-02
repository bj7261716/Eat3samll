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
            minRatingSlider: document.getElementById('minRatingSlider'),
            minRatingValue: document.getElementById('minRatingValue'),
            minReviewsSlider: document.getElementById('minReviewsSlider'),
            minReviewsValue: document.getElementById('minReviewsValue'),
            priceInfoBtn: document.getElementById('priceInfoBtn'),
            priceTooltip: document.getElementById('priceTooltip'),
            resetBtn: document.getElementById('resetBtn'),
            refreshLocationBtn: document.getElementById('refreshLocationBtn'),

            // 搜尋歷史
            searchHistory: document.getElementById('searchHistory'),
            searchHistoryList: document.getElementById('searchHistoryList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),

            // 快速篩選和條件標籤
            quickFilters: document.getElementById('quickFilters'),
            activeFilters: document.getElementById('activeFilters'),
            activeFiltersList: document.getElementById('activeFiltersList'),
            clearFiltersBtn: document.getElementById('clearFiltersBtn'),

            // 結果區域
            resultsSection: document.getElementById('resultsSection'),
            resultsHeader: document.getElementById('resultsHeader'),
            resultsCount: document.getElementById('resultsCount'),
            resultsList: document.getElementById('resultsList'),
            resultsMap: document.getElementById('resultsMap'),
            emptyState: document.getElementById('emptyState'),
            noResultsState: document.getElementById('noResultsState'),
            retrySearchBtn: document.getElementById('retrySearchBtn'),
            filtersBar: document.getElementById('filtersBar'),
            sortSelect: document.getElementById('sortSelect'),

            // 視圖切換
            listViewBtn: document.getElementById('listViewBtn'),
            mapViewBtn: document.getElementById('mapViewBtn'),

            // AI 功能按鈕
            aiChatBtn: document.getElementById('aiChatBtn'),
            voiceSearchBtn: document.getElementById('voiceSearchBtn'),

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
        const distances = [
            { value: '1km', icon: '🚶', mode: '步行', time: '約 12 分鐘' },
            { value: '3km', icon: '🚴', mode: '騎車', time: '約 10 分鐘' },
            { value: '5km', icon: '🛵', mode: '機車', time: '約 10 分鐘' },
            { value: '10km', icon: '🚗', mode: '開車', time: '約 15 分鐘' }
        ];
        const slider = this.elements.distanceSlider;

        slider.addEventListener('input', (e) => {
            const dist = distances[e.target.value];
            this.elements.distanceValue.textContent = `${dist.icon} ${dist.value.replace('km', ' 公里')} (${dist.mode}${dist.time})`;
        });

        // 設定初始值
        const initial = distances[1]; // 3km
        this.elements.distanceValue.textContent = `${initial.icon} ${initial.value.replace('km', ' 公里')} (${initial.mode}${initial.time})`;
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

        // 價格說明 tooltip
        this.elements.priceInfoBtn.addEventListener('click', () => {
            this.togglePriceTooltip();
        });

        // 關閉 tooltip
        const tooltipClose = this.elements.priceTooltip.querySelector('.tooltip-close');
        if (tooltipClose) {
            tooltipClose.addEventListener('click', () => {
                this.elements.priceTooltip.classList.add('hidden');
            });
        }

        // 評分滑桿
        this.elements.minRatingSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.elements.minRatingValue.textContent = value === 0 ? '⭐ 不限' : `⭐ ${value.toFixed(1)} 星以上`;
        });

        // 評論數滑桿
        this.elements.minReviewsSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.minReviewsValue.textContent = value === 0 ? '💬 不限' : `💬 ${value}+ 則評論`;
        });

        // 清除歷史記錄
        if (this.elements.clearHistoryBtn) {
            this.elements.clearHistoryBtn.addEventListener('click', () => {
                this.clearSearchHistory();
            });
        }

        // 重試搜尋
        if (this.elements.retrySearchBtn) {
            this.elements.retrySearchBtn.addEventListener('click', () => {
                this.hideNoResults();
                this.elements.emptyState.classList.remove('hidden');
            });
        }

        // 快速篩選按鈕
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyQuickFilter(preset);
            });
        });

        // 清除所有篩選條件
        if (this.elements.clearFiltersBtn) {
            this.elements.clearFiltersBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // AI 聊天助手
        if (this.elements.aiChatBtn) {
            this.elements.aiChatBtn.addEventListener('click', () => {
                this.openAIChat();
            });
        }

        // 語音搜尋
        if (this.elements.voiceSearchBtn) {
            this.elements.voiceSearchBtn.addEventListener('click', () => {
                this.startVoiceSearch();
            });
        }
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

            // 顯示骨架屏
            this.showSkeleton();

            // 執行搜尋
            console.log('🔍 呼叫 PlacesService.searchRestaurants...');
            const restaurants = await PlacesService.searchRestaurants(filters);
            console.log(`✅ 搜尋完成，找到 ${restaurants.length} 家餐廳:`, restaurants);

            // 儲存偏好設定
            StorageManager.savePreferences(filters);
            console.log('💾 偏好設定已儲存');

            // 儲存搜尋歷史
            HistoryManager.saveSearch(filters, restaurants.length);
            this.renderSearchHistory();
            console.log('📝 搜尋歷史已儲存');

            // 顯示活躍篩選條件
            this.renderActiveFilters(filters);

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

        // 最低評分
        const minRating = parseFloat(this.elements.minRatingSlider.value);

        // 最少評論數
        const minReviews = parseInt(this.elements.minReviewsSlider.value);

        return {
            cuisineTypes,
            priceLevels,
            distance,
            timeSlot,
            minRating,
            minReviews
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
                <span class="review-count">(${restaurant.reviewCount} 則評論)</span>
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
                class="btn btn-secondary btn-sm"
                data-favorite-index="${index}"
                onclick="UIManager.toggleFavorite(${index})"
                title="${FavoritesManager.isFavorite(restaurant.id) ? '取消收藏' : '加入收藏'}"
              >
                ${FavoritesManager.isFavorite(restaurant.id) ? '❤️' : '🤍'} ${FavoritesManager.isFavorite(restaurant.id) ? '已收藏' : '收藏'}
              </button>
              <button 
                class="btn btn-primary btn-sm"
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
     * 切換價格說明 tooltip
     */
    togglePriceTooltip() {
        this.elements.priceTooltip.classList.toggle('hidden');
    },

    /**
     * 渲染搜尋歷史
     */
    renderSearchHistory() {
        const history = HistoryManager.getHistory(10);

        if (history.length === 0) {
            this.elements.searchHistory.classList.add('hidden');
            return;
        }

        const html = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-content" onclick="UIManager.repeatSearch('${item.id}')">
                    <div class="history-item-filters">${HistoryManager.formatFilters(item.filters)}</div>
                    <div class="history-item-meta">
                        ${HistoryManager.formatTime(item.timestamp)} • ${item.resultCount} 家餐廳
                    </div>
                </div>
                <button class="history-item-delete" onclick="UIManager.deleteHistory('${item.id}')" title="刪除">
                    ✕
                </button>
            </div>
        `).join('');

        this.elements.searchHistoryList.innerHTML = html;
        this.elements.searchHistory.classList.remove('hidden');
    },

    /**
     * 重複搜尋（從歷史記錄）
     * @param {string} historyId - 歷史記錄 ID
     */
    repeatSearch(historyId) {
        const item = HistoryManager.history.find(h => h.id === historyId);
        if (!item) return;

        // TODO: 套用篩選條件並執行搜尋
        console.log('重複搜尋:', item.filters);
    },

    /**
     * 刪除歷史記錄
     * @param {string} historyId - 歷史記錄 ID
     */
    deleteHistory(historyId) {
        HistoryManager.removeHistory(historyId);
        this.renderSearchHistory();
    },

    /**
     * 清除所有歷史記錄
     */
    clearSearchHistory() {
        if (confirm('確定要清除所有搜尋歷史嗎？')) {
            HistoryManager.clearHistory();
            this.renderSearchHistory();
        }
    },

    /**
     * 切換收藏狀態
     * @param {number} index - 餐廳索引
     */
    toggleFavorite(index) {
        const restaurant = this.currentRestaurants[index];
        if (!restaurant) return;

        const isFavorited = FavoritesManager.toggleFavorite(restaurant);

        // 更新按鈕圖示
        const btn = document.querySelector(`[data-favorite-index="${index}"]`);
        if (btn) {
            btn.textContent = isFavorited ? '❤️' : '🤍';
            btn.setAttribute('title', isFavorited ? '取消收藏' : '加入收藏');
        }

        // 顯示提示
        this.showSuccess(isFavorited ? '已加入收藏' : '已取消收藏');
    },

    /**
     * 顯示骨架屏
     */
    showSkeleton() {
        const skeletonHTML = Array(6).fill(0).map(() => `
            <div class="skeleton-card">
                <div class="skeleton-image skeleton"></div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text-short"></div>
                    <div class="skeleton-meta">
                        <div class="skeleton skeleton-badge"></div>
                        <div class="skeleton skeleton-badge"></div>
                        <div class="skeleton skeleton-badge"></div>
                    </div>
                    <div class="skeleton skeleton-button"></div>
                </div>
            </div>
        `).join('');

        this.elements.resultsList.innerHTML = skeletonHTML;
        this.elements.resultsHeader.classList.remove('hidden');
        this.elements.filtersBar.classList.remove('hidden');
        this.elements.emptyState.classList.add('hidden');
    },

    /**
     * 隱藏骨架屏
     */
    hideSkeleton() {
        // 骨架屏會在 renderRestaurantList 時被替換
    },

    /**
     * 渲染活躍篩選條件標籤
     * @param {Object} filters - 篩選條件
     */
    renderActiveFilters(filters) {
        const tags = [];

        // 料理類型
        if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
            filters.cuisineTypes.forEach(id => {
                const cuisine = CUISINE_TYPES.find(c => c.id === id);
                if (cuisine) {
                    tags.push({
                        type: 'cuisine',
                        value: id,
                        label: `${cuisine.icon} ${cuisine.name}`
                    });
                }
            });
        }

        // 價格等級
        if (filters.priceLevels && filters.priceLevels.length > 0) {
            filters.priceLevels.forEach(level => {
                const price = PRICE_LEVELS.find(p => p.level === level);
                if (price) {
                    tags.push({
                        type: 'price',
                        value: level,
                        label: `💰 ${price.symbol}`
                    });
                }
            });
        }

        // 距離
        if (filters.distance && filters.distance !== '10km') {
            tags.push({
                type: 'distance',
                value: filters.distance,
                label: `📏 ${filters.distance.replace('km', ' 公里')}`
            });
        }

        // 評分
        if (filters.minRating && filters.minRating > 0) {
            tags.push({
                type: 'rating',
                value: filters.minRating,
                label: `⭐ ${filters.minRating}+ 星`
            });
        }

        // 評論數
        if (filters.minReviews && filters.minReviews > 0) {
            tags.push({
                type: 'reviews',
                value: filters.minReviews,
                label: `💬 ${filters.minReviews}+ 則`
            });
        }

        // 時段
        if (filters.timeSlot && filters.timeSlot !== 'all') {
            const timeSlotNames = {
                open: '營業中',
                lunch: '午餐時段',
                dinner: '晚餐時段'
            };
            tags.push({
                type: 'timeSlot',
                value: filters.timeSlot,
                label: `🕐 ${timeSlotNames[filters.timeSlot]}`
            });
        }

        // 渲染標籤
        if (tags.length > 0) {
            const html = tags.map(tag => `
                <div class="filter-tag">
                    <span>${tag.label}</span>
                    <button 
                        class="filter-tag-remove" 
                        onclick="UIManager.removeFilter('${tag.type}', '${tag.value}')"
                        title="移除"
                    >
                        ✕
                    </button>
                </div>
            `).join('');

            this.elements.activeFiltersList.innerHTML = html;
            this.elements.activeFilters.classList.remove('hidden');
            this.elements.quickFilters.classList.remove('hidden');
        } else {
            this.elements.activeFilters.classList.add('hidden');
            this.elements.quickFilters.classList.add('hidden');
        }
    },

    /**
     * 移除單一篩選條件
     * @param {string} type - 條件類型
     * @param {string} value - 條件值
     */
    removeFilter(type, value) {
        switch (type) {
            case 'cuisine':
                const cuisineCheckbox = document.getElementById(`cuisine-${value}`);
                if (cuisineCheckbox) cuisineCheckbox.checked = false;
                break;
            case 'price':
                const priceCheckbox = document.getElementById(`price-${value}`);
                if (priceCheckbox) priceCheckbox.checked = false;
                break;
            case 'distance':
                // 重置為最大距離
                this.elements.distanceSlider.value = 3;
                this.elements.distanceSlider.dispatchEvent(new Event('input'));
                break;
            case 'rating':
                this.elements.minRatingSlider.value = 0;
                this.elements.minRatingSlider.dispatchEvent(new Event('input'));
                break;
            case 'reviews':
                this.elements.minReviewsSlider.value = 0;
                this.elements.minReviewsSlider.dispatchEvent(new Event('input'));
                break;
            case 'timeSlot':
                document.getElementById('timeSlotAll').checked = true;
                break;
        }

        // 重新執行搜尋
        this.handleSearch();
    },

    /**
     * 套用快速篩選
     * @param {string} preset - 預設方案
     */
    applyQuickFilter(preset) {
        // 先重置表單
        this.resetForm();

        switch (preset) {
            case 'nearby':
                // 附近快餐：1km 內，營業中
                this.elements.distanceSlider.value = 0; // 1km
                this.elements.distanceSlider.dispatchEvent(new Event('input'));
                document.getElementById('timeSlotOpen').checked = true;
                break;

            case 'highrated':
                // 高評分：4.5 星以上
                this.elements.minRatingSlider.value = 4.5;
                this.elements.minRatingSlider.dispatchEvent(new Event('input'));
                break;

            case 'cheap':
                // 經濟實惠：$ 和 $$
                document.getElementById('price-1').checked = true;
                document.getElementById('price-2').checked = true;
                break;

            case 'open':
                // 營業中
                document.getElementById('timeSlotOpen').checked = true;
                break;
        }

        // 執行搜尋
        this.handleSearch();
    },

    /**
     * 初始化圖片懶加載
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            // 觀察所有帶 data-src 的圖片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
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
    },

    /**
     * 開啟 AI 聊天助手
     */
    openAIChat() {
        if (typeof AIChatbot === 'undefined') {
            this.showError('AI 功能尚未載入');
            return;
        }

        const message = prompt('請輸入您的問題：\n例如：「有沒有適合親子用餐的餐廳？」');
        if (!message) return;

        this.showLoading('AI 思考中...');

        AIChatbot.chat(message, this.currentRestaurants || [])
            .then(response => {
                this.hideLoading();
                alert(`🤖 AI 助手：\n\n${response}`);
            })
            .catch(error => {
                this.hideLoading();
                this.showError('AI 回應失敗：' + error.message);
            });
    },

    /**
     * 開始語音搜尋
     */
    startVoiceSearch() {
        if (typeof VoiceSearch === 'undefined' || !VoiceSearch.recognition) {
            this.showError('您的瀏覽器不支援語音識別\n請使用 Chrome 或 Edge 瀏覽器');
            return;
        }

        this.showSuccess('🎤 請開始說話...');

        VoiceSearch.start((filters) => {
            console.log('語音解析結果:', filters);
            this.showSuccess('已識別您的語音指令');

            // 套用篩選條件
            if (filters.cuisineTypes) {
                filters.cuisineTypes.forEach(type => {
                    const checkbox = document.getElementById(`cuisine-${type}`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            if (filters.priceLevels) {
                filters.priceLevels.forEach(level => {
                    const checkbox = document.getElementById(`price-${level}`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            if (filters.distance) {
                const distanceMap = { '1km': 0, '3km': 1, '5km': 2, '10km': 3 };
                this.elements.distanceSlider.value = distanceMap[filters.distance] || 1;
                this.elements.distanceSlider.dispatchEvent(new Event('input'));
            }

            if (filters.minRating) {
                this.elements.minRatingSlider.value = filters.minRating;
                this.elements.minRatingSlider.dispatchEvent(new Event('input'));
            }

            // 自動執行搜尋
            setTimeout(() => {
                this.handleSearch();
            }, 500);
        });
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
