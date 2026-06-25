import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, RecitationMode as Mode } from '../store/appStore'
import { useVoiceRecorder, useTTS } from '../hooks/useVoice'
import { getCoachFeedback } from '../services/api'

const PROMPTS: Record<Mode,string[]> = {
  'paraphrase':['Sige, ipaliwanag mo ito sa sarili mong salita.','Ano ang pangunahing ideya ng tekstong ito?','Paano mo ipapaliwanag ito sa kaibigan mo?'],
  'read-aloud':['Basahin mo nang malakas ang tekstong ito.','I-read aloud ang piniling talata.'],
  'cold-call':['Bigla na lang, ano ang alam mo tungkol dito?','Kung tatawagan ka ng guro mo ngayon, ano ang sasabihin mo?'],
  'stand-deliver':['Nakatayo ka na sa harap ng klase. Simulan mo na.','Timer nagsimula na. GO!'],
}
const LABELS: Record<Mode,string> = { 'paraphrase':'Paraphrase','read-aloud':'Read-Aloud','cold-call':'Cold Call','stand-deliver':'Stand & Deliver' }

export default function RecitationMode() {
  const navigate = useNavigate()
  const { currentSession, setSessionField, addHistory } = useAppStore()
  const { recording, start, stop } = useVoiceRecorder()
  const { speak } = useTTS()
  const mode = (currentSession.mode||'paraphrase') as Mode
  const lockedText = currentSession.lockedText||'Ang photosynthesis ay ang proseso kung paano ginagawa ng halaman ang sarili nitong pagkain…'
  const [elapsed, setElapsed] = useState(0)
  const [promptIdx, setPromptIdx] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [countdown, setCountdown] = useState<number|null>(mode==='stand-deliver'?3:null)
  const [waveBars, setWaveBars] = useState<number[]>(Array(10).fill(0.3))
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(()=>{ timerRef.current=setInterval(()=>setElapsed(e=>e+1),1000); return ()=>clearInterval(timerRef.current) },[])
  useEffect(()=>{ if(!recording)return; const t=setInterval(()=>setWaveBars(Array.from({length:10},()=>Math.random()*.6+.2)),120); return ()=>clearInterval(t) },[recording])
  useEffect(()=>{ if(countdown===null||countdown===0){setCountdown(null);return} const t=setTimeout(()=>setCountdown(c=>(c??1)-1),1000); return ()=>clearTimeout(t) },[countdown])

  const prompt = PROMPTS[mode][promptIdx%PROMPTS[mode].length]
  useEffect(()=>{ speak(prompt) },[prompt,speak])
  const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const handlePress = useCallback(async()=>{
    if(recording){
      setProcessing(true)
      try {
        const transcript=await stop()
        setSessionField('transcript',transcript)
        const fb=await getCoachFeedback({lockedText,transcript,mode,lang:'FIL'})
        addHistory({lockedText,subject:'General',mode,transcript,scores:{accuracy:fb.accuracy,confidence:fb.confidence,clarity:fb.clarity},fillerWordDrop:fb.fillerWords,pauseDrop:fb.pauseTime,feedback:fb.feedback})
        setSessionField('scores',{accuracy:fb.accuracy,confidence:fb.confidence,clarity:fb.clarity})
        setSessionField('feedback',fb.feedback)
        navigate('/feedback')
      } catch(e){console.error(e);setProcessing(false)}
    } else {
      if(countdown!==null)return
      start()
    }
  },[recording,stop,start,countdown,lockedText,mode,setSessionField,addHistory,navigate])

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'linear-gradient(160deg,#2A2420,#3D3228)',color:'#FFF9EE',display:'flex',flexDirection:'column',alignItems:'center' }}>
      {countdown!==null&&(
        <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,.7)',zIndex:20,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16 }}>
          <div style={{ fontFamily:"'Bricolage Grotesque'",fontSize:96,fontWeight:800,color:'#D6B15E' }}>{countdown}</div>
          <div style={{ fontSize:18,opacity:.7 }}>Maghanda ka…</div>
        </div>
      )}
      <div style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'52px 20px 16px' }}>
        <button onClick={()=>navigate(-1)} style={{ width:40,height:40,borderRadius:'50%',border:'none',background:'rgba(255,255,255,.1)',color:'#FFF9EE',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
        <div style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:22,color:'#D6B15E' }}>{fmt(elapsed)}</div>
        <div style={{ width:40 }} />
      </div>
      <div style={{ display:'flex',gap:8,padding:'0 20px',overflowX:'auto',width:'100%' }}>
        {(Object.keys(LABELS) as Mode[]).map(m=>(
          <button key={m} onClick={()=>{setSessionField('mode',m);setPromptIdx(0)}} style={{ flexShrink:0,padding:'8px 14px',borderRadius:999,border:'none',background:mode===m?'#D6B15E':'rgba(255,255,255,.1)',color:mode===m?'#4B4032':'rgba(255,255,255,.7)',fontWeight:700,fontSize:12.5,cursor:'pointer',transition:'all .2s' }}>{LABELS[m]}</button>
        ))}
      </div>
      <div style={{ margin:'24px 24px 0',background:'rgba(214,177,94,.12)',border:'1px solid rgba(214,177,94,.25)',borderRadius:20,padding:'18px 20px',width:'calc(100% - 48px)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
          <div style={{ width:28,height:28,borderRadius:'50%',background:'#D6B15E',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B4032" strokeWidth="2.5"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/></svg>
          </div>
          <span style={{ fontSize:11,fontWeight:700,color:'#D6B15E',textTransform:'uppercase',letterSpacing:'.06em' }}>Dunong says</span>
          <button onClick={()=>speak(prompt)} style={{ marginLeft:'auto',background:'none',border:'none',color:'#D6B15E',fontSize:16,cursor:'pointer' }}>🔊</button>
        </div>
        <p style={{ margin:0,fontSize:15,lineHeight:1.6,color:'#FFF9EE' }}>{prompt}</p>
        <button onClick={()=>setPromptIdx(i=>i+1)} style={{ marginTop:10,background:'none',border:'none',color:'rgba(214,177,94,.6)',fontSize:12,fontWeight:600,cursor:'pointer',padding:0 }}>Try another prompt ↓</button>
      </div>
      <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20 }}>
        {recording&&<div style={{ display:'flex',alignItems:'center',gap:4,height:60 }}>{waveBars.map((h,i)=><div key={i} style={{ width:5,height:`${h*100}%`,background:'#D6B15E',borderRadius:3,transition:'height .12s ease' }} />)}</div>}
        {(recording||processing)&&<div style={{ display:'flex',alignItems:'center',gap:8,fontSize:14,color:'rgba(255,255,255,.6)' }}><div style={{ width:8,height:8,borderRadius:'50%',background:processing?'#A8CFA0':'#D6B15E',animation:'dnPulse 1.5s ease-out infinite' }} />{processing?'Sinusuri…':'Nakikinig…'}</div>}
        {!recording&&!processing&&<div style={{ textAlign:'center',opacity:.5 }}><div style={{ fontSize:40,marginBottom:8 }}>🎙️</div><div style={{ fontSize:13 }}>Tap to speak</div></div>}
      </div>
      <div style={{ paddingBottom:48,display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
        <div style={{ position:'relative' }}>
          {recording&&<><div style={{ position:'absolute',inset:-16,borderRadius:'50%',background:'rgba(214,177,94,.2)',animation:'pulseRing 1.5s ease-out infinite' }} /><div style={{ position:'absolute',inset:-8,borderRadius:'50%',background:'rgba(214,177,94,.15)',animation:'pulseRing 1.5s ease-out .4s infinite' }} /></>}
          <button onClick={handlePress} disabled={processing||countdown!==null} style={{ width:80,height:80,borderRadius:'50%',border:'none',background:recording?'#D6B15E':'rgba(255,255,255,.15)',color:recording?'#4B4032':'#FFF9EE',fontSize:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:recording?'0 0 30px rgba(214,177,94,.4)':'none',transition:'all .2s' }}>
            {processing?<div style={{ width:30,height:30,border:'3px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',animation:'dnSpin .8s linear infinite' }} />:'🎙️'}
          </button>
        </div>
        <div style={{ fontSize:13,color:'rgba(255,255,255,.5)',fontWeight:600 }}>{recording?'Tap again to stop':'Tap to start speaking'}</div>
      </div>
    </div>
  )
}
