import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import BottomNav from '../components/BottomNav'
import StatusBar from '../components/StatusBar'

const Ring = ({ value, label, color }: { value:number; label:string; color:string }) => {
  const r=28, c=2*Math.PI*r
  return (
    <div style={{ textAlign:'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(75,64,50,.08)" strokeWidth="6"/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${c*value/100} ${c}`} strokeLinecap="round" transform="rotate(-90 36 36)"/>
        <text x="36" y="40" textAnchor="middle" fontSize="15" fontWeight="800" fill="#4B4032">{value}</text>
      </svg>
      <div style={{ fontSize:11,fontWeight:600,color:'#7A736B',marginTop:4 }}>{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { userName, streak, points, confidence, sessions, history } = useAppStore()
  const days=['L','M','M','H','B','S','L'], bars=[45,70,55,90,80,30,65]
  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'#FFF9EE',color:'#4B4032',overflowY:'auto',paddingBottom:80 }}>
      <div style={{ background:'radial-gradient(130% 75% at 100% 0%,rgba(214,177,94,.16),transparent 58%),#FFF9EE',padding:'0 24px 20px' }}>
        <div style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:124,height:30,background:'#2A2420',borderBottomLeftRadius:18,borderBottomRightRadius:18,zIndex:5 }} />
        <StatusBar />
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:14 }}>
          <div>
            <div style={{ fontSize:13,color:'#7A736B',fontWeight:500 }}>Magandang umaga,</div>
            <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:22 }}>{userName} 👋</div>
          </div>
          <div style={{ width:40,height:40,borderRadius:'50%',background:'radial-gradient(circle at 35% 30%,#FFFDF6,#D6B15E)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:17,color:'#4B4032' }}>{userName[0]}</div>
        </div>
      </div>
      <div style={{ padding:'0 24px' }}>
        <div style={{ background:'linear-gradient(135deg,#4B4032,#6B5A48)',borderRadius:24,padding:20,marginBottom:16,color:'#FFF9EE',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',right:-20,top:-20,width:120,height:120,borderRadius:'50%',background:'rgba(214,177,94,.12)' }} />
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:12,opacity:.7,fontWeight:600,marginBottom:4 }}>🔥 Current Streak</div>
              <div style={{ fontFamily:"'Bricolage Grotesque'",fontSize:36,fontWeight:800,lineHeight:1 }}>{streak} days</div>
              <div style={{ fontSize:12,opacity:.6,marginTop:4 }}>+{points} pts this week</div>
            </div>
            <div style={{ display:'flex',gap:5 }}>
              {['M','T','W','T','F','S','S'].map((d,i)=>(
                <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
                  <div style={{ width:24,height:24,borderRadius:'50%',background:i<5?'#D6B15E':'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {i<5&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4B4032" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
                  </div>
                  <span style={{ fontSize:9,opacity:.6 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>navigate('/recitation')} style={{ marginTop:14,background:'#D6B15E',border:'none',color:'#4B4032',fontFamily:"'Hanken Grotesk'",fontWeight:700,fontSize:13,padding:'10px 18px',borderRadius:999,cursor:'pointer' }}>Ipagpatuloy ang session →</button>
        </div>
        <div style={{ display:'flex',gap:10,marginBottom:16 }}>
          {[{v:points,l:'Points',c:'#D6B15E'},{v:`${confidence}%`,l:'Confidence',c:'#A8CFA0'},{v:sessions,l:'Sessions',c:'#9BBBD4'}].map((s,i)=>(
            <div key={i} style={{ flex:1,background:'#fff',borderRadius:18,padding:'14px 12px',textAlign:'center',boxShadow:'0 4px 12px -8px rgba(75,64,50,.2)' }}>
              <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:22,color:s.c }}>{s.v}</div>
              <div style={{ fontSize:11,color:'#7A736B',fontWeight:600,marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>navigate('/scan')} style={{ width:'100%',background:'linear-gradient(135deg,#F4E3B2,#E7D3A8)',border:'none',borderRadius:20,padding:'16px 20px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',marginBottom:20,textAlign:'left' }}>
          <div style={{ width:44,height:44,borderRadius:13,background:'#4B4032',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4E3B2" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 12h8"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:14,color:'#4B4032' }}>Mag-scan ng Module</div>
            <div style={{ fontSize:12,color:'#7A736B',marginTop:2 }}>Point camera at your printed module</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A736B" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <div style={{ background:'#fff',borderRadius:22,padding:'18px 16px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:16 }}>Skill Rings</div>
          <div style={{ display:'flex',justifyContent:'space-around' }}>
            <Ring value={confidence} label="Confidence" color="#A8CFA0" />
            <Ring value={Math.min(100,points)} label="Clarity" color="#D6B15E" />
            <Ring value={68} label="Accuracy" color="#9BBBD4" />
          </div>
        </div>
        <div style={{ background:'#fff',borderRadius:22,padding:'18px 16px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:16 }}>Points this week</div>
          <div style={{ display:'flex',alignItems:'flex-end',gap:8,height:70 }}>
            {bars.map((h,i)=>(
              <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
                <div style={{ width:'100%',height:`${h}%`,background:i===3?'#4B4032':'#F4E3B2',borderRadius:'4px 4px 0 0' }} />
                <span style={{ fontSize:10,color:'#7A736B',fontWeight:600 }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
        {history.length>0&&(
          <div style={{ background:'#fff',borderRadius:22,padding:'18px 16px',marginBottom:16 }}>
            <div style={{ fontWeight:700,fontSize:14,marginBottom:12 }}>Recent Sessions</div>
            {history.slice(0,3).map((h,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<2?'1px solid rgba(75,64,50,.06)':'none' }}>
                <div style={{ fontSize:13,fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:12 }}>{h.lockedText.slice(0,40)}…</div>
                <div style={{ fontSize:12,color:'#A8CFA0',fontWeight:700 }}>{h.scores.accuracy}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
