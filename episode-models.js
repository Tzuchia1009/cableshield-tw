// Public aggregates only. Never score coarse public map observations.
const names={rule:'可解釋加權規則',isolation:'Isolation Forest',autoencoder:'自編碼器',ensemble:'三者等權組合'};
const n=x=>Number(x).toLocaleString('en-US');
const f=x=>Number(x).toFixed(3);
const ci=x=>x.map(f).join('–');
let cached;
export async function openEpisodeModelDialog(dialog,toast){
  try{
    if(!cached){const response=await fetch('./data/episode-model-results.json');if(!response.ok)throw new Error('模型摘要無法載入');cached=await response.json();}
    const s=cached;
    if(s.contract_version!=='episode-rank-1.0.0')throw new Error('模型資料版本不符');
    const primary=s.seed_results[0],stress=primary.stress.methods,p=s.population;
    dialog('接近片段模型與查核排序',
      `<div class="model-hero"><div><span class="status-pill">2026.09.26 · 片段模型已重訓</span><h3>每一個接近片段，<br>都有自己的排序與證據。</h3><p>2023 年訓練、2024 年驗證、2025 年跨年度回溯測試。片段資料、特徵前處理、森林、自編碼器與百分位參照均重新建立。</p></div><div class="model-orbit" aria-label="規則、森林、自編碼器組合為 Top-K"><span>規則</span><span>IF</span><span>AE</span><b>Top<br>K</b></div></div>
      <div class="model-numbers"><div><strong>${n(p.episodes)}</strong><small>接近片段</small></div><div><strong>${n(p.model_eligible)}</strong><small>已計算模型分數的片段</small></div><div><strong>${(100*p.model_eligible/p.episodes).toFixed(2)}%</strong><small>符合模型觀測門檻</small></div><div><strong>${n(p.repeat_not_model_eligible)}</strong><small>未進模型仍保留的返回片段</small></div></div>
      <div class="split-ribbon">${Object.entries(s.eligible_by_year).map(([y,count])=>`<div><span>${y==='2023'?'訓練':y==='2024'?'驗證':'跨年度回溯測試'}</span><b>${y}</b><small>${n(count)} 個片段</small></div>`).join('')}</div>
      <div class="model-boundary"><strong>先分時間，再建立模型</strong><p>2023 年 1–10 月擬合內部前處理與訓練，11–12 月選擇訓練輪數；跨越分界的 12 段不納入內部選輪。之後以完整 2023 年重建前處理與最終模型。2024、2025 年不參與擬合。2025 年曾在資料重建時檢視，因此標為回溯測試。</p></div>
      <div class="model-portfolio"><article><span>A · 明確條件</span><h3>可解釋加權規則</h3><p>距纜、低速、AIS 錨泊狀態、轉向與低速觀測跨度。權重為 0.30、0.25、0.15、0.15、0.15。</p></article><article><span>B · 常態偏離</span><h3>Isolation Forest</h3><p>18 維特徵、300 棵樹。重新學習 2023 年接近片段的特徵分布。</p></article><article><span>C · 重建誤差</span><h3>自編碼器</h3><p>18 → 32 → 16 → 6 → 16 → 32 → 18；2,488 個參數。三組種子各訓練 80 輪。</p></article></div>
      <p><strong>S = (P規則 + P森林 + P自編碼器) / 3</strong>。百分位以 2023 年片段分數為參照。各方法保留原始分數及順位；同分時依片段識別碼固定排序。</p>
      <div class="model-section-head"><span>DAILY TOP-K</span><h3>查核名額改變，清單也跟著改變</h3></div>
      <p>每日以片段「最後觀測日」歸檔，同船同纜的多段不合併。這是離線回溯清單，未驗證即時結束判定或告警延遲。公開頁只展示彙總，不發布個體分數。</p>
      <label>年度 <select id="episodeModelYear"><option>2024</option><option selected>2025</option><option>2023</option></select></label>
      <label>每日查核量能 K <select id="episodeModelK"><option>1</option><option>3</option><option selected>5</option><option>10</option></select></label>
      <p id="episodeTopKCount" aria-live="polite"></p><div class="metric-table-wrap"><table class="metric-table"><thead><tr><th>方法配對</th><th>整體 Spearman</th><th>每日 Top-K Jaccard</th><th>95% 區間</th></tr></thead><tbody id="episodeAgreementRows"></tbody></table></div>
      <p class="case-policy">Jaccard 以片段識別碼計算；不足 K 段時保留全部。只納入當年有合格片段的日期；區間採 300 次按日重抽樣，未校正跨日自相關。K 由實際查核量能設定。</p>
      <div class="model-section-head"><span>FEATURE PERTURBATION</span><h3>測量指定特徵變化的敏感度</h3></div>
      <p>2024 年 4,000 個片段、1,183 艘船，依片段識別碼配對。擾動目標只取自 2023 年；以下是特徵層級合成測試，沒有真實事故標籤，亦非完整航跡模擬。</p>
      <div class="metric-table-wrap"><table class="metric-table"><thead><tr><th>方法</th><th>AUROC（95% 區間）</th><th>配對分數提升率</th></tr></thead><tbody>${Object.entries(stress).map(([name,m])=>`<tr><td>${names[name]}</td><td>${f(m.auroc)}（${ci(m.auroc_ci95)}）</td><td>${(m.paired_uplift*100).toFixed(2)}%</td></tr>`).join('')}</tbody></table></div>
      <p class="case-policy">區間以船舶群組重抽樣 300 次。擾動與規則使用相近特徵，對規則有設計上的有利條件；規則 AUROC 接近 1 不能解讀為事故辨識率。</p>
      <div class="research-grid"><article class="research-card"><span class="research-tag">種子敏感度</span><h3>保留訓練變異</h3><p>三組種子之森林擾動 AUROC 為 0.988–0.992，自編碼器為 0.976–0.983。相對主種子，2025 年組合順位相關為 0.954 與 0.965，未挑選最好的一次結果。</p></article><article class="research-card"><span class="research-tag">跨區域補充檢查</span><h3>地理轉移仍有限制</h3><p>南側 2023 年 901 段訓練，北側 2024 年 11,942 段且排除已見船舶，保留 20 公里緩衝。4,000 段特徵擾動的森林／自編碼器 AUROC 為 0.755／0.804；不可由同區跨年結果宣稱跨區域事故辨識能力。</p></article></div>
      <div class="model-boundary"><strong>證據與人工監督</strong><p>699,868 段均保留品質、前次片段、返回與缺口資訊；模型僅對合格片段給分。16,563 個不合格返回片段仍進入獨立查核路徑。模型分數只供查核排序，不代表事故發生機率；事故認定、責任與處置由人員依正式程序決定。</p></div>
      <details><summary>獨立延伸研究 CableTrack</summary><p>既有 GRU 航跡預測與物理外推比較仍為獨立研究，未參與片段排序。本次重訓範圍為 CableRank；未以人工回饋回訓，亦未完成正式勤務或機關介接驗證。</p></details>
      <div class="model-downloads"><button class="button" id="downloadEpisodeModels">下載片段模型公開證據</button></div>`);
    const render=()=>{const y=document.getElementById('episodeModelYear').value,k=Number(document.getElementById('episodeModelK').value),d=s.daily_lists[y];document.getElementById('episodeTopKCount').textContent=`${y} 年有 ${n(d.days_with_eligible)} 日具合格片段；每種方法共選出 ${n(d['ensemble_top'+k])} 個片段名額。`;document.getElementById('episodeAgreementRows').innerHTML=s.agreement[y].filter(a=>a.k===k).map(a=>`<tr><td>${names[a.a]}／${names[a.b]}</td><td>${f(a.spearman)}</td><td>${f(a.mean)}</td><td>${ci(a.ci95)}</td></tr>`).join('');};
    document.getElementById('episodeModelYear').onchange=render;document.getElementById('episodeModelK').onchange=render;render();
    document.getElementById('downloadEpisodeModels').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(s,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='CableShield-片段模型公開證據.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  }catch(error){toast(error.message||'片段模型證據暫時無法載入');}
}
