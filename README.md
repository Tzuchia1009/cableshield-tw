# CableShield-TW 公開展示說明

更新：2026-09-23 · v1.0。正式題名為「海纜近接事件資料可判性與查核排序系統」；英文為 *CableShield-TW: Evidence Readiness and Triage for Subsea Cable Encounters*。

公開頁展示匿名、概化的歷史 AIS 樣本、公開概化海纜路由及合成情境。它不是即時船位、正式警報或事故判定工具。地圖中的公開樣本不附個體查核分數；模型頁呈現離線彙總證據。既有本機查核筆記程式僅為資料契約演練，未納入本屆公開操作、人工驗證或模型回訓。

| 研究模組 | 輸出 |
|---|---|
| CableScope | 5 公里近纜候選工作量；最近海纜分析事件。兩者分母不同。 |
| CableCheck | 建模門檻及未通過原因。 |
| CableRank | 規則、Isolation Forest、自編碼器的順位與模型分歧。 |
| CableTrack | 物理外推與 GRU 的獨立下一船位比較，不接入 CableRank。 |
| CableEvidence | 事件、品質、排序、缺口及來源版本欄位。 |

工作量統計在 1,094 個有效日期形成 674,710 筆候選，日中位數 656.5，約 657 筆。最近海纜分析事件有 651,729 筆，其中 23,690 筆（3.6%）符合原模型納入門檻，628,039 筆保留補證原因。九組替代門檻的條件通過率為1.0%至9.9%；547,490筆（84.0%）5公里事件只有單點，無法重建事件內時序。替代門檻未重算特徵或重訓模型。**657 與 3.6% 不能相乘。**

本屆實際使用的 NODASS 資料為 2023–2025 年 AIS；外部公開概化路由僅用於一致的近接研究，並非實際纜位。半合成測試不等於事故準確率；K=5 為競賽人力情境，未經值勤單位確認。未執行人工使用者驗證、未以人工回饋重訓，亦未完成國家海洋研究院正式介接。

[提案與研究結論](./PROPOSAL.md) · [系統流程圖 PDF](./assets/cableshield_evidence_readiness_flow_v0.9.pdf) · [CableRank 模型架構圖 PDF](./assets/cableshield_model_architecture_v1.0.pdf) · [模型圖可編輯 LaTeX 原始檔](./assets/editable/cableshield_model_architecture_v1.0.tex)。
