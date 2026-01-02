// ====================================
// Google Maps API 配置
// ====================================

/**
 * Google Maps API 金鑰
 * 請將此處替換為您的 API 金鑰
 * 
 * 申請步驟請參考 README.md 中的「Google Maps API 金鑰申請指南」
 * 
 * 重要事項：
 * 1. 請勿將包含真實 API 金鑰的檔案上傳至公開的版本控制系統
 * 2. 務必設定 API 金鑰的網域限制
 * 3. 定期檢查 API 使用量
 */
const GOOGLE_MAPS_API_KEY = 'AIzaSyC7-zKEDlw5zwqkUA9KeVhiC6V4StKyryo';

/**
 * Gemini AI API 金鑰
 * 
 * 取得方式：
 * 1. 前往 https://makersuite.google.com/app/apikey
 * 2. 建立 API 金鑰
 * 3. 將金鑰貼上到這裡
 * 
 * 免費額度：每分鐘 60 次請求
 */
const GEMINI_API_KEY = 'AIzaSyBx7KKOYBT_FRGBkVltzHgxlkIuBPEJRlo';

// 明確設定到全域 window 物件，確保 AI 模組可以存取
window.GEMINI_API_KEY = GEMINI_API_KEY;
window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;

// ====================================
// 應用程式配置
// ====================================

const APP_CONFIG = {
    // 預設中心點（台北 101）
    defaultCenter: {
        lat: 25.0330,
        lng: 121.5654
    },

    // 預設縮放層級
    defaultZoom: 15,

    // 搜尋半徑（公尺）
    searchRadius: {
        '1km': 1000,
        '3km': 3000,
        '5km': 5000,
        '10km': 10000
    },

    // 預設搜尋距離
    defaultDistance: '3km',

    // 最大推薦餐廳數量
    maxRecommendations: 5,

    // 最小推薦餐廳數量
    minRecommendations: 3,

    // 地圖樣式（可選）
    mapStyles: [
        // 可在此加入自訂地圖樣式
        // 參考：https://mapstyle.withgoogle.com/
    ],

    // 時段定義
    timeSlots: {
        lunch: {
            start: 11,  // 11:00
            end: 14     // 14:00
        },
        dinner: {
            start: 17,  // 17:00
            end: 21     // 21:00
        }
    }
};

// ====================================
// 料理類型定義
// ====================================

const CUISINE_TYPES = [
    { id: 'chinese', name: '中式料理', icon: '🥟', keywords: ['chinese', 'taiwanese'] },
    { id: 'japanese', name: '日式料理', icon: '🍣', keywords: ['japanese', 'sushi', 'ramen'] },
    { id: 'italian', name: '義式料理', icon: '🍝', keywords: ['italian', 'pizza', 'pasta'] },
    { id: 'american', name: '美式料理', icon: '🍔', keywords: ['american', 'burger', 'steak'] },
    { id: 'thai', name: '泰式料理', icon: '🍜', keywords: ['thai'] },
    { id: 'korean', name: '韓式料理', icon: '🍲', keywords: ['korean', 'bbq'] },
    { id: 'healthy', name: '健康餐', icon: '🥗', keywords: ['salad', 'healthy', 'organic', 'vegan', 'vegetarian', '輕食', '沙拉', '健康', '有機', '素食'] },
    { id: 'cafe', name: '咖啡廳', icon: '☕', keywords: ['cafe', 'coffee', 'dessert'] },
    { id: 'breakfast', name: '早午餐', icon: '🥞', keywords: ['breakfast', 'brunch'] },
    { id: 'hotpot', name: '火鍋', icon: '🍲', keywords: ['hot pot', 'hotpot'] }
];

// ====================================
// 價格等級定義
// ====================================

const PRICE_LEVELS = [
    { level: 1, symbol: '$', name: '經濟實惠', range: '< NT$200' },
    { level: 2, symbol: '$$', name: '平價美食', range: 'NT$200-400' },
    { level: 3, symbol: '$$$', name: '中高價位', range: 'NT$400-800' },
    { level: 4, symbol: '$$$$', name: '高級饗宴', range: '> NT$800' }
];

// ====================================
// UI 文字與訊息
// ====================================

const UI_TEXT = {
    loading: {
        location: '正在取得您的位置...',
        search: '正在搜尋附近的美食...',
        map: '正在載入地圖...'
    },

    error: {
        locationDenied: '無法取得您的位置，請允許瀏覽器存取地理位置權限',
        locationUnavailable: '無法取得位置資訊，請檢查您的裝置設定',
        locationTimeout: '取得位置逾時，請稍後再試',
        apiKeyMissing: '請先設定 Google Maps API 金鑰（請參考 README.md）',
        searchFailed: '搜尋失敗，請稍後再試',
        noResults: '找不到符合條件的餐廳，請嘗試調整搜尋條件'
    },

    success: {
        locationFound: '已取得您的位置',
        searchComplete: (count) => `找到 ${count} 家推薦餐廳`
    },

    navigation: {
        openMaps: '開啟地圖導航',
        calculating: '計算路線中...'
    }
};

// ====================================
// 本地儲存鍵值
// ====================================

const STORAGE_KEYS = {
    preferences: 'eat3small_preferences',
    history: 'eat3small_history',
    favorites: 'eat3small_favorites',
    lastLocation: 'eat3small_last_location'
};

// ====================================
// Places API 配置
// ====================================

const PLACES_CONFIG = {
    // 搜尋類型
    types: ['restaurant', 'cafe', 'food'],

    // 語言設定
    language: 'zh-TW',

    // 地區偏好
    region: 'TW',

    // 營業狀態權重
    openNowWeight: 1.5,

    // 評分權重
    ratingWeight: 1.2
};

// 匯出配置供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GOOGLE_MAPS_API_KEY,
        APP_CONFIG,
        CUISINE_TYPES,
        PRICE_LEVELS,
        UI_TEXT,
        STORAGE_KEYS,
        PLACES_CONFIG,
        GEMINI_API_KEY
    };
}
