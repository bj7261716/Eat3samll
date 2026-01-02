# 🍽️ 智慧美食推薦與導航系統

一個智慧型網頁應用程式，幫助您快速找到符合個人偏好的餐廳，並提供無縫導航體驗。

> [!NOTE]
> **🚀 線上部署版本:** https://bj7261716.github.io/Eat3samll/

## 📚 重要文件

- **[部署指南 (DEPLOYMENT.md)](DEPLOYMENT.md)** - GitHub Pages 完整部署步驟
- **[API 安全設定 (API_SECURITY.md)](API_SECURITY.md)** - Google Maps API 金鑰安全配置
- **[費用控制 (API_COST_CONTROL.md)](API_COST_CONTROL.md)** - API 收費機制與成本控制

---

## ✨ 功能特色

### 🔍 智慧搜尋
- **多維度篩選**：料理類型、價格區間、距離、營業時段
- **即時篩選**：目前營業中、午餐時段、晚餐時段
- **智慧推薦**：每次推薦 3-5 家最符合條件的餐廳

### 🗺️ 視覺化呈現
- **雙模式切換**：列表視圖與地圖視圖自由切換
- **互動地圖**：在 Google Maps 上標示所有推薦餐廳
- **詳細資訊**：餐廳名稱、類型、價位、距離、評分、營業狀態

### 🧭 一鍵導航
- **無縫整合**：自動開啟裝置內建地圖應用（Google Maps / Apple Maps）
- **即時導航**：直接啟動前往餐廳的導航模式

### 📱 響應式設計
- **跨裝置支援**：完美適配手機、平板、桌上型電腦
- **現代化介面**：流暢動畫、精美視覺設計
- **優化體驗**：載入快速、操作直覺

## 🚀 快速開始

### 前置需求

1. **現代化瀏覽器**（Chrome、Firefox、Safari、Edge 最新版）
2. **Google Maps API 金鑰**（請參考下方申請指南）

> [!IMPORTANT]
> **部署到 GitHub Pages?** 請參考 [DEPLOYMENT.md](DEPLOYMENT.md) 完整部署指南

### 安裝步驟

1. **下載專案**
   ```bash
   # 如果是從 Git clone
   git clone <repository-url>
   cd eat3small
   ```

2. **設定 API 金鑰**
   - 開啟 `js/config.js`
   - 將您的 Google Maps API 金鑰填入 `GOOGLE_MAPS_API_KEY` 欄位

3. **啟動應用程式**
   
   由於應用程式需要使用 Geolocation API，建議使用本地伺服器執行：

   **方法 1：使用 Python（推薦）**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # 然後在瀏覽器開啟 http://localhost:8000
   ```

   **方法 2：使用 Node.js**
   ```bash
   npx -y http-server -p 8000
   
   # 然後在瀏覽器開啟 http://localhost:8000
   ```

   **方法 3：使用 VS Code Live Server**
   - 安裝 Live Server 擴充功能
   - 右鍵點擊 `index.html` → "Open with Live Server"

## 🔑 Google Maps API 金鑰申請指南

### 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 登入您的 Google 帳號
3. 點擊頂部導航列的專案下拉選單
4. 點擊「新增專案」
5. 輸入專案名稱（例如：「Eat3Small」）
6. 點擊「建立」

### 步驟 2：啟用必要的 API

1. 在 Cloud Console 左側選單，點擊「API 和服務」→「資料庫」
2. 點擊「+ 啟用 API 和服務」
3. 搜尋並啟用以下 API：
   - **Maps JavaScript API**（必要）
   - **Places API (New)**（必要）
   - **Geolocation API**（必要）
   - **Geocoding API**（選用，用於地址解析）

### 步驟 3：建立 API 金鑰

1. 在左側選單點擊「API 和服務」→「憑證」
2. 點擊「+ 建立憑證」→「API 金鑰」
3. 系統會建立並顯示您的 API 金鑰
4. **重要**：點擊「限制金鑰」進行安全設定

### 步驟 4：設定 API 金鑰限制（重要！）

為了安全性，請務必設定金鑰限制：

1. **應用程式限制**：
   - 選擇「HTTP 參照網址（網站）」
   - 新增網站限制：
     - 開發環境：`http://localhost:*`
     - 正式環境：`https://yourdomain.com/*`（替換為您的網域）

2. **API 限制**：
   - 選擇「限制金鑰」
   - 勾選：
     - Maps JavaScript API
     - Places API (New)
     - Geolocation API
     - Geocoding API（如有啟用）

3. 點擊「儲存」

### 步驟 5：設定帳單帳戶（必要）

Google Maps Platform 需要啟用帳單功能，但提供新用戶優惠：

1. **免費額度**：每月 $200 美元免費額度
2. **使用量監控**：建議設定用量上限警示
3. 在 Cloud Console 中，點擊「帳單」→「帳戶管理」
4. 按照指示設定信用卡資訊

**費用說明**：
- Maps JavaScript API：每 1,000 次載入 $7 美元（超過免費額度後）
- Places API：每 1,000 次請求約 $17-32 美元（依功能而定）
- 對於個人專案，通常每月免費額度足夠使用

### 步驟 6：複製 API 金鑰

1. 複製您的 API 金鑰
2. 開啟專案中的 `js/config.js`
3. 將金鑰貼入：
   ```javascript
   const GOOGLE_MAPS_API_KEY = '您的-API-金鑰-在這裡';
   ```

### 疑難排解

**問題：地圖無法載入**
- 檢查 API 金鑰是否正確填入
- 確認已啟用 Maps JavaScript API
- 檢查瀏覽器控制台是否有錯誤訊息
- 確認網站限制是否包含您的網域

**問題：找不到餐廳**
- 確認已啟用 Places API (New)
- 檢查是否已授予瀏覽器地理位置權限
- 確認您的位置在台灣地區（本應用預設區域）

**問題：API 配額超過**
- 在 Cloud Console 中查看「API 和服務」→「配額」
- 考慮增加預算或優化 API 呼叫次數

## 🛠️ 技術架構

### 前端技術棧
- **HTML5**：語義化結構
- **CSS3**：現代化設計、響應式布局、動畫效果
- **Vanilla JavaScript**：無框架依賴，純 JS 實作
- **Google Maps Platform**：地圖與地點服務

### 專案結構
```
eat3small/
├── index.html              # 主頁面
├── css/
│   ├── variables.css       # CSS 變數與設計系統
│   ├── base.css           # 基礎樣式
│   ├── components.css     # 元件樣式
│   └── main.css           # 主要布局
├── js/
│   ├── config.js          # API 金鑰配置
│   ├── geolocation.js     # 地理位置服務
│   ├── places.js          # 餐廳搜尋邏輯
│   ├── map.js             # 地圖功能
│   ├── ui.js              # UI 渲染
│   ├── storage.js         # 本地儲存
│   └── main.js            # 應用進入點
├── assets/
│   └── icons/             # 圖示資源
└── README.md              # 專案說明
```

## 📖 使用說明

1. **允許地理位置存取**：首次使用時，瀏覽器會請求地理位置權限，請點擊「允許」
2. **設定搜尋條件**：選擇料理類型、價格區間、距離、營業時段
3. **執行搜尋**：點擊「搜尋美食」按鈕
4. **瀏覽結果**：在列表或地圖模式中檢視推薦餐廳
5. **選擇餐廳**：點擊「導航」按鈕前往目的地

## 🎨 設計特色

- **現代化配色**：精心挑選的漸層色彩系統
- **流暢動畫**：微動畫提升使用者體驗
- **直覺操作**：簡化流程，減少點擊次數
- **視覺回饋**：即時載入狀態與互動回饋

## 🔐 隱私與安全

- **地理位置**：僅在本地處理，不會傳送至外部伺服器
- **使用者資料**：偏好設定儲存於瀏覽器本地（localStorage）
- **API 金鑰**：請務必設定網域限制，避免濫用

## 📝 待開發功能

- [ ] 使用者帳號系統
- [ ] 餐廳收藏功能
- [ ] 搜尋歷史記錄
- [ ] 熱門推薦演算法
- [ ] PWA 離線支援
- [ ] 社群評論功能

## 🤝 貢獻

歡迎提出建議或回報問題！

## 📄 授權

本專案僅供學習與個人使用。

---

**開發者備註**：
- 本應用使用 Google Maps Platform，請遵守 [Google Maps Platform 服務條款](https://cloud.google.com/maps-platform/terms)
- 建議定期檢查 API 使用量，避免超出免費額度
- 正式部署前，請務必設定 API 金鑰的網域限制

**享受尋找美食的樂趣！** 🎉
