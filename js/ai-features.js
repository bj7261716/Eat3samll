// ====================================
// Gemini AI 整合模組
// ====================================

/**
 * Gemini API 配置與呼叫
 */

const GeminiAI = {
    apiKey: '', // 將在 init 時設定
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',

    /**
     * 初始化 Gemini API
     */
    init(apiKey) {
        this.apiKey = apiKey || window.GEMINI_API_KEY;

        // 檢查金鑰是否有效
        if (!this.apiKey) {
            console.warn('⚠️ Gemini API 金鑰未設定 - GEMINI_API_KEY 變數未定義');
            return false;
        }

        if (this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            console.warn('⚠️ Gemini API 金鑰未設定 - 請在 config.js 中設定您的 API 金鑰');
            return false;
        }

        if (this.apiKey.length < 30) {
            console.warn('⚠️ Gemini API 金鑰格式錯誤 - 金鑰長度不足');
            return false;
        }

        console.log('✅ Gemini AI 初始化完成，API Key:', this.apiKey.substring(0, 10) + '...');
        return true;
    },

    /**
     * 呼叫 Gemini Pro (文字生成)
     * @param {string} prompt - 提示詞
     * @returns {Promise<string>} 生成的文字
     */
    async generateText(prompt) {
        try {
            const url = `${this.baseUrl}/gemini-pro:generateContent?key=${this.apiKey}`;
            console.log('🤖 呼叫 Gemini API...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API 錯誤:', errorData);
                throw new Error(`API Error ${response.status}: ${errorData.error?.message || '未知錯誤'}`);
            }

            const data = await response.json();
            console.log('✅ Gemini API 回應成功');

            if (!data.candidates || !data.candidates[0]) {
                throw new Error('API 回應格式錯誤');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('❌ Gemini API Error:', error);

            if (error.message.includes('API key not valid')) {
                throw new Error('API 金鑰無效，請檢查 config.js 中的 GEMINI_API_KEY');
            } else if (error.message.includes('quota')) {
                throw new Error('API 配額已用盡，請稍後再試');
            }

            throw error;
        }
    },

    /**
     * 呼叫 Gemini Pro Vision (圖片分析)
     * @param {string} prompt - 提示詞
     * @param {string} imageBase64 - Base64 圖片
     * @returns {Promise<string>} 分析結果
     */
    async analyzeImage(prompt, imageBase64) {
        try {
            const response = await fetch(`${this.baseUrl}/gemini-pro-vision:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: imageBase64
                                }
                            }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini Vision Error:', error);
            throw error;
        }
    }
};

// ====================================
// AI 個人化推薦引擎
// ====================================

const AIRecommendation = {
    /**
     * 獲取個人化推薦
     * @param {Array} restaurants - 餐廳列表
     * @returns {Promise<Array>} 推薦餐廳
     */
    async getPersonalizedRecommendations(restaurants) {
        const favorites = FavoritesManager.getFavorites();
        const history = HistoryManager.getHistory(20);

        if (favorites.length === 0 && history.length === 0) {
            return restaurants.slice(0, 5); // 無歷史則返回前5個
        }

        // 分析用戶偏好
        const preferences = this.analyzePreferences(favorites, history);

        // 建立提示詞
        const prompt = `
你是一個餐廳推薦專家。根據用戶的偏好，從以下餐廳中推薦最適合的 5 家。

用戶偏好：
${preferences.summary}

可選餐廳列表：
${restaurants.map((r, i) => `${i + 1}. ${r.name} - ${r.rating}星 - 評論數:${r.reviewCount}`).join('\n')}

請以 JSON 格式返回推薦的餐廳索引（0-based）和推薦理由：
{"recommendations": [{"index": 0, "reason": "推薦理由"}, ...]}
`;

        try {
            const response = await GeminiAI.generateText(prompt);
            const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);

            return result.recommendations.map(rec => ({
                ...restaurants[rec.index],
                aiReason: rec.reason
            }));
        } catch (error) {
            console.error('AI 推薦失敗:', error);
            return restaurants.slice(0, 5);
        }
    },

    /**
     * 分析用戶偏好
     */
    analyzePreferences(favorites, history) {
        const cuisines = new Set();
        let totalRating = 0;
        let ratingCount = 0;

        favorites.forEach(fav => {
            if (fav.priceLevel) totalRating += fav.priceLevel;
            ratingCount++;
        });

        history.forEach(h => {
            if (h.filters.cuisineTypes) {
                h.filters.cuisineTypes.forEach(c => cuisines.add(c));
            }
        });

        return {
            cuisines: Array.from(cuisines),
            avgPrice: ratingCount > 0 ? totalRating / ratingCount : 2,
            favoriteCount: favorites.length,
            summary: `喜好料理：${Array.from(cuisines).join('、') || '未知'}，平均價位：${ratingCount > 0 ? Math.round(totalRating / ratingCount) : 2} 級`
        };
    }
};

// ====================================
// 智慧語音搜尋
// ====================================

const VoiceSearch = {
    recognition: null,

    /**
     * 初始化語音識別
     */
    init() {
        // 支援多種 API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'zh-TW';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            console.log('✅ 語音識別已初始化');
            return true;
        }

        console.warn('⚠️ 瀏覽器不支援語音識別');
        return false;
    },

    /**
     * 開始語音搜尋
     * @param {Function} callback - 回調函數
     */
    start(callback) {
        if (!this.recognition) {
            alert('您的瀏覽器不支援語音識別');
            return;
        }

        this.recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('🎤 語音輸入:', transcript);

            // 用 Gemini 解析語音指令
            const filters = await this.parseVoiceCommand(transcript);
            callback(filters);
        };

        this.recognition.onerror = (event) => {
            console.error('語音識別錯誤:', event.error);
        };

        this.recognition.start();
    },

    /**
     * 解析語音指令
     * @param {string} text - 語音文字
     * @returns {Promise<Object>} 篩選條件
     */
    async parseVoiceCommand(text) {
        console.log('🎤 開始解析語音:', text);

        // 本地關鍵字解析（備用方案）
        const localParse = () => {
            const filters = {
                cuisineTypes: [],
                priceLevels: [],
                minRating: 0,
                distance: '3km',
                timeSlot: 'all'
            };

            // 料理類型關鍵字
            const cuisineMap = {
                '日本': 'japanese', '日式': 'japanese', '壽司': 'japanese', '拉麵': 'japanese',
                '中式': 'chinese', '中餐': 'chinese', '中國': 'chinese',
                '義大利': 'italian', '義式': 'italian', '披薩': 'italian', '義大利麵': 'italian',
                '美式': 'american', '美國': 'american', '漢堡': 'american',
                '韓式': 'korean', '韓國': 'korean', '烤肉': 'korean',
                '泰式': 'thai', '泰國': 'thai',
                '健康': 'healthy', '輕食': 'healthy', '沙拉': 'healthy'
            };

            for (const [keyword, cuisineId] of Object.entries(cuisineMap)) {
                if (text.includes(keyword)) {
                    filters.cuisineTypes.push(cuisineId);
                }
            }

            // 價格關鍵字
            if (text.includes('便宜') || text.includes('經濟') || text.includes('平價')) {
                filters.priceLevels = [1, 2];
            } else if (text.includes('高檔') || text.includes('高級')) {
                filters.priceLevels = [3, 4];
            }

            // 距離關鍵字
            if (text.includes('附近') || text.includes('很近')) {
                filters.distance = '1km';
            } else if (text.includes('遠一點') || text.includes('不限')) {
                filters.distance = '10km';
            }

            // 評分關鍵字
            if (text.includes('高評分') || text.includes('好評')) {
                filters.minRating = 4.5;
            }

            // 時段關鍵字
            if (text.includes('營業中') || text.includes('現在開')) {
                filters.timeSlot = 'open';
            }

            return filters;
        };

        // 先嘗試本地解析
        const localFilters = localParse();
        console.log('本地解析結果:', localFilters);

        // 如果有 Gemini API，嘗試增強解析（但失敗不影響功能）
        if (typeof GeminiAI !== 'undefined' && GeminiAI.apiKey && GeminiAI.apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
            try {
                const prompt = `解析餐廳搜尋指令："${text}"，返回 JSON：{"cuisineTypes":[],"priceLevels":[],"minRating":0,"distance":"3km"}`;
                const response = await GeminiAI.generateText(prompt);
                const aiFilters = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                console.log('AI 增強解析:', aiFilters);
                // 合併本地和 AI 結果
                return { ...localFilters, ...aiFilters };
            } catch (error) {
                console.warn('AI 解析失敗，使用本地解析:', error.message);
            }
        }

        // 返回本地解析結果
        return localFilters;
    }
};

// ====================================
// AI 餐廳問答助手
// ====================================

const AIChatbot = {
    conversationHistory: [],

    /**
     * 發送訊息給 AI
     * @param {string} userMessage - 用戶訊息
     * @param {Array} restaurants - 餐廳列表
     * @returns {Promise<string>} AI 回覆
     */
    async chat(userMessage, restaurants) {
        this.conversationHistory.push({
            role: 'user',
            message: userMessage
        });

        const context = `
你是一個專業的餐廳推薦助手。以下是附近的餐廳資訊：

${restaurants.slice(0, 10).map(r => `- ${r.name}: ${r.rating}星, ${r.reviewCount}則評論, 地址:${r.address}`).join('\n')}

用戶問題：${userMessage}

請提供友善、實用的回答。如果推薦餐廳，請說明推薦理由。
`;

        try {
            const response = await GeminiAI.generateText(context);
            this.conversationHistory.push({
                role: 'assistant',
                message: response
            });
            return response;
        } catch (error) {
            console.error('AI 聊天失敗:', error);
            return '抱歉，我現在無法回答。請稍後再試。';
        }
    },

    /**
     * 清除對話歷史
     */
    clearHistory() {
        this.conversationHistory = [];
    }
};

// ====================================
// AI 圖片識別推薦
// ====================================

const AIImageRecognition = {
    /**
     * 分析食物照片並推薦餐廳
     * @param {File} imageFile - 圖片檔案
     * @returns {Promise<Object>} 識別結果
     */
    async analyzeFoodImage(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64 = e.target.result.split(',')[1];

                const prompt = `
請分析這張食物照片，識別：
1. 料理類型（中式/日式/義式/美式/泰式/韓式等）
2. 主要食材
3. 烹飪方式
4. 適合的用餐場合

以 JSON 格式返回：
{
  "cuisineType": "料理類型",
  "dishName": "菜餚名稱",
  "ingredients": ["食材1", "食材2"],
  "style": "風格描述"
}
`;

                try {
                    const response = await GeminiAI.analyzeImage(prompt, base64);
                    const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsDataURL(imageFile);
        });
    }
};

// ====================================
// 智慧行程規劃
// ====================================

const AITripPlanner = {
    /**
     * 規劃用餐行程
     * @param {Array} itinerary - 行程資訊
     * @param {Array} restaurants - 餐廳列表
     * @returns {Promise<Object>} 行程建議
     */
    async planMealSchedule(itinerary, restaurants) {
        const prompt = `
你是一個行程規劃專家。根據以下行程，安排最佳用餐時間和地點：

行程：
${itinerary.map(item => `${item.time} - ${item.location}: ${item.activity}`).join('\n')}

可選餐廳：
${restaurants.slice(0, 20).map(r => `${r.name} (${r.address})`).join('\n')}

請以 JSON 格式返回建議：
{
  "mealPlan": [
    {"time": "12:00", "meal": "午餐", "restaurant": "餐廳名", "reason": "理由"},
    ...
  ]
}
`;

        try {
            const response = await GeminiAI.generateText(prompt);
            const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return result;
        } catch (error) {
            console.error('行程規劃失敗:', error);
            throw error;
        }
    }
};

// ====================================
// 健康飲食 AI 顧問
// ====================================

const AIHealthAdvisor = {
    userProfile: {
        age: null,
        goals: [], // weight_loss, muscle_gain, balanced
        allergies: [],
        dietType: 'normal' // normal, vegetarian, vegan
    },

    /**
     * 分析餐廳健康度
     * @param {Object} restaurant - 餐廳資訊
     * @returns {Promise<Object>} 健康分析
     */
    async analyzeHealthScore(restaurant) {
        const prompt = `
作為營養師，分析以下餐廳的健康度：

餐廳：${restaurant.name}
類型：${restaurant.type?.join(', ') || '未知'}

評估：
1. 健康評分 (1-10)
2. 營養特點
3. 健康建議

以 JSON 格式返回：
{
  "healthScore": 數字,
  "pros": ["優點1", "優點2"],
  "cons": ["缺點1"],
  "suggestion": "建議"
}
`;

        try {
            const response = await GeminiAI.generateText(prompt);
            const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return result;
        } catch (error) {
            console.error('健康分析失敗:', error);
            return { healthScore: 5, pros: [], cons: [], suggestion: '資料不足' };
        }
    },

    /**
     * 獲取每日飲食建議
     * @param {Array} mealHistory - 用餐歷史
     * @returns {Promise<string>} 建議
     */
    async getDailyAdvice(mealHistory) {
        const prompt = `
根據用戶今日用餐記錄，提供營養建議：

用餐記錄：
${mealHistory.map(m => `${m.time} - ${m.restaurant} (${m.cuisineType})`).join('\n')}

請分析：
1. 營養均衡度
2. 建議改善方向
3. 晚餐推薦類型
`;

        try {
            const response = await GeminiAI.generateText(prompt);
            return response;
        } catch (error) {
            console.error('飲食建議失敗:', error);
            return '建議多攝取蔬菜水果，保持飲食均衡。';
        }
    }
};

// ====================================
// 預測用餐尖峰時段
// ====================================

const AIPeakTimePredictor = {
    /**
     * 預測餐廳忙碌程度
     * @param {Object} restaurant - 餐廳資訊
     * @param {Date} targetTime - 目標時間
     * @returns {Promise<Object>} 預測結果
     */
    async predictBusyTime(restaurant, targetTime) {
        const hour = targetTime.getHours();
        const day = targetTime.getDay(); // 0=週日, 6=週六
        const isWeekend = day === 0 || day === 6;

        const prompt = `
預測餐廳忙碌程度：

餐廳：${restaurant.name}
類型：${restaurant.type?.join(', ')}
評分：${restaurant.rating} (${restaurant.reviewCount}則評論)
時間：${isWeekend ? '週末' : '平日'} ${hour}:00

根據一般餐廳模式，預測此時段的忙碌程度，並以 JSON 格式返回：
{
  "busyLevel": "low/medium/high",  // 忙碌程度
  "waitTime": 數字,                  // 預估等待時間（分鐘）
  "recommendation": "建議",          // 是否建議此時段前往
  "betterTimes": ["時段1", "時段2"]  // 更好的時段
}
`;

        try {
            const response = await GeminiAI.generateText(prompt);
            const result = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return result;
        } catch (error) {
            console.error('預測失敗:', error);
            return { busyLevel: 'medium', waitTime: 15, recommendation: '正常時段', betterTimes: [] };
        }
    }
};

// 匯出所有 AI 模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GeminiAI,
        AIRecommendation,
        VoiceSearch,
        AIChatbot,
        AIImageRecognition,
        AITripPlanner,
        AIHealthAdvisor,
        AIPeakTimePredictor
    };
}
