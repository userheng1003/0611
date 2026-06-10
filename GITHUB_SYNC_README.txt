GitHub 同步功能已加入

使用方式：
1. 到 GitHub 建立 Fine-grained token：
   Settings → Developer settings → Fine-grained tokens → Generate new token
2. Repository access 選你的網站 repo。
3. Permissions 只開 Contents: Read and write。
4. 打開網站後台 admin.html。
5. 在 GitHub 同步區輸入：
   Repo：例如 userheng1003/TEST
   Branch：main
   Token：你的 fine-grained token
6. 按「推送到 GitHub」。

注意：
- 這個功能同步的是 localStorage 編輯資料到 data/site-data.json。
- GitHub Pages 部署後，其他電腦會從 data/site-data.json 讀取資料。
- Token 不會寫入網站檔案，但會保存在你這台瀏覽器，公共電腦不要使用。
