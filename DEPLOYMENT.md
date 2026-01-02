# 🚀 GitHub Pages 部署完整指南

## 📋 部署前檢查清單

在開始部署前,請確認:
- ✅ 已有 GitHub 帳號
- ✅ 已建立 repository: `https://github.com/bj7261716/Eat3samll.git`
- ✅ 已有 Google Maps API 金鑰
- ✅ 已閱讀 [API_SECURITY.md](file:///d:/eat3small/API_SECURITY.md) 並了解安全設定
- ✅ 已閱讀 [API_COST_CONTROL.md](file:///d:/eat3small/API_COST_CONTROL.md) 並了解費用控制

---

## 🎯 部署步驟

### 步驟 1: 安裝 Git (如果尚未安裝)

**Windows 使用者:**
1. 下載 Git: https://git-scm.com/download/win
2. 執行安裝程式,使用預設設定即可
3. 開啟 PowerShell 或命令提示字元,輸入 `git --version` 確認安裝成功

### 步驟 2: 初始化 Git Repository

開啟 PowerShell 或命令提示字元,執行以下指令:

```powershell
# 進入專案目錄
cd d:\eat3small

# 初始化 Git repository
git init

# 設定使用者資訊(首次使用 Git 需要設定)
git config --global user.name "你的名字"
git config --global user.email "你的email@example.com"

# 查看目前狀態
git status
```

### 步驟 3: 提交程式碼到本地 Repository

```powershell
# 將所有檔案加入暫存區
git add .

# 提交變更
git commit -m "Initial commit: Eat3Small 智慧美食推薦系統"

# 確認提交成功
git log --oneline
```

### 步驟 4: 連接到 GitHub Remote Repository

```powershell
# 新增遠端 repository
git remote add origin https://github.com/bj7261716/Eat3samll.git

# 確認遠端連接
git remote -v

# 將本地的 master 分支重新命名為 main
git branch -M main
```

### 步驟 5: 推送程式碼到 GitHub

```powershell
# 首次推送,需要設定 upstream
git push -u origin main
```

> [!NOTE]
> 首次推送時,系統可能會要求你登入 GitHub 帳號。請依照提示完成驗證。

### 步驟 6: 在 GitHub 啟用 Pages

1. **前往你的 GitHub Repository**
   - 開啟瀏覽器,前往: `https://github.com/bj7261716/Eat3samll`

2. **進入設定頁面**
   - 點擊 repository 頂部的 `Settings` (設定) 標籤

3. **找到 Pages 設定**
   - 在左側選單中,點擊 `Pages`

4. **設定部署來源**
   - 在 "Source" (來源) 區塊:
     - Branch: 選擇 `main`
     - Folder: 選擇 `/ (root)`
   - 點擊 `Save` (儲存)

5. **等待部署完成**
   - GitHub 會開始自動部署
   - 通常需要 1-3 分鐘
   - 頁面頂部會顯示: "Your site is live at https://bj7261716.github.io/Eat3samll/"

### 步驟 7: 設定 Google Maps API 金鑰限制 ⚠️

> [!WARNING]
> **這是最重要的安全步驟,必須完成!**

1. **前往 Google Cloud Console**
   - 開啟: https://console.cloud.google.com/

2. **選擇你的專案**
   - 在頂部選擇包含 API 金鑰的專案

3. **進入 API 金鑰設定**
   - 左側選單: `API 和服務` → `憑證`
   - 找到你的 API 金鑰,點擊編輯(鉛筆圖示)

4. **設定應用程式限制**
   - 選擇 `HTTP 參照網址 (網站)`
   - 點擊 `新增項目`,加入以下網址:
     ```
     https://bj7261716.github.io/*
     http://localhost:*
     http://127.0.0.1:*
     ```
   - 第一個是正式環境,後兩個是本地開發環境

5. **設定 API 限制**
   - 選擇 `限制金鑰`
   - 勾選以下 API:
     - ✅ Maps JavaScript API
     - ✅ Places API (New)
     - ✅ Geolocation API
   - 點擊 `儲存`

6. **等待設定生效**
   - 設定可能需要 1-5 分鐘才會生效

詳細的安全設定請參考: [API_SECURITY.md](file:///d:/eat3small/API_SECURITY.md)

### 步驟 8: 驗證部署

1. **訪問你的網站**
   - 開啟瀏覽器,前往: `https://bj7261716.github.io/Eat3samll/`

2. **測試功能**
   - ✅ 允許瀏覽器存取地理位置
   - ✅ 確認地圖正常載入
   - ✅ 測試搜尋功能
   - ✅ 測試導航功能

3. **檢查瀏覽器 Console**
   - 按 F12 開啟開發者工具
   - 切換到 Console 標籤
   - 確認沒有 API 金鑰錯誤

---

## 🔄 後續更新流程

當你修改程式碼後,要更新網站:

```powershell
# 1. 查看變更
git status

# 2. 加入變更的檔案
git add .

# 3. 提交變更
git commit -m "描述你的變更內容"

# 4. 推送到 GitHub
git push

# 5. 等待 1-3 分鐘,GitHub Pages 會自動更新
```

---

## 🎨 自訂網域 (選用)

如果你想使用自己的網域名稱(例如: `www.eat3small.com`):

### 步驟 1: 購買網域
- 可以在 GoDaddy、Namecheap、Cloudflare 等平台購買

### 步驟 2: 在 GitHub 設定自訂網域

1. 在 repository 的 `Settings` → `Pages`
2. 在 "Custom domain" 欄位輸入你的網域
3. 點擊 `Save`

### 步驟 3: 設定 DNS

在你的網域提供商設定 DNS 記錄:

**如果使用 www 子網域:**
```
Type: CNAME
Name: www
Value: bj7261716.github.io
```

**如果使用根網域:**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### 步驟 4: 更新 API 金鑰限制

在 Google Cloud Console 的 API 金鑰設定中,新增你的自訂網域:
```
https://www.eat3small.com/*
```

---

## 🐛 疑難排解

### 問題 1: 推送到 GitHub 時要求登入

**解決方法:**
1. 使用 GitHub Personal Access Token (PAT)
2. 前往 GitHub: `Settings` → `Developer settings` → `Personal access tokens` → `Tokens (classic)`
3. 點擊 `Generate new token (classic)`
4. 勾選 `repo` 權限
5. 複製產生的 token
6. 在推送時,使用 token 作為密碼

### 問題 2: GitHub Pages 顯示 404

**可能原因:**
- 分支選擇錯誤 → 確認選擇 `main` 分支
- 資料夾選擇錯誤 → 確認選擇 `/ (root)`
- 檔案名稱錯誤 → 確認主頁面是 `index.html`

### 問題 3: 地圖無法載入

**檢查項目:**
1. 開啟瀏覽器 Console (F12),查看錯誤訊息
2. 確認 API 金鑰已正確設定在 `js/config.js`
3. 確認已在 Google Cloud Console 啟用必要的 API
4. 確認 API 金鑰的網址限制包含你的 GitHub Pages 網址
5. 等待 5 分鐘讓 API 金鑰限制設定生效

### 問題 4: API 金鑰錯誤

**常見錯誤訊息:**

**"This API key is not authorized to use this service or API"**
- 原因: API 金鑰的網址限制不包含當前網址
- 解決: 在 Google Cloud Console 新增 `https://bj7261716.github.io/*`

**"This API project is not authorized to use this API"**
- 原因: 未啟用對應的 API
- 解決: 在 Google Cloud Console 啟用 Maps JavaScript API 和 Places API

**"The provided API key is invalid"**
- 原因: API 金鑰錯誤或已刪除
- 解決: 檢查 `js/config.js` 中的 API 金鑰是否正確

### 問題 5: 地理位置無法取得

**解決方法:**
1. 確認瀏覽器已允許地理位置權限
2. GitHub Pages 使用 HTTPS,地理位置 API 才能正常運作
3. 如果使用 VPN,可能會影響定位準確度

---

## 📊 監控部署狀態

### 查看部署歷史

1. 前往你的 GitHub Repository
2. 點擊 `Actions` 標籤
3. 可以看到每次推送的部署狀態

### 查看網站流量 (選用)

可以整合 Google Analytics:

1. 在 Google Analytics 建立帳號和屬性
2. 取得追蹤 ID
3. 在 `index.html` 的 `<head>` 區塊加入追蹤程式碼

---

## 🎉 完成!

恭喜!你的網站現在已經上線了!

**你的網站網址:** https://bj7261716.github.io/Eat3samll/

**下一步:**
1. ✅ 閱讀 [API_COST_CONTROL.md](file:///d:/eat3small/API_COST_CONTROL.md) 設定費用控制
2. ✅ 設定 Google Cloud 帳單警示
3. ✅ 定期檢查 API 使用量
4. ✅ 分享你的網站給朋友!

**需要幫助?**
- 查看 [API_SECURITY.md](file:///d:/eat3small/API_SECURITY.md) 了解安全設定
- 查看 [README.md](file:///d:/eat3small/README.md) 了解專案功能
- 查看 [TESTING.md](file:///d:/eat3small/TESTING.md) 了解測試方法
