// ====================================
// 應用程式主入口
// ====================================

/**
 * 智慧美食推薦與導航系統
 * 主要應用程式控制器
 */

const App = {
    /**
     * 初始化應用程式
     */
    async init() {
        console.log('🍽️ Eat3Small 應用程式初始化中...');

        try {
            // 檢查 API 金鑰
            if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
                console.warn('⚠️ Google Maps API 金鑰尚未設定');
                UIManager.showError(UI_TEXT.error.apiKeyMissing);
            }

            // 初始化主題
            ThemeManager.init();
            console.log('✅ 主題管理器初始化完成');

            // 初始化歷史記錄
            HistoryManager.init();
            console.log('✅ 歷史記錄管理器初始化完成');

            // 初始化收藏
            FavoritesManager.init();
            console.log('✅ 收藏管理器初始化完成');

            // 初始化 Gemini AI
            if (typeof GeminiAI !== 'undefined' && GeminiAI.init()) {
                console.log('✅ Gemini AI 初始化完成');

                // 初始化語音搜尋
                if (typeof VoiceSearch !== 'undefined' && VoiceSearch.init()) {
                    console.log('✅ 語音搜尋初始化完成');
                }
            } else {
                console.warn('⚠️ Gemini AI 未啟用（API 金鑰未設定）');
            }

            // 初始化 UI
            UIManager.init();
            console.log('✅ UI 初始化完成');

            // 嘗試取得使用者位置（非阻塞）
            this.initLocation();

            console.log('🎉 應用程式初始化完成！');

        } catch (error) {
            console.error('❌ 應用程式初始化失敗:', error);
            UIManager.showError('應用程式初始化失敗，請重新整理頁面');
        }
    },

    /**
     * 初始化位置服務
     */
    async initLocation() {
        try {
            console.log('📍 正在取得位置...');
            const location = await GeolocationService.getCurrentLocation();
            console.log('✅ 位置取得成功:', location);
        } catch (error) {
            console.warn('⚠️ 無法取得位置，將使用預設位置:', error.message);
            // 不顯示錯誤訊息，因為使用者可能選擇不允許
            // UIManager.showError(error.message);
        }
    },

    /**
     * 重新初始化
     */
    async reinit() {
        console.log('🔄 重新初始化應用程式...');

        // 清除地圖
        if (MapService.map) {
            MapService.reset();
        }

        // 重新初始化
        await this.init();
    }
};

// 確保 DOM 載入完成後再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    // DOM 已載入完成
    App.init();
}

// 將 App 和 UIManager 暴露到全域，供 HTML 中的 onclick 使用
window.App = App;
window.UIManager = UIManager;
window.MapService = MapService;

// 處理頁面可見性變化
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('📱 頁面已可見');
        // 可以在這裡更新資料或重新檢查位置
    }
});

// 處理線上/離線狀態
window.addEventListener('online', () => {
    console.log('🌐 網路已連線');
    UIManager.showSuccess('網路連線已恢復');
});

window.addEventListener('offline', () => {
    console.log('📵 網路已斷線');
    UIManager.showError('網路連線已中斷，部分功能可能無法使用');
});

// 錯誤處理
window.addEventListener('error', (event) => {
    console.error('全域錯誤:', event.error);
    // 可以在這裡記錄錯誤到分析服務
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的 Promise 拒絕:', event.reason);
    // 可以在這裡記錄錯誤到分析服務
});

console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   🍽️  Eat3Small                      ║
  ║   智慧美食推薦與導航系統               ║
  ║                                       ║
  ║   Version: 1.0.0                      ║
  ║   Powered by Google Maps Platform     ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
`);
