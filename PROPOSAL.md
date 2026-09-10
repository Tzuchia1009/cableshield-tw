# CableShield-TW｜分級監測與證據查核
更新：2026-09-10 · v0.7.0

## 資料處理與模型架構

![CableShield-TW 海纜風險查核與持續學習架構](./assets/cableshield-architecture-v0.1.svg)

多源資料先轉成可追溯的船舶－海纜－時間窗事件，通過資料品質與 Coverage Gate 後，再由 G1 異常排序及 G2 下一船位模型提供證據。系統每天固定產出 Top-5 查核順位；資料不足時保留原因並安全棄權。人工回饋經標籤升格、時序驗證與核准後，才可更新下一版模型。

[下載向量 PDF](./assets/cableshield-architecture-v0.1.pdf) · [另頁開啟 SVG](./assets/cableshield-architecture-v0.1.svg)

以船舶或匿名接觸事件為單位，依尺寸證據、作業型態及可觀測性調整查核方式。船型不是尺寸；未取得船長或噸位時保留未知。

| 對象 | 監測策略 |
|---|---|
| 大型船 | 核對 AIS、接收覆蓋及跨來源一致性 |
| 中型作業船 | 加入正常漁業、工程作業與環境解釋 |
| 小型近岸船 | 優先考慮岸際連續觀測；免費 SAR 未見目標不代表沒有船 |
| 尺度／身分未知 | 保留匿名接觸紀錄，先確認目標與配對證據 |

AIS 分為有觀測、曾有但缺訊、未取得／裝設未知、其他感測器偵測但未配對。缺訊本身不構成惡意或違法證據。

已完成：歷史 AIS 預覽、四模型訓練與封存證據、三案回溯棄權、人機回饋契約及互動策略預覽。
SAR 已完成影像目錄查詢；影像船舶偵測、雷達、VMS與光學／熱影像均待驗證或介接。策略選項不代表即時觀測。

研究驗證：依尺寸已知／未知、AIS狀態與資料品質分層報告覆蓋、棄權及查核量；取得獨立真值後才報告非AIS偵測效能。人工標籤需經共識與封存驗證後才用於更新模型。

來源與設計依據：
- [ESA 船舶偵測](https://knowledge-hub-gda.esa.int/eo_capability/ship-detection/)
- [Copernicus 資料時效](https://documentation.dataspace.copernicus.eu/FAQ.html)
- [數發部海纜報告](https://moda.gov.tw/press/press-releases/19392)
