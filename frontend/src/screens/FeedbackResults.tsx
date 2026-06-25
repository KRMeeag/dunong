import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useTTS } from '../hooks/useVoice'

const ScoreArc = ({ value, label, color }: { value:number; label:string; color:string }) => {
  const r=36, c=2*Math.PI*r
  return (
    <div style={{ textAlign:'center' }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(75,64,50,.08)" strokeWidth="7"/>
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={`${c*value/100} ${c}`} strokeLinecap="round" transform="rotate(-90 45 45)"/>
        <text x="45" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill="#4B4032">{value}</text>
      </svg>
      <div style={{ fontSize:11,fontWeight:600,color:'#7A736B',marginTop:4 }}>{label}</div>
    </div>
  )
}

export default function FeedbackResults() {
  const navigate = useNavigate()
  const { currentSession, history } = useAppStore()
  const { speak } = useTTS()
  const scores = currentSession.scores || { accuracy: 0, confidence: 0, clarity: 0 }
  const feedback = currentSession.feedback || 'Magaling! Patuloy na magsanay.'
  const avg = Math.round((scores.accuracy + scores.confidence + scores.clarity) / 3)
  const last = history[0]

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'#FFF9EE',color:'#4B4032',display:'flex',flexDirection:'column',overflowY:'auto' }}>
      <div style={{ background:'linear-gradient(160deg,#2A2420,#4B4032)',padding:'52px 24px 28px',color:'#FFF9EE' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
          <div style={{ width:44,height:44,borderRadius:'50%',background:'rgba(214,177,94,.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D6B15E" strokeWidth="2.2"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/></svg>
          </div>
          <div>
            <div style={{ fontSize:12,opacity:.6,fontWeight:600 }}>SESSION COMPLETE</div>
            <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:20 }}>Dunong Feedback</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,.07)',borderRadius:20,padding:'20px',display:'flex',alignItems:'center',gap:16 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13,opacity:.6,marginBottom:4 }}>Overall Score</div>
            <div style={{ fontFamily:"'Bricolage Grotesque'",fontSize:52,fontWeight:800,color:'#D6B15E',lineHeight:1 }}>{avg}</div>
            <div style={{ fontSize:13,opacity:.5,marginTop:4 }}>{avg>=80?'Napakagaling!':avg>=60?'Magaling!':'Patuloy na magsanay'}</div>
          </div>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke="#D6B15E" strokeWidth="6" strokeDasharray={`${2*Math.PI*32*avg/100} ${2*Math.PI*32}`} strokeLinecap="round" transform="rotate(-90 40 40)"/>
          </svg>
        </div>
      </div>

      <div style={{ padding:'20px 24px',flex:1 }}>
        <div style={{ background:'#fff',borderRadius:22,padding:'20px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:16 }}>Skill Breakdown</div>
          <div style={{ display:'flex',justifyContent:'space-around' }}>
            <ScoreArc value={scores.accuracy} label="Accuracy" color="#9BBBD4" />
            <ScoreArc value={scores.confidence} label="Confidence" color="#A8CFA0" />
            <ScoreArc value={scores.clarity} label="Clarity" color="#D6B15E" />
          </div>
        </div>

        <div style={{ background:'linear-gradient(135deg,#F4E3B2,#E7D3A8)',borderRadius:22,padding:'18px 20px',marginBottom:16 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <div style={{ width:28,height:28,borderRadius:'50%',background:'#4B4032',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F4E3B2" strokeWidth="2.5"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/></svg>
              </div>
              <span style={{ fontWeight:700,fontSize:13,color:'#4B4032' }}>Coach Feedback</span>
            </div>
            <button onClick={()=>speak(feedback)} style={{ background:'none',border:'none',fontSize:18,cursor:'pointer' }}>🔊</button>
          </div>
          <p style={{ margin:0,fontSize:14,lineHeight:1.65,color:'#4B4032' }}>{feedback}</p>
        </div>

        {last&&(
          <div style={{ background:'#fff',borderRadius:22,padding:'18px 20px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
            <div style={{ fontWeight:700,fontSize:14,marginBottom:12 }}>Metrics</div>
            {[
              { label:'Filler words dropped', value:`-${last.fillerWordDrop??0}`, color:'#A8CFA0' },
              { label:'Avg pause time', value:`${last.pauseDrop??0}s`, color:'#9BBBD4' },
            ].map(m=>(
              <div key={m.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(75,64,50,.06)' }}>
                <span style={{ fontSize:13,color:'#7A736B' }}>{m.label}</span>
                <span style={{ fontSize:15,fontWeight:700,color:m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:'0 24px 44px',display:'flex',flexDirection:'column',gap:10 }}>
        <button onClick={()=>navigate('/recitation')} style={{ width:'100%',height:54,borderRadius:999,border:'none',background:'#4B4032',color:'#FFF9EE',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 14px 26px -12px rgba(75,64,50,.6)' }}>
          🔁 Try Again
        </button>
        <button onClick={()=>navigate('/dashboard')} style={{ width:'100%',height:54,borderRadius:999,border:'1.5px solid rgba(75,64,50,.16)',background:'transparent',color:'#4B4032',fontWeight:700,fontSize:15,cursor:'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
