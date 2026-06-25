export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? '#FFF9EE' : '#4B4032'
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 26px 0', fontWeight:700, fontSize:15, color:c }}>
      <span>9:41</span>
      <span style={{ display:'flex', gap:7, alignItems:'center' }}>
        <svg width="18" height="13" viewBox="0 0 18 13" fill={c}><rect x="0" y="8" width="3" height="5" rx="1"/><rect x="5" y="5" width="3" height="8" rx="1"/><rect x="10" y="2" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="13" rx="1" opacity=".4"/></svg>
        <svg width="22" height="13" viewBox="0 0 22 13" fill="none" stroke={c} strokeWidth="1.6"><rect x="1" y="2" width="17" height="9" rx="2.5"/><rect x="2.5" y="3.5" width="11" height="6" rx="1" fill={c} stroke="none"/><rect x="19.5" y="4.5" width="1.6" height="4" rx=".8" fill={c} stroke="none"/></svg>
      </span>
    </div>
  )
}
