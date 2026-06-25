import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const navigate = useNavigate()
  const { userName, lang, streak, points, sessions, history, setLang, setUserName } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(userName)

  const avg = history.length
    ? Math.round(history.reduce((s,h)=>s+(h.scores.accuracy+h.scores.confidence+h.scores.clarity)/3,0)/history.length)
    : 0

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'#FFF9EE',color:'#4B4032',overflowY:'auto',paddingBottom:80 }}>
      <div style={{ background:'linear-gradient(160deg,#2A2420,#4B4032)',padding:'52px 24px 28px',color:'#FFF9EE',textAlign:'center' }}>
        <div style={{ width:80,height:80,borderRadius:'50%',background:'radial-gradient(circle at 35% 30%,#FFFDF6,#D6B15E)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:32,fontWeight:800,color:'#4B4032' }}>{userName[0]}</div>
        {editing ? (
          <div style={{ display:'flex',gap:8,alignItems:'center',justifyContent:'center',marginBottom:8 }}>
            <input value={name} onChange={e=>setName(e.target.value)} style={{ height:36,borderRadius:999,border:'none',padding:'0 14px',fontSize:16,fontWeight:700,color:'#4B4032',outline:'none',textAlign:'center' }} />
            <button onClick={()=>{setUserName(name);setEditing(false)}} style={{ height:36,borderRadius:999,border:'none',background:'#D6B15E',color:'#4B4032',fontWeight:700,padding:'0 14px',cursor:'pointer' }}>Save</button>
          </div>
        ) : (
          <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:22,marginBottom:4 }}>{userName}</div>
        )}
        <div style={{ fontSize:13,opacity:.6 }}>Dunong Learner</div>
        {!editing&&<button onClick={()=>setEditing(true)} style={{ marginTop:10,background:'rgba(255,255,255,.12)',border:'none',color:'#FFF9EE',borderRadius:999,padding:'6px 16px',fontSize:12,fontWeight:600,cursor:'pointer' }}>✏️ Edit Name</button>}
      </div>

      <div style={{ padding:'16px 24px' }}>
        <div style={{ display:'flex',gap:10,marginBottom:16 }}>
          {[{label:'Streak',val:`${streak}d`,c:'#D6B15E'},{label:'Avg Score',val:`${avg}%`,c:'#A8CFA0'},{label:'Sessions',val:sessions,c:'#9BBBD4'}].map(s=>(
            <div key={s.label} style={{ flex:1,background:'#fff',borderRadius:18,padding:'14px 10px',textAlign:'center',boxShadow:'0 4px 12px -8px rgba(75,64,50,.2)' }}>
              <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:22,color:s.c }}>{s.val}</div>
              <div style={{ fontSize:11,color:'#7A736B',fontWeight:600,marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff',borderRadius:22,padding:'18px 20px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:14 }}>Preferences</div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid rgba(75,64,50,.07)' }}>
            <div>
              <div style={{ fontWeight:600,fontSize:14 }}>Language</div>
              <div style={{ fontSize:12,color:'#7A736B',marginTop:2 }}>Coach feedback language</div>
            </div>
            <div style={{ display:'flex',gap:6 }}>
              {(['FIL','EN'] as const).map(l=>(
                <button key={l} onClick={()=>setLang(l)} style={{ padding:'6px 14px',borderRadius:999,border:'none',background:lang===l?'#4B4032':'rgba(75,64,50,.08)',color:lang===l?'#FFF9EE':'#4B4032',fontWeight:700,fontSize:12,cursor:'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0' }}>
            <div>
              <div style={{ fontWeight:600,fontSize:14 }}>Points</div>
              <div style={{ fontSize:12,color:'#7A736B',marginTop:2 }}>Total earned</div>
            </div>
            <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:20,color:'#D6B15E' }}>{points}</div>
          </div>
        </div>

        <div style={{ background:'#fff',borderRadius:22,padding:'18px 20px',marginBottom:16,boxShadow:'0 4px 14px -8px rgba(75,64,50,.15)' }}>
          <div style={{ fontWeight:700,fontSize:14,marginBottom:14 }}>Achievements</div>
          {[
            { emoji:'🔥', label:'Streak Master', desc:`${streak} day streak`, unlocked:streak>=3 },
            { emoji:'⭐', label:'First Session', desc:'Complete your first recitation', unlocked:sessions>0 },
            { emoji:'🎯', label:'High Scorer', desc:'Score 80+ overall', unlocked:avg>=80 },
            { emoji:'📚', label:'Study Buddy', desc:'Complete 5 sessions', unlocked:sessions>=5 },
          ].map(a=>(
            <div key={a.label} style={{ display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid rgba(75,64,50,.06)',opacity:a.unlocked?1:.4 }}>
              <div style={{ width:44,height:44,borderRadius:13,background:a.unlocked?'rgba(214,177,94,.15)':'rgba(75,64,50,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{a.emoji}</div>
              <div>
                <div style={{ fontWeight:700,fontSize:14 }}>{a.label}</div>
                <div style={{ fontSize:12,color:'#7A736B',marginTop:2 }}>{a.desc}</div>
              </div>
              {a.unlocked&&<div style={{ marginLeft:'auto',background:'#A8CFA0',borderRadius:999,padding:'3px 10px',fontSize:11,fontWeight:700,color:'#2A4A22' }}>✓</div>}
            </div>
          ))}
        </div>

        <button onClick={()=>navigate('/onboarding')} style={{ width:'100%',height:54,borderRadius:999,border:'1.5px solid rgba(75,64,50,.16)',background:'transparent',color:'#4B4032',fontWeight:700,fontSize:15,cursor:'pointer',marginBottom:10 }}>
          Restart Onboarding
        </button>
      </div>
      <BottomNav />
    </div>
  )
}
