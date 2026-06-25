import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useTTS } from '../hooks/useVoice'

const DEMO = `Ang photosynthesis ay ang proseso kung paano ginagawa ng halaman ang sarili nitong pagkain mula sa liwanag ng araw, tubig, at carbon dioxide. Sa pamamagitan ng chlorophyll sa mga dahon, ginagamit ng halaman ang enerhiya ng araw upang gawing glucose ang mga simpleng materyales.

Ang prosesong ito ay nangyayari pangunahin sa mga chloroplast ng mga leaf cells. Ang tubig mula sa lupa ay naaabot ang mga dahon sa pamamagitan ng xylem vessels, habang ang carbon dioxide ay pumapasok sa pamamagitan ng mga stomata.

Bilang resulta, gumagawa ang halaman ng oxygen na inilalabas sa hangin, at glucose na ginagamit bilang enerhiya para sa paglaki at pagbuhay.`

export default function SipatAral() {
  const navigate = useNavigate()
  const { scannedText, setSessionField } = useAppStore()
  const { speak } = useTTS()
  const paragraphs = (scannedText||DEMO).split('\n\n').filter(Boolean)
  const [selected, setSelected] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    setAsking(true)
    try {
      const res = await fetch('/api/ask', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ context:paragraphs[selected], question }) })
      const data = await res.json()
      setAnswer(data.answer); speak(data.answer)
    } catch { setAnswer('Hindi ma-konekta sa AI. Subukan muli.') }
    finally { setAsking(false) }
  }

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'#FFF9EE',color:'#4B4032',display:'flex',flexDirection:'column' }}>
      <div style={{ background:'#FFF9EE',padding:'52px 24px 16px',borderBottom:'1px solid rgba(75,64,50,.07)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <button onClick={()=>navigate(-1)} style={{ border:'none',background:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:'#4B4032',fontWeight:600,fontSize:14 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B4032" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>Back
          </button>
          <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:18 }}>Sipat-Aral</div>
          <div style={{ background:'#A8CFA0',color:'#2A4A22',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:999 }}>Locked ✓</div>
        </div>
      </div>
      <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
        <div style={{ fontSize:12,color:'#7A736B',fontWeight:600,marginBottom:10,textTransform:'uppercase',letterSpacing:'.06em' }}>Tap a paragraph to select it</div>
        {paragraphs.map((p,i)=>(
          <div key={i} onClick={()=>setSelected(i)} style={{ marginBottom:14,padding:'14px 16px',borderRadius:16,border:selected===i?'2px solid #D6B15E':'1.5px solid rgba(75,64,50,.08)',background:selected===i?'rgba(214,177,94,.08)':'#fff',cursor:'pointer',position:'relative',transition:'all .2s' }}>
            {selected===i&&<div style={{ position:'absolute',left:0,top:8,bottom:8,width:3,background:'#D6B15E',borderRadius:'0 2px 2px 0' }} />}
            <p style={{ margin:0,fontSize:14,lineHeight:1.7,paddingLeft:selected===i?6:0 }}>{p}</p>
          </div>
        ))}
        {answer&&(
          <div style={{ background:'linear-gradient(135deg,#F4E3B2,#E7D3A8)',borderRadius:16,padding:'14px 16px',marginBottom:14,animation:'fadeIn .4s' }}>
            <div style={{ fontSize:11,fontWeight:700,color:'#7A736B',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8 }}>Sagot ni Dunong</div>
            <p style={{ margin:0,fontSize:14,lineHeight:1.6 }}>{answer}</p>
            <button onClick={()=>speak(answer)} style={{ marginTop:10,border:'none',background:'rgba(75,64,50,.1)',borderRadius:999,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer' }}>🔊 Read aloud</button>
          </div>
        )}
      </div>
      <div style={{ padding:'12px 24px 36px',borderTop:'1px solid rgba(75,64,50,.07)',background:'#FFF9EE' }}>
        <div style={{ fontSize:12,color:'#7A736B',marginBottom:10 }}>Selected: paragraph {selected+1}</div>
        <div style={{ display:'flex',gap:8,marginBottom:12 }}>
          <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAsk()} placeholder="Itanong kay Dunong…" style={{ flex:1,height:44,borderRadius:999,border:'1.5px solid rgba(75,64,50,.15)',background:'#fff',padding:'0 16px',fontSize:14,color:'#4B4032',outline:'none' }} />
          <button onClick={handleAsk} disabled={asking} style={{ width:44,height:44,borderRadius:'50%',border:'none',background:'#4B4032',color:'#FFF9EE',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            {asking?<div style={{ width:18,height:18,border:'2px solid #FFF9EE',borderTopColor:'transparent',borderRadius:'50%',animation:'dnSpin .8s linear infinite' }} />:'→'}
          </button>
        </div>
        <button onClick={()=>{setSessionField('lockedText',paragraphs[selected]);navigate('/recitation')}} style={{ width:'100%',height:54,borderRadius:999,border:'none',background:'#4B4032',color:'#FFF9EE',fontWeight:700,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:'0 14px 26px -12px rgba(75,64,50,.6)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4E3B2" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
          Ipaliwanag ito sa sarili mong salita
        </button>
      </div>
    </div>
  )
}
