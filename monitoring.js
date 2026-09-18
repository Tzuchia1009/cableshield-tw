const profiles = {
large: {name:'大型船', icon:'▰', evidence:'需船長、噸位或船籍資料確認；貨船不必然是大型船。', sources:'AIS／衛星 AIS、SAR、岸際雷達', focus:'錨泊、漂移、反覆接近與身分一致性', action:'核對接收站健康、船籍與同時段雷達；SAR 作過境補證。'},
working: {name:'中型作業船', icon:'▱', evidence:'需尺寸與作業資料；低速可能是正常捕魚或工程作業。', sources:'AIS／授權 VMS、雷達、SAR', focus:'漁具作業、低速轉向與反覆穿越', action:'補查漁業／工程作業紀錄、海況及同時段目標。'},
small: {name:'小型近岸船', icon:'◒', evidence:'需尺度證據；雷達與影像可見度還受材質、海況及距離影響。', sources:'岸際雷達、光學／熱影像、授權船位紀錄', focus:'登陸區周邊活動與漁具接觸可能性', action:'優先補近岸連續觀測；免費 SAR 未見目標不能排除小船。'},
unknown: {name:'尺度／身分未知', icon:'◇', evidence:'保持匿名接觸 ID；未取得證據前不推測船型、尺寸或 MMSI。', sources:'原始偵測來源、跨來源時空配對', focus:'先確認目標存在、位置誤差與身分', action:'保留接觸時間及位置不確定性，人工確認後才建立船舶關聯。'}
};
const states={
received:{name:'有 AIS 觀測',text:'先核對觀測時間、連續性與位置品質；收到訊號不代表身分或作業內容已確認。',queue:'品質通過後，才進行為查核'},
gap:{name:'曾有 AIS，現在缺訊',text:'可能來自接收、設備、抽樣或航行環境。只有確認預期回報與接收覆蓋後，才評估缺訊異常。',queue:'隔離補證 · 暫不由缺訊判斷意圖'},
absent:{name:'未取得 AIS／裝設未知',text:'尚不能分辨未裝設備、未發射或未被接收。船舶大小不足以單獨判定其裝設義務。',queue:'補查裝設與來源覆蓋'},
unmatched:{name:'其他感測器有目標，無 AIS 配對',text:'稱為「未配對接觸候選」。可能是正常未配備船、時間偏差、錯配或偵測誤報，需複核。',queue:'接觸確認 → 身分補證'}
};
export function mountMonitoring(){
const section=document.createElement('section');
section.className='adaptive-monitoring';
section.id='adaptiveMonitoring';
section.innerHTML=`<div class="adaptive-title"><div><span class="eyebrow">ADAPTIVE OBSERVATION</span><h2>船不同，看見它的方式也不同。</h2><p>先確認看到了什麼，再決定還需要什麼證據。</p></div><span class="adaptive-badge">策略預覽 · 非即時偵測</span></div><div class="adaptive-controls"><label>監測對象<select id="monitorProfile" aria-label="監測對象">${Object.entries(profiles).map(([k,v])=>`<option value="${k}" ${k==='unknown'?'selected':''}>${v.name}</option>`).join('')}</select></label><label>AIS 觀測狀態<select id="monitorAIS" aria-label="AIS 觀測狀態">${Object.entries(states).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></label><button class="button" id="monitorReset">回到目前選船</button></div><p id="monitorContext" class="adaptive-context">歷史樣本尺度未知；切換選項可演練不同策略。</p><div id="monitorResult" aria-live="polite"></div><div class="adaptive-sources"><span>已具備：匿名歷史 AIS、模型彙總證據</span><span>已查詢：SAR 影像目錄（非船舶偵測）</span><span>待接入：雷達、VMS、光學／熱影像</span></div>`;
document.querySelector('.evidence-strip').before(section);
let vessel=null,mode='history',scenario=false;
const profile=section.querySelector('#monitorProfile'),ais=section.querySelector('#monitorAIS');
function render(){
const p=profiles[profile.value],s=states[ais.value];
section.querySelector('#monitorContext').textContent=scenario?'手動策略演練 · 未改動地圖觀測、船舶身分或模型分數':vessel?`${vessel.name} · ${mode==='history'?'匿名歷史 AIS':'合成演練'} · 船長／噸位未提供，尺度保留未知`:'尚未選取船舶';
section.querySelector('#monitorResult').innerHTML=`<div class="adaptive-result"><article class="adaptive-target"><span class="contact-symbol" aria-hidden="true">${profile.value==='unknown'?'◇':'<svg viewBox="0 0 80 48"><path d="M8 30h64L60 43H22Z" fill="currentColor"/><path d="M24 29V16h23v13M34 16V7h3v9" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 46q8-5 16 0t16 0t16 0t16 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>'}</span><h3>${p.name}</h3><p>${p.evidence}</p><small>查核優先分數：未計算</small></article><article><span class="eyebrow">觀測與證據</span><h3>${s.name}</h3><p>${s.text}</p><strong>${s.queue}</strong></article><article><span class="eyebrow">下一步查核</span><h3>${p.focus}</h3><p>${p.action}</p><small>建議來源：${p.sources}（可用性見下方）</small></article></div>`;
}
function reset(){scenario=false;profile.value='unknown';ais.value='received';render();}
profile.onchange=ais.onchange=()=>{scenario=true;render();};
section.querySelector('#monitorReset').onclick=reset;
render();
return {setVessel(v,m){if(vessel?.id===v?.id&&mode===m)return;vessel=v;mode=m;reset();}};
}
