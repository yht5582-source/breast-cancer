# 乳癌診斷與治療｜互動決策指引

線上版：<https://yht5582-source.github.io/breast-cancer/>

給住院醫師、主治醫師與 MDT 討論用的乳癌臨床教學頁（繁體中文）。單一 `index.html`，不需安裝、不上傳任何病人資料，所有計算都在瀏覽器內完成。

> ⚠️ 教學與討論用途，**不取代**臨床判斷、MDT 決議或健保事前審查。給付條文會變動，申報前請查核健保署最新版。

## 功能

| 分頁 | 內容 |
| --- | --- |
| 總覽 | 決策四步驟：確立診斷 → 分期 → 依亞型治療 → 國際指引／TFDA／健保三層核對 |
| 診斷與分期 | Triple assessment 流程；**分子亞型即時判讀**（ER/PR %、HER2 IHC/ISH），標示 ER-low、HER2-low、IHC 2+ 待 ISH，並提示健保「ER 或 PR >30%」與 T-DXd HER2-low（ER、PR 皆陰性）門檻 |
| 治療決策 | 早期（低風險／高風險／non-pCR／pCR）與轉移性（第一線／二線／多線）× 三亞型 × 特殊狀況（gBRCA、visceral crisis、腦轉移、CKD/透析）。結果分成 **國際（NCCN/ESMO）** 與 **台灣健保** 兩區塊 |
| 健保快速核對 | 早期 HR+/HER2− → **abemaciclib 9.107** 逐項核對；早期 HER2+ → **T-DM1 9.87** 逐項核對（符合／不符／資料不足） |
| 台灣健保 | 第九節乳癌相關條文摘要表（附條號），可搜尋藥名、條號、「擇一」等關鍵字，並列出目前未給付的國際選項 |
| 示範病例 ×6 | 選答 → 正解、臨床解析與健保查核 |
| 分級測驗 ×20 | 住院醫師 10 題、主治醫師 10 題，含解析與得分 |
| 參考文獻 | 健保條文、ESMO、NCCN、ASCO/CAP、關鍵試驗 |

每個分頁有自己的網址（如 `…/breast-cancer/#nhi`），可直接分享。

## 資料來源與核對日期

- 全民健康保險藥品給付規定 **第九節 抗癌瘤藥物（115.9.22 更新版）**，2026-10-28 逐條核對：
  9.18 trastuzumab、9.36.1 everolimus、9.47 lapatinib、9.48 eribulin、9.69 免疫檢查點抑制劑、9.70 pertuzumab、9.72 CDK4/6、9.85 PARP、9.87 T-DM1、9.88 ixabepilone、9.106 sacituzumab govitecan、9.107 abemaciclib、9.112 Phesgo、9.115 T-DXd、9.129 alpelisib、9.130 fulvestrant、9.135 capivasertib
- ESMO Metastatic Breast Cancer CPG（Ann Oncol 2026）、Pan-Asian adapted ESMO Early Breast Cancer（2024）、NCCN Breast Cancer、ASCO/CAP ER/PR（2020）與 HER2（2023）

## 本版修正重點（v2.0，2026-10-28）

- **健保內容更正**：olaparib 早期術後輔助、pembrolizumab 轉移性 TNBC、abemaciclib 轉移性、ribociclib 早期輔助皆**未列於**第九節；abemaciclib 為「手術後 16 個月內開始、使用前內分泌 ≤12 週」；T-DXd HER2-low 限 ER、PR 皆陰性；CDK4/6 終生合計 24 個月、排除 CNS 轉移與「骨為唯一轉移」；免疫治療需 eGFR >60（透析者不符）。
- 轉移性情境改以「治療線別」選擇（原本會出現 pCR／殘餘病灶等不適用選項）；visceral crisis、腦轉移只在轉移性出現。
- 亞型判讀與治療決策改為即時更新；新增 ER-low/PR−/HER2− 近似 TNBC 提示、IHC 0 ultralow 提示。
- 新增 abemaciclib／T-DM1 健保快速核對、條號欄與搜尋計數、分頁網址、列印樣式。
- 測驗以頁內提示取代 `alert()`；病例答案在改選後同步更新。

## 開發

```
index.html   單一頁面（HTML + CSS + JS）
tests.cjs    引擎測試：抽出 index.html 中 /*ENGINE-START*/ … /*ENGINE-END*/ 的 BC 物件
```

```bash
node tests.cjs
```

推送到 `main` 後由 `.github/workflows/pages.yml` 自動部署到 GitHub Pages。

## 授權

MIT（見 `LICENSE`）。
