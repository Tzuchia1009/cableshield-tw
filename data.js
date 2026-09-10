export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function readJSON(url) {
  const r = await fetch(url,{signal:AbortSignal.timeout(15000)});
  if (!r.ok) throw new Error(`資料來源回傳 HTTP ${r.status}`);
  return r.json();
}
export function timestamp(value) { return Date.parse(value.replace(' ','T')+'+08:00'); }
export function formatTime(ms,compact=false) {
  if(!Number.isFinite(ms))return '—';
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:compact?undefined:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(ms));
}
export function latestObservation(vessel,time) { return vessel.points.filter(p=>p.ms<=time).at(-1)||null; }
export function gapSegments(points,threshold=180) {
  const result=[];let segment=[];
  for(const point of points){if(segment.length&&(point.ms-segment.at(-1).ms)/60000>threshold){result.push(segment);segment=[];}segment.push(point);}
  if(segment.length)result.push(segment);return result;
}
export const navLabels={0:'航行中',1:'錨泊（AIS 回報）',2:'失去操縱能力',3:'操縱能力受限',4:'受吃水限制',5:'繫泊（AIS 回報）',6:'擱淺',7:'從事捕魚（AIS 回報）',8:'帆航',15:'未提供'};
export function hydrate(data) {
  if(!Array.isArray(data.vessels)||!data.vessels.length)throw new Error('來源沒有船舶觀測');
  for(const vessel of data.vessels){vessel.points.forEach(p=>{p.ms=timestamp(p.time);if(!Number.isFinite(p.ms)||!Number.isFinite(p.lat)||!Number.isFinite(p.lon))throw new Error('觀測時間或座標無效');});vessel.points.sort((a,b)=>a.ms-b.ms);}
  const times=data.vessels.flatMap(v=>v.points.map(p=>p.ms));
  if(!times.length)throw new Error('來源沒有有效觀測點');
  data.minTime=Math.min(...times);data.maxTime=Math.max(...times);
  if(data.mode==='synthetic'){
    for(const v of data.vessels){v.count=v.points.length;const gaps=v.points.slice(1).map((p,i)=>(p.ms-v.points[i].ms)/60000).sort((a,b)=>a-b);v.max_gap_minutes=Math.max(0,...gaps);v.median_gap_minutes=gaps[Math.floor(gaps.length/2)]??null;v.missing_heading_count=v.points.filter(p=>p.heading===null).length;}
    data.accounting.valid_region_rows=times.length;data.accounting.display_points=times.length;
  }
  return data;
}
/** Observation providers share the same vessel/fix structure. No UI changes needed for transport. */
export class HistoryProvider { async load(){return hydrate(await readJSON('./data/history.json'));} }
export class SimulationProvider {
  async load(){const q=await readJSON('./data/top-k.json');const events=[...q.events,...q.abstained_events];return hydrate({mode:'synthetic',source:'合成情境 · 非實際船舶',start:'2099-01-01 08:00:00',end:'2099-01-01 08:30:00',gap_threshold_minutes:3,selection:'合成契約展示',limitations:['所有船位、航速與分數均為合成示範'],accounting:{valid_region_rows:events.length*31,display_vessels:events.length,display_points:events.length*31},vessels:events.map((e,i)=>({id:e.event_id,name:'演練船舶 '+String.fromCharCode(65+i),ship_type:'漁船',ship_type_code:30,mmsi_masked:'合成 ID',call_sign:'',destination:'合成情境',draught:null,count:31,median_gap_minutes:1,max_gap_minutes:e.data_quality_state==='abstain'?16:1,gap_over_3h_count:0,mean_sog:null,low_speed_fix_count:null,missing_heading_count:0,event:e,points:Array.from({length:31},(_,m)=>({time:`2099-01-01T08:${String(m).padStart(2,'0')}:00`,lat:e.map_anchor_lat+(30-m)*.007,lon:e.map_anchor_lon+(30-m)*.008+Math.sin(m*.5)*.013,sog:Math.round((2+Math.sin(m*.5+i))*10)/10,cog:(200+m*3)%360,heading:null,nav_status:15,position_accuracy:null,source_file:'合成情境',source_row:m+1,record_id:e.event_id+'-'+m})).filter((p,m)=>e.data_quality_state!=='abstain'||m<7||m>23)}))});}
}
