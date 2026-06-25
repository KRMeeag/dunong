import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { label:'Home', path:'/dashboard', icon:(a:boolean)=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?'#4B4032':'none'} stroke="#4B4032" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { label:'Practice', path:'/sipat', icon:(a:boolean)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?'#4B4032':'#7A736B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg> },
  { label:'Scan', path:'/scan', icon:(_:boolean)=><div style={{width:48,height:48,borderRadius:'50%',background:'#4B4032',display:'flex',alignItems:'center',justifyContent:'center',marginTop:-18,boxShadow:'0 8px 20px -6px rgba(75,64,50,.5)'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4E3B2" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 12h8"/></svg></div> },
  { label:'Progress', path:'/progress', icon:(a:boolean)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?'#4B4032':'#7A736B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label:'Profile', path:'/profile', icon:(a:boolean)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?'#4B4032':'#7A736B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'#fff',borderTop:'1px solid rgba(75,64,50,.08)',display:'flex',paddingBottom:16,paddingTop:8 }}>
      {tabs.map(t => {
        const active = pathname === t.path
        return (
          <button key={t.path} onClick={() => navigate(t.path)} style={{ flex:1,border:'none',background:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'4px 0',cursor:'pointer' }}>
            {t.icon(active)}
            <span style={{ fontSize:10,fontWeight:600,color:active?'#4B4032':'#7A736B' }}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
