import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

const Toggle = ({ on, onToggle }: { on:boolean; onToggle:()=>void }) => (
  <div onClick={onToggle} style={{ width:48,height:28,borderRadius:14,background:on?'#A8CFA0':'rgba(75,64,50,.15)',position:'relative',cursor:'pointer',transition:'background .2s' }}>
    <div style={{ position:'absolute',top:3,left:on?23:3,width:22,height:22,borderRadius:'50%',background:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,.15)',transition:'left .2s' }} />
  </div>
)

export default function Onboarding() {
  const navigate = useNavigate()
  const { lang, setLang } = useAppStore()
  const [camera, setCamera] = useState(true)
  const [mic, setMic] = useState(true)
  const [offline, setOffline] = useState(false)
  const [step, setStep] = useState(0)

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'#FFF9EE',color:'#4B4032',display:'flex',flexDirection:'column' }}>
      <div style={{ padding:'52px 24px 0',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div style={{ display:'flex',gap:6 }}>
          {[0,1,2,3].map(i=><div key={i} style={{ width:i<=step?24:8,height:8,borderRadius:4,background:i<=step?'#4B4032':'rgba(75,64,50,.15)',transition:'all .3s' }} />)}
        </div>
        <button onClick={()=>navigate('/dashboard')} style={{ border:'none',background:'none',color:'#7A736B',fontWeight:600,fontSize:14,cursor:'pointer' }}>{lang==='EN'?'Skip':'Laktawan'}</button>
      </div>
      <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 24px',gap:28 }}>
        {step===0&&<div style={{ textAlign:'center',animation:'fadeIn .4s' }}>
          <div style={{ width:96,height:96,borderRadius:'50%',background:'radial-gradient(circle at 35% 30%,#FFFDF6,#D6B15E)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',animation:'dnBob 4s ease-in-out infinite',boxShadow:'0 16px 30px -10px rgba(214,177,94,.7)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4B4032" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5V6.5A2.5 2.5 0 0 1 6.5 4H18a1 1 0 0 1 1 1v13"/><path d="M6.5 16H19"/><path d="M6.5 16a2.5 2.5 0 0 0 0 5H19"/></svg>
          </div>
          <h1 style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:28,margin:'0 0 12px' }}>Welcome to Dunong!</h1>
          <p style={{ color:'#7A736B',fontSize:15,lineHeight:1.5 }}>Your AI recitation coach</p>
        </div>}
        {step===1&&<div style={{ width:'100%',animation:'fadeIn .4s' }}>
          <h2 style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:24,marginBottom:20,textAlign:'center' }}>Choose your language</h2>
          {(['FIL','EN'] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderRadius:18,border:lang===l?'2px solid #4B4032':'1.5px solid rgba(75,64,50,.15)',background:lang===l?'rgba(75,64,50,.04)':'#fff',marginBottom:12,cursor:'pointer' }}>
              <span style={{ fontWeight:700,fontSize:16 }}>{l==='FIL'?'Filipino':'English'}</span>
              {lang===l&&<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B4032" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
            </button>
          ))}
        </div>}
        {step===2&&<div style={{ width:'100%',animation:'fadeIn .4s' }}>
          <h2 style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:24,marginBottom:8,textAlign:'center' }}>Allow permissions</h2>
          <p style={{ color:'#7A736B',fontSize:14,textAlign:'center',marginBottom:24 }}>Needed for scanning and recitation</p>
          {[{label:'Camera',sub:'Scan your printed modules',on:camera,set:setCamera},{label:'Microphone',sub:'Record your recitation',on:mic,set:setMic},{label:'Offline Download',sub:'Practice without internet',on:offline,set:setOffline}].map(p=>(
            <div key={p.label} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0',borderBottom:'1px solid rgba(75,64,50,.07)' }}>
              <div><div style={{ fontWeight:700,fontSize:15 }}>{p.label}</div><div style={{ fontSize:12.5,color:'#7A736B',marginTop:2 }}>{p.sub}</div></div>
              <Toggle on={p.on} onToggle={()=>p.set(!p.on)} />
            </div>
          ))}
        </div>}
        {step===3&&<div style={{ textAlign:'center',animation:'fadeIn .4s' }}>
          <div style={{ width:80,height:80,borderRadius:'50%',background:'#A8CFA0',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h1 style={{ fontFamily:"'Bricolage Grotesque'",fontWeight:800,fontSize:28,margin:'0 0 12px' }}>You're all set!</h1>
          <p style={{ color:'#7A736B',fontSize:15,lineHeight:1.5 }}>Point your camera at a printed module to begin.</p>
        </div>}
      </div>
      <div style={{ padding:'0 24px 44px',display:'flex',gap:12 }}>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ flex:1,height:54,borderRadius:999,border:'1.5px solid rgba(75,64,50,.16)',background:'transparent',color:'#4B4032',fontWeight:700,fontSize:15,cursor:'pointer' }}>Back</button>}
        <button onClick={()=>step<3?setStep(s=>s+1):navigate('/dashboard')} style={{ flex:2,height:54,borderRadius:999,border:'none',background:'#4B4032',color:'#FFF9EE',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 14px 26px -12px rgba(75,64,50,.7)' }}>
          {step===3?(lang==='EN'?'Start Practicing':'Simulan ang Pagsasanay'):'Continue'}
        </button>
      </div>
    </div>
  )
}
