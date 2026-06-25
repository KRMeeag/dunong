import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  {
    label: 'Home', path: '/dashboard',
    icon: (a: boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={a ? '#4B4032' : '#A89D8A'} strokeWidth={a ? 2.1 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>
  },
  {
    label: 'Practice', path: '/sipat',
    icon: (a: boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={a ? '#4B4032' : '#A89D8A'} strokeWidth={a ? 2.1 : 2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
  },
  {
    label: 'Scan', path: '/scan',
    icon: (a: boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={a ? '#4B4032' : '#A89D8A'} strokeWidth={a ? 2.1 : 2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
  },
  {
    label: 'Progress', path: '/progress',
    icon: (a: boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={a ? '#4B4032' : '#A89D8A'} strokeWidth={a ? 2.1 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l4-4 3 3 5-6"/></svg>
  },
  {
    label: 'Profile', path: '/profile',
    icon: (a: boolean) => <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={a ? '#4B4032' : '#A89D8A'} strokeWidth={a ? 2.1 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{ position:'absolute',bottom:0,left:0,right:0,height:84,background:'rgba(255,249,238,.86)',backdropFilter:'blur(16px)',borderTop:'1px solid rgba(75,64,50,.08)',display:'flex',alignItems:'flex-start',justifyContent:'space-around',padding:'12px 14px 0' }}>
      {tabs.map(t => {
        const active = pathname === t.path
        return (
          <button key={t.path} onClick={() => navigate(t.path)} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,border:'none',background:'none',cursor:'pointer',padding:0,color:active ? '#4B4032' : '#A89D8A' }}>
            {t.icon(active)}
            <span style={{ fontSize:10,fontWeight:active ? 700 : 600 }}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
