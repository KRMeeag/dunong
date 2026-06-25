import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import BottomNav from '../components/BottomNav'

export default function Progress() {
  const navigate = useNavigate()
  const { history, streak, points, confidence } = useAppStore()

  const avg = (key: 'accuracy'|'confidence'|'clarity') =>
    history.length ? Math.round(history.reduce((s,h)=>s+h.scores[key],0)/history.length) : 0

  const weeks = ['Week 1','Week 2','Week 3','Week 4']
  const weekBars = [42,61,75,Math.min(100,points)]

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'#FFF9EE',color:'#4B4032',overflowY:'auto',paddingBottom:80 }}>
      <div style={{ background:'#FFF9EE',padding:'52px 24px 16px',borderBottom:'1px solid rgba(75,64,50,.07)' }}>
        <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:22 }}>My Progress</div>
        <div style={{ fontSize:13,color:'#7A736B',marginTop:2 }}>{history.length} sessions completed</div>
      </div>

      <div style={{ padding:'16px 24px' }}>
        <div style={{ display:'flex',gap:10,marginBottom:16 }}>
          {[{label:'Streak',val:`${streak}d`,color:'#D6B15E'},{label:'Points',val:points,color:'#A8CFA0'},{label:'Sessions',val:history.length,color:'#9BBBD4'}].map(s=>(
            <div key={s.label} style={{ flex:1,background:'#fff',borderRadius:18,padding:'14px 10px',textAlign:'center',boxShadow:'0 4px 12px -8px rgba(75,64,50,.2)' }}>
              <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:22,color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11,color:'#7A736B',fontWeight:600,marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff',borderRadius:22,padding:'18px 16px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:16 }}>Average Scores</div>
          {[
            { label:'Accuracy', value:avg('accuracy'), color:'#9BBBD4' },
            { label:'Confidence', value:avg('confidence'), color:'#A8CFA0' },
            { label:'Clarity', value:avg('clarity'), color:'#D6B15E' },
          ].map(s=>(
            <div key={s.label} style={{ marginBottom:14 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                <span style={{ fontSize:13,fontWeight:600 }}>{s.label}</span>
                <span style={{ fontSize:13,fontWeight:700,color:s.color }}>{s.value}%</span>
              </div>
              <div style={{ height:8,borderRadius:4,background:'rgba(75,64,50,.08)',overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${s.value}%`,background:s.color,borderRadius:4,transition:'width .6s ease' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff',borderRadius:22,padding:'18px 16px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:16 }}>Monthly Progress</div>
          <div style={{ display:'flex',alignItems:'flex-end',gap:10,height:80 }}>
            {weekBars.map((h,i)=>(
              <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
                <div style={{ width:'100%',height:`${h}%`,background:i===3?'#4B4032':'#F4E3B2',borderRadius:'4px 4px 0 0',transition:'height .6s ease' }} />
                <span style={{ fontSize:10,color:'#7A736B',fontWeight:600 }}>{weeks[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {history.length > 0 ? (
          <div style={{ background:'#fff',borderRadius:22,padding:'18px 16px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
            <div style={{ fontWeight:700,fontSize:14,marginBottom:12 }}>Session History</div>
            {history.map((h,i)=>(
              <div key={i} style={{ padding:'12px 0',borderBottom:i<history.length-1?'1px solid rgba(75,64,50,.06)':'none' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4 }}>
                  <div style={{ fontSize:13,fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:12 }}>{h.lockedText.slice(0,40)}…</div>
                  <div style={{ fontSize:13,fontWeight:700,color:'#A8CFA0',flexShrink:0 }}>{Math.round((h.scores.accuracy+h.scores.confidence+h.scores.clarity)/3)}%</div>
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  <span style={{ fontSize:11,background:'rgba(214,177,94,.15)',color:'#7A5C1E',padding:'2px 8px',borderRadius:999,fontWeight:600 }}>{h.mode}</span>
                  <span style={{ fontSize:11,color:'#9BBBD4',fontWeight:600 }}>A:{h.scores.accuracy} C:{h.scores.confidence} Cl:{h.scores.clarity}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center',padding:'40px 0',opacity:.4 }}>
            <div style={{ fontSize:40,marginBottom:12 }}>📊</div>
            <div style={{ fontSize:14,fontWeight:600 }}>No sessions yet</div>
            <div style={{ fontSize:13,marginTop:4 }}>Complete a recitation to see your progress</div>
          </div>
        )}

        <button onClick={()=>navigate('/scan')} style={{ width:'100%',height:54,borderRadius:999,border:'none',background:'#4B4032',color:'#FFF9EE',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 14px 26px -12px rgba(75,64,50,.6)' }}>
          Start New Session
        </button>
      </div>
      <BottomNav />
    </div>
  )
}
