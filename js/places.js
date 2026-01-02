// ====================================
// Places API 與餐廳搜尋邏輯
// ====================================

/**
 * Places API 服務模組
 * 處理餐廳搜尋、篩選與排序
 */

const PlacesService = {
    // Google Places Service 實例
    service: null,

    // 最後的搜尋結果
    lastResults: [],

    /**
     * 初始化 Places Service
     * @param {Object} map - Google Maps 實例
     */
    init(map) {
        if (window.google && window.google.maps) {
            this.service = new google.maps.places.PlacesService(map);
        }
    },

    /**
     * 搜尋附近的餐廳
     * @param {Object} filters - 篩選條件
     * @returns {Promise<Array>} 餐廳陣列
     */
    async searchRestaurants(filters) {
        return new Promise(async (resolve, reject) => {
            try {
                // 檢查 Google Maps API 是否已載入
                if (!window.google || !window.google.maps) {
                    reject(new Error('Google Maps API 尚未載入'));
                    return;
                }

                // 確保 Places Service 已初始化
                if (!this.service) {
                    // 建立一個隱藏的 div 用於初始化 Places Service
                    const mapDiv = document.createElement('div');
                    mapDiv.style.display = 'none';
                    document.body.appendChild(mapDiv);

                    const tempMap = new google.maps.Map(mapDiv, {
                        center: APP_CONFIG.defaultCenter,
                        zoom: 15
                    });

                    this.init(tempMap);
                }

                // 取得當前位置
                let location;
                try {
                    location = await GeolocationService.getLocation();
                } catch (error) {
                    console.warn('Failed to get location, using default:', error);
                    location = GeolocationService.getDefaultLocation();
                }

                // 取得距離半徑（公尺）
                const radius = APP_CONFIG.searchRadius[filters.distance] || 3000;

                // 建立搜尋請求
                const request = {
                    location: new google.maps.LatLng(location.lat, location.lng),
                    radius: radius,
                    type: 'restaurant',
                    language: PLACES_CONFIG.language
                };

                // 如果有選擇「目前營業中」
                if (filters.timeSlot === 'open') {
                    request.openNow = true;
                }

                // 執行搜尋
                this.service.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // 處理結果
                        let restaurants = this.processResults(results, location);

                        // 套用篩選條件
                        restaurants = this.applyFilters(restaurants, filters);

                        // 排序
                        restaurants = this.sortResults(restaurants, 'relevance');

                        // 限制數量為 3-5 家
                        const count = Math.min(
                            Math.max(restaurants.length, APP_CONFIG.minRecommendations),
                            APP_CONFIG.maxRecommendations
                        );
                        restaurants = restaurants.slice(0, count);

                        this.lastResults = restaurants;
                        resolve(restaurants);
                    } else {
                        reject(new Error(`Places API error: ${status}`));
                    }
                });

            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * 處理搜尋結果
     * @param {Array} results - Google Places API 結果
     * @param {Object} userLocation - 使用者位置
     * @returns {Array} 處理後的餐廳陣列
     */
    processResults(results, userLocation) {
        return results.map(place => {
            // 計算距離
            const distance = GeolocationService.calculateDistance(
                userLocation,
                { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
            );

            // 處理營業時間
            const isOpen = place.opening_hours ? place.opening_hours.open_now : null;

            return {
                id: place.place_id,
                name: place.name,
                type: place.types || [],
                priceLevel: place.price_level || 2,
                location: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                },
                address: place.vicinity || '',
                rating: place.rating || 0,
                reviewCount: place.user_ratings_total || 0,
                isOpen: isOpen,
                distance: distance,
                photos: place.photos || [],
                openingHours: place.opening_hours
            };
        });
    },

    /**
     * 套用篩選條件
     * @param {Array} restaurants - 餐廳陣列
     * @param {Object} filters - 篩選條件
     * @returns {Array} 篩選後的餐廳陣列
     */
    applyFilters(restaurants, filters) {
        let filtered = restaurants;

        // 料理類型篩選
        if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
            filtered = filtered.filter(restaurant => {
                return filters.cuisineTypes.some(cuisineId => {
                    const cuisine = CUISINE_TYPES.find(c => c.id === cuisineId);
                    if (!cuisine) return false;

                    // 檢查餐廳類型是否符合
                    return cuisine.keywords.some(keyword =>
                        restaurant.type.some(type =>
                            type.toLowerCase().includes(keyword.toLowerCase()) ||
                            restaurant.name.toLowerCase().includes(keyword.toLowerCase())
                        )
                    );
                });
            });
        }

        // 價格篩選
        if (filters.priceLevels && filters.priceLevels.length > 0) {
            filtered = filtered.filter(restaurant =>
                filters.priceLevels.includes(restaurant.priceLevel)
            );
        }

        // 評分篩選
        if (filters.minRating && filters.minRating > 0) {
            filtered = filtered.filter(restaurant =>
                restaurant.rating >= filters.minRating
            );
        }

        // 評論數篩選
        if (filters.minReviews && filters.minReviews > 0) {
            filtered = filtered.filter(restaurant =>
                restaurant.reviewCount >= filters.minReviews
            );
        }

        // 時段篩選
        if (filters.timeSlot && filters.timeSlot !== 'all' && filters.timeSlot !== 'open') {
            filtered = this.filterByTimeSlot(filtered, filters.timeSlot);
        }

        return filtered;
    },

    /**
     * 依時段篩選
     * @param {Array} restaurants - 餐廳陣列
     * @param {string} timeSlot - 時段 ('lunch' 或 'dinner')
     * @returns {Array} 篩選後的餐廳陣列
     */
    filterByTimeSlot(restaurants, timeSlot) {
        // 此功能需要詳細的營業時間資訊
        // 由於 nearbySearch 回傳的資訊有限，這裡先保留所有餐廳
        // 實務上需要對每個餐廳呼叫 getDetails 取得完整營業時間
        return restaurants;
    },

    /**
     * 排序結果
     * @param {Array} restaurants - 餐廳陣列
     * @param {string} sortBy - 排序方式
     * @returns {Array} 排序後的餐廳陣列
     */
    sortResults(restaurants, sortBy) {
        const sorted = [...restaurants];

        switch (sortBy) {
            case 'rating':
                // 評分高至低
                sorted.sort((a, b) => b.rating - a.rating);
                break;

            case 'distance':
                // 距離近至遠
                sorted.sort((a, b) => a.distance - b.distance);
                break;

            case 'reviews':
                // 評論數多至少
                sorted.sort((a, b) => b.reviewCount - a.reviewCount);
                break;

            case 'relevance':
            default:
                // 推薦排序：綜合考量評分、距離和營業狀態
                sorted.sort((a, b) => {
                    // 營業中的優先
                    if (a.isOpen !== b.isOpen) {
                        return (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0);
                    }

                    // 計算綜合分數
                    const scoreA = (a.rating * PLACES_CONFIG.ratingWeight) - (a.distance * 0.1);
                    const scoreB = (b.rating * PLACES_CONFIG.ratingWeight) - (b.distance * 0.1);

                    return scoreB - scoreA;
                });
                break;
        }

        return sorted;
    },

    /**
     * 取得餐廳詳細資訊
     * @param {string} placeId - Place ID
     * @returns {Promise<Object>} 詳細資訊
     */
    async getPlaceDetails(placeId) {
        return new Promise((resolve, reject) => {
            if (!this.service) {
                reject(new Error('Places Service not initialized'));
                return;
            }

            const request = {
                placeId: placeId,
                fields: [
                    'name', 'formatted_address', 'formatted_phone_number',
                    'opening_hours', 'website', 'photos', 'rating',
                    'user_ratings_total', 'price_level', 'reviews',
                    'geometry'
                ],
                language: PLACES_CONFIG.language
            };

            this.service.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(place);
                } else {
                    reject(new Error(`Failed to get place details: ${status}`));
                }
            });
        });
    },

    /**
     * 取得餐廳照片 URL
     * @param {Object} photo - Google Places Photo 物件
     * @param {number} maxWidth - 最大寬度
     * @returns {string} 照片 URL
     */
    getPhotoUrl(photo, maxWidth = 400) {
        if (!photo || !photo.getUrl) return null;
        return photo.getUrl({ maxWidth: maxWidth });
    },

    /**
     * 格式化價格等級顯示
     * @param {number} priceLevel - 價格等級 (1-4)
     * @returns {string} 格式化字串
     */
    formatPriceLevel(priceLevel) {
        const price = PRICE_LEVELS.find(p => p.level === priceLevel);
        return price ? price.symbol : '$$';
    },

    /**
     * 格式化營業狀態
     * @param {boolean} isOpen - 是否營業中
     * @returns {Object} 狀態物件 {text, class}
     */
    formatOpenStatus(isOpen) {
        if (isOpen === null || isOpen === undefined) {
            return { text: '營業資訊不明', class: '' };
        }
        return isOpen
            ? { text: '營業中', class: 'open' }
            : { text: '休息中', class: 'closed' };
    }
};

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlacesService;
}
