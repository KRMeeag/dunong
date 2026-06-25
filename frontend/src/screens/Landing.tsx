import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import StatusBar from '../components/StatusBar'

export default function Landing() {
  const navigate = useNavigate()
  const { lang, setLang } = useAppStore()
  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'radial-gradient(130% 75% at 100% 0%,rgba(214,177,94,.16),transparent 58%),radial-gradient(120% 70% at 0% 4%,rgba(231,211,168,.34),transparent 55%),#FFF9EE',color:'#4B4032',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:124,height:30,background:'#2A2420',borderBottomLeftRadius:18,borderBottomRightRadius:18,zIndex:5 }} />
      <StatusBar />
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 24px 0' }}>
        <div style={{ display:'flex',alignItems:'center',gap:9 }}>
          <div style={{ width:34,height:34,borderRadius:11,background:'#4B4032',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4E3B2" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5V6.5A2.5 2.5 0 0 1 6.5 4H18a1 1 0 0 1 1 1v13"/><path d="M6.5 16H19"/><path d="M6.5 16a2.5 2.5 0 0 0 0 5H19"/></svg>
          </div>
          <span style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:21,letterSpacing:'-.02em' }}>Dunong</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',background:'rgba(75,64,50,.06)',borderRadius:999,padding:3 }}>
          {(['EN','FIL'] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{ fontSize:12,fontWeight:700,padding:'5px 12px',borderRadius:999,border:'none',background:lang===l?'#4B4032':'transparent',color:lang===l?'#FFF9EE':'#7A736B',cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ margin:'22px 24px 0',height:236,borderRadius:30,background:'linear-gradient(160deg,#F4E3B2,#E7D3A8)',position:'relative',overflow:'hidden',boxShadow:'0 18px 40px -22px rgba(75,64,50,.4)' }}>
        <div style={{ position:'absolute',width:300,height:300,borderRadius:'50%',border:'1.5px dashed rgba(75,64,50,.18)',top:-70,right:-90 }} />
        <div style={{ position:'absolute',left:34,top:46,width:118,height:150,background:'#FFF9EE',borderRadius:14,boxShadow:'0 14px 26px -12px rgba(75,64,50,.35)',transform:'rotate(-7deg)',padding:'16px 14px' }}>
          {[70,90,55,80].map((w,i)=><div key={i} style={{ height:7,width:`${w}%`,background:i===0?'#E7D3A8':'#F0E2BC',borderRadius:4,marginBottom:i<3?9:0 }} />)}
        </div>
        <div style={{ position:'absolute',right:30,top:60,width:96,height:96,borderRadius:'50%',background:'radial-gradient(circle at 35% 30%,#FFFDF6,#D6B15E)',boxShadow:'0 16px 30px -10px rgba(214,177,94,.7)',display:'flex',alignItems:'center',justifyContent:'center',animation:'dnBob 4s ease-in-out infinite' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#4B4032" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><circle cx="18.5" cy="17.5" r="1.5" fill="#4B4032"/><circle cx="6" cy="16" r="1" fill="#4B4032"/></svg>
        </div>
      </div>
      <div style={{ padding:'24px 24px 0' }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:30,lineHeight:1.08,letterSpacing:'-.025em',margin:0 }}>
          {lang==='EN'?'Practice before\nyou recite.':'Mag-practice bago\nka mag-recite.'}
        </h1>
        <p style={{ fontSize:14.5,lineHeight:1.5,color:'#7A736B',margin:'11px 0 0',maxWidth:300 }}>
          {lang==='EN'?'Dunong helps Filipino students speak with confidence through AI-guided recitation.':'Tinutulungan ng Dunong ang mga estudyanteng Pilipino na magsalita nang may kumpiyansa.'}
        </p>
      </div>
      <div style={{ position:'absolute',left:24,right:24,bottom:30 }}>
        <div style={{ display:'flex',gap:10,marginBottom:14 }}>
          {[{e:'📖',l:lang==='EN'?'Scan printed modules':'I-scan ang modules'},{e:'🎙️',l:lang==='EN'?'Practice speaking':'Mag-practice'},{e:'💪',l:lang==='EN'?'Build confidence':'Itayo ang kumpiyansa'}].map((f,i)=>(
            <div key={i} style={{ flex:1,background:'#fff',border:'1px solid rgba(75,64,50,.07)',borderRadius:18,padding:'13px 12px',boxShadow:'0 6px 16px -10px rgba(75,64,50,.2)',textAlign:'center' }}>
              <div style={{ fontSize:22,marginBottom:6 }}>{f.e}</div>
              <div style={{ fontSize:11.5,fontWeight:600,lineHeight:1.25 }}>{f.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:14,background:'rgba(168,207,160,.18)',borderRadius:14,padding:9,marginBottom:14 }}>
          {['No images uploaded','Works offline','Low-data'].map(t=>(
            <span key={t} style={{ fontSize:10.5,fontWeight:600,color:'#4B4032',display:'flex',alignItems:'center',gap:4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B9A72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>{t}
            </span>
          ))}
        </div>
        <div style={{ display:'flex',gap:11 }}>
          <button onClick={()=>navigate('/scan')} style={{ flex:1.5,border:'none',background:'#4B4032',color:'#FFF9EE',fontFamily:"'Hanken Grotesk'",fontWeight:700,fontSize:15,height:54,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',gap:9,boxShadow:'0 14px 26px -12px rgba(75,64,50,.7)',cursor:'pointer' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F4E3B2" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 12h8"/></svg>
            {lang==='EN'?'Scan Module':'I-scan ang Module'}
          </button>
          <button onClick={()=>navigate('/onboarding')} style={{ flex:1,border:'1.5px solid rgba(75,64,50,.16)',background:'transparent',color:'#4B4032',fontFamily:"'Hanken Grotesk'",fontWeight:700,fontSize:15,height:54,borderRadius:999,cursor:'pointer' }}>
            {lang==='EN'?'Try Demo':'Subukan'}
          </button>
        </div>
      </div>
    </div>
  )
}
