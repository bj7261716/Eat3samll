# 🔐 Google Maps API 安全設定完整指南

## ⚠️ 為什麼 API 安全很重要?

當你的網站部署到 GitHub Pages 後,任何人都可以查看你的網頁原始碼,包括 `js/config.js` 中的 API 金鑰。

**如果不設定限制,可能發生:**
- 🚨 其他人複製你的 API 金鑰用在他們的網站
- 💸 產生大量 API 請求,導致高額費用
- 🔒 API 金鑰被濫用或攻擊

**解決方法:** 設定 API 金鑰限制,讓金鑰只能在你的網站上使用!

---

## 🛡️ API 金鑰限制設定 (必做!)

### 步驟 1: 前往 Google Cloud Console

1. 開啟瀏覽器,前往: https://console.cloud.google.com/
2. 登入你的 Google 帳號
3. 在頂部選擇你的專案

### 步驟 2: 找到 API 金鑰

1. 點擊左側選單 ☰
2. 選擇 `API 和服務` → `憑證`
3. 在 "API 金鑰" 區塊,找到你的金鑰
4. 點擊金鑰名稱或右側的編輯圖示 ✏️

### 步驟 3: 設定應用程式限制

在 "應用程式限制" 區塊:

1. **選擇限制類型:**
   - ⚪ 無 (不建議)
   - 🔘 **HTTP 參照網址 (網站)** ← 選這個!
   - ⚪ IP 位址
   - ⚪ Android 應用程式
   - ⚪ iOS 應用程式

2. **新增允許的網站:**
   
   點擊 `新增項目`,依序加入以下網址:

   ```
   https://bj7261716.github.io/*
   ```
   這是你的 GitHub Pages 網址,`/*` 表示允許所有子頁面

   **本地開發環境 (建議加入):**
   ```
   http://localhost:*
   http://127.0.0.1:*
   ```
   這樣在本地測試時也能使用 API

   **如果有自訂網域:**
   ```
   https://www.yourdomain.com/*
   ```

3. **完成後應該有這些項目:**
   ```
   ✅ https://bj7261716.github.io/*
   ✅ http://localhost:*
   ✅ http://127.0.0.1:*
   ```

### 步驟 4: 設定 API 限制

在 "API 限制" 區塊:

1. **選擇限制類型:**
   - ⚪ 不限制金鑰 (不建議)
   - 🔘 **限制金鑰** ← 選這個!

2. **選擇允許的 API:**
   
   在下拉選單中,勾選以下 API:
   
   ```
   ✅ Maps JavaScript API
   ✅ Places API (New)
   ✅ Geolocation API
   ```

   > [!TIP]
   > 只勾選你實際使用的 API,不要勾選不需要的,這樣更安全!

3. **確認已啟用這些 API:**
   
   如果某個 API 無法勾選,表示尚未啟用。請先到 `API 和服務` → `程式庫` 中啟用。

### 步驟 5: 儲存設定

1. 點擊頁面底部的 `儲存` 按鈕
2. 等待 1-5 分鐘讓設定生效
3. 設定生效後,只有從允許的網址發出的請求才能使用此 API 金鑰

---

## ✅ 驗證設定是否生效

### 測試 1: 從允許的網址訪問 (應該成功)

1. 開啟瀏覽器,前往: `https://bj7261716.github.io/Eat3samll/`
2. 允許地理位置權限
3. 地圖應該正常載入
4. 搜尋功能應該正常運作

### 測試 2: 檢查 Console 是否有錯誤

1. 按 `F12` 開啟開發者工具
2. 切換到 `Console` 標籤
3. 重新整理頁面
4. **不應該**看到以下錯誤:
   - ❌ "This API key is not authorized to use this service"
   - ❌ "RefererNotAllowedMapError"

### 測試 3: 從其他網址訪問 (應該失敗)

如果有人試圖從未授權的網址使用你的 API 金鑰,應該會看到錯誤訊息。

---

## 🔒 其他安全最佳實踐

### 1. 定期輪換 API 金鑰

建議每 3-6 個月更換一次 API 金鑰:

1. 在 Google Cloud Console 建立新的 API 金鑰
2. 設定相同的限制
3. 更新 `js/config.js` 中的金鑰
4. 推送更新到 GitHub
5. 確認新金鑰正常運作後,刪除舊金鑰

### 2. 不要將 API 金鑰提交到公開的 Git Repository

雖然我們已經設定了限制,但最佳實踐是:

**方法 1: 使用環境變數 (進階)**
- 使用 GitHub Secrets 儲存 API 金鑰
- 在部署時動態注入金鑰

**方法 2: 使用 .gitignore (本專案採用)**
- 將 `js/config.js` 加入 `.gitignore`
- 提供 `js/config.example.js` 作為範本
- 使用者需要自行建立 `js/config.js` 並填入金鑰

> [!NOTE]
> 對於純前端專案,API 金鑰無法完全隱藏,因此設定限制是最重要的安全措施!

### 3. 監控 API 使用量

定期檢查 API 使用情況:

1. 前往 Google Cloud Console
2. 選擇 `API 和服務` → `資訊主頁`
3. 查看 API 請求次數
4. 如果發現異常流量,立即檢查並更換金鑰

### 4. 設定使用配額

限制每日 API 請求次數,防止濫用:

1. 前往 `API 和服務` → `已啟用的 API 和服務`
2. 點擊 `Maps JavaScript API`
3. 點擊 `配額`
4. 設定每日請求上限 (例如: 1,000 次/天)

詳細設定請參考: [API_COST_CONTROL.md](file:///d:/eat3small/API_COST_CONTROL.md)

---

## 🚨 常見安全問題與解決方案

### 問題 1: "RefererNotAllowedMapError"

**錯誤訊息:**
```
Google Maps JavaScript API error: RefererNotAllowedMapError
```

**原因:**
- API 金鑰的 HTTP 參照網址限制不包含當前網址

**解決方法:**
1. 檢查當前網址 (例如: `https://bj7261716.github.io/Eat3samll/`)
2. 前往 Google Cloud Console
3. 確認 API 金鑰限制中包含: `https://bj7261716.github.io/*`
4. 注意大小寫要完全一致
5. 儲存後等待 1-5 分鐘

### 問題 2: "ApiNotActivatedMapError"

**錯誤訊息:**
```
Google Maps JavaScript API error: ApiNotActivatedMapError
```

**原因:**
- API 金鑰的 API 限制中未包含 Maps JavaScript API

**解決方法:**
1. 前往 Google Cloud Console → `API 和服務` → `憑證`
2. 編輯 API 金鑰
3. 在 "API 限制" 中勾選 `Maps JavaScript API`
4. 儲存設定

### 問題 3: 本地開發時無法使用 API

**原因:**
- API 金鑰限制中未包含 localhost

**解決方法:**
在 HTTP 參照網址中加入:
```
http://localhost:*
http://127.0.0.1:*
```

### 問題 4: API 金鑰被盜用

**症狀:**
- API 使用量異常增加
- 收到高額帳單警示

**立即處理:**
1. 前往 Google Cloud Console
2. **立即停用**被盜用的 API 金鑰
3. 建立新的 API 金鑰並設定嚴格限制
4. 更新網站中的 API 金鑰
5. 檢查帳單並聯絡 Google 支援

**預防措施:**
- 務必設定 HTTP 參照網址限制
- 定期檢查 API 使用量
- 設定帳單警示

---

## 📋 安全檢查清單

部署前請確認:

```
✅ 已設定 HTTP 參照網址限制
✅ 已設定 API 限制 (只允許必要的 API)
✅ 已測試從允許的網址可以正常使用
✅ 已設定帳單警示 (參考 API_COST_CONTROL.md)
✅ 已設定每日請求配額上限
✅ 已了解如何監控 API 使用量
✅ 已了解如何處理金鑰被盜用的情況
```

---

## 🔗 相關資源

- **Google Maps Platform 安全最佳實踐:**
  https://developers.google.com/maps/api-security-best-practices

- **API 金鑰限制說明:**
  https://cloud.google.com/docs/authentication/api-keys

- **費用控制指南:**
  [API_COST_CONTROL.md](file:///d:/eat3small/API_COST_CONTROL.md)

---

## 💡 重要提醒

> [!WARNING]
> **即使設定了所有限制,API 金鑰仍然會在前端程式碼中可見。**
> 
> 這是純前端應用的限制。最重要的是:
> 1. ✅ 設定嚴格的 HTTP 參照網址限制
> 2. ✅ 設定 API 範圍限制
> 3. ✅ 設定使用配額和帳單警示
> 4. ✅ 定期監控使用量
> 
> 這樣即使金鑰被看到,也無法在其他網站上使用!

**保持警覺,定期檢查,確保 API 安全!** 🛡️
