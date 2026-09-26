// Independent v2 evidence view: never infer episodes from coarse public map fixes.
const examples={
  returns:{name:'同日三次接近', distances:[4,7,4,7,4],hours:[0,1,2,3,4],expected:3},
  jitter:{name:'邊界附近擺動',distances:[4.9,5.1,4.8,5.3,4.9],hours:[0,1,2,3,4],expected:1},
  gap:{name:'缺訊後再次出現',distances:[4,4],hours:[0,10],expected:2},
  midnight:{name:'跨午夜持續接近',distances:[4,4,4],hours:[0,1,2],expected:1},
};
export function segmentExample(distances,hours){
  let active=false,hadEpisode=false,episode=0,returns=0;const rows=[];
  distances.forEach((d,i)=>{
    const gap=i>0 && hours[i]-hours[i-1]>6;
    if(gap){active=false;hadEpisode=false;}
    let status=d>6?'走廊外觀測':active?'同一接近片段':'緩衝帶';
    if(d>6){active=false;}
    else if(d<=5&&!active){episode++;active=true;status=hadEpisode?'有離開證據的返回':gap?'缺口後新片段，返回待確認':'首次觀測接近';if(hadEpisode)returns++;hadEpisode=true;}
    rows.push({hour:hours[i],distance:d,episode:active?episode:null,status});
  });
  return {episodes:episode,returns,rows};
}
const fmt=n=>Number(n).toLocaleString('en-US');
async function mount(){
  const root=document.getElementById('episodesV2');if(!root)return;
  root.innerHTML=`<div class="episode-heading"><div><span class="eyebrow">V2 · 接近片段與返回證據</span><h2>同一天反覆接近，每一段都留下來</h2></div><span>每日彙總只供工作量統計</span></div>
  <p>以每艘船、每條海纜各自切分連續觀測。進入 5 公里內建立片段，觀測到超過 6 公里才記錄離開；跨午夜不拆段。超過 6 小時缺口或異常定位中斷證據鏈，不直接推定離開或返回。</p>
  <div id="episodeMetrics" role="status">正在讀取三年重算摘要…</div>
  <div class="episode-demo"><label for="episodeScenario">檢查切分方式（合成案例）</label> <select id="episodeScenario">${Object.entries(examples).map(([id,e])=>`<option value="${id}">${e.name}</option>`).join('')}</select><p id="episodeExampleSummary" aria-live="polite"></p><div class="episode-table-wrap"><table><thead><tr><th>觀測時間</th><th>距示意路由</th><th>片段</th><th>證據狀態</th></tr></thead><tbody id="episodeRows"></tbody></table></div></div>
  <p class="episode-note"><strong>兩條查核路徑：</strong>有觀測支持的返回進入「重複接近查核」；缺口後再出現進入「補證查核」。即使片段未通過模型品質門檻，也保留這兩種訊號。重複接近是查核線索，正常作業或往返航行亦可能造成此現象。</p>
  <p class="episode-note">統計來自受控原始觀測重算；地圖中的 6 小時／0.05 度公開樣本無法用來重建返回次數。距離以 EPSG:3826 計算，時間暫按臺灣時間，海纜為概化示意路由。下方舊模型證據保留 v1 日彙總口徑；尚未重訓 v2 模型，不將舊分數套到新片段。</p>
  <button class="button" id="episodeExport">匯出 v2 統計與口徑</button>`;
  const render=()=>{const key=document.getElementById('episodeScenario').value,e=examples[key],r=segmentExample(e.distances,e.hours);document.getElementById('episodeExampleSummary').textContent=`${r.episodes} 個接近片段；${r.returns} 次有離開證據的返回。${key==='gap'?'兩段之間缺訊，不能宣稱反覆進出。':key==='midnight'?'23:00 至翌日 01:00 仍為同一片段。':''}`;document.getElementById('episodeRows').innerHTML=r.rows.map(row=>`<tr><td>${key==='midnight'?(row.hour===0?'當日 23:00':`翌日 0${row.hour-1}:00`):`第 ${row.hour} 小時`}</td><td>${row.distance} 公里</td><td>${row.episode===null?'—':`片段 ${row.episode}`}</td><td>${row.status}</td></tr>`).join('');};
  document.getElementById('episodeScenario').addEventListener('change',render);render();
  let evidence=null;
  try{const response=await fetch('./data/episode-v2-summary.json');if(!response.ok)throw new Error('摘要讀取失敗');evidence=await response.json();
    document.getElementById('episodeMetrics').innerHTML=`<div class="episode-metrics"><article><b>${fmt(evidence.episodes)}</b><span>接近片段</span></article><article><b>${fmt(evidence.multi_episode_days)}</b><span>同船同纜同日含多段的彙總</span></article><article><b>${fmt(evidence.repeat_within_24h)}</b><span>24 小時內有觀測支持的返回</span></article><article><b>${fmt(evidence.repeat_not_model_eligible)}</b><span>返回片段未通過模型門檻仍保留</span></article></div><p>資料版本 ${evidence.contract_version}。多段彙總包含缺口分段，不能全部當成返回；${fmt(evidence.uncertain_reappearances)} 段屬中斷後再出現，需補證。${fmt(evidence.model_eligible)} 段具舊品質門檻所需觀測，尚無 v2 模型分數。</p><details><summary>查看切分參數敏感度</summary><div class="episode-table-wrap"><table><thead><tr><th>進入／離開</th><th>最大缺口</th><th>片段數</th><th>24 小時內返回</th></tr></thead><tbody>${evidence.sensitivity.map(s=>`<tr><td>${s.entry_km}／${s.exit_km} 公里</td><td>${s.gap_hours} 小時</td><td>${fmt(s.episodes)}</td><td>${fmt(s.repeat_within_24h)}</td></tr>`).join('')}</tbody></table></div></details>`;
  }catch(error){document.getElementById('episodeMetrics').textContent='v2 統計摘要暫時無法載入；下方僅展示合成切分案例。';}
  document.getElementById('episodeExport').addEventListener('click',()=>{if(!evidence)return;const url=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='CableShield-v2-統計與口徑.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
if(typeof document!=='undefined')mount();
