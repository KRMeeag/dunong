import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../hooks/useCamera'
import { useAppStore } from '../store/appStore'
import { scanImage } from '../services/api'

export default function ScanModule() {
  const navigate = useNavigate()
  const { setScannedText } = useAppStore()
  const { videoRef, active, flashOn, start, stop, capture, toggleFlash } = useCamera()
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState('')
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { start(); return () => stop() }, [start, stop])

  const handleCapture = async () => {
    setScanning(true); setError('')
    try {
      const b64 = capture(); if (!b64) throw new Error('Could not capture image')
      const text = await scanImage(b64); setScanned(text); setEditText(text)
    } catch (e:any) { setError(e.message||'Scan failed') } finally { setScanning(false) }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setScanning(true); setError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const b64 = (ev.target?.result as string).split(',')[1]
        const text = await scanImage(b64); setScanned(text); setEditText(text)
      } catch (e:any) { setError(e.message||'Upload failed') } finally { setScanning(false) }
    }
    reader.readAsDataURL(file)
  }

  const handleLock = () => { setScannedText(editing?editText:scanned); navigate('/sipat') }

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',background:'#1a1612',overflow:'hidden' }}>
      <video ref={videoRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:active?1:0 }} playsInline muted />
      {!active&&<div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#7A736B',fontSize:14 }}>Camera not available</div>}
      <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,.45)' }} />
      <div style={{ position:'absolute',top:52,left:0,right:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',zIndex:10 }}>
        <button onClick={()=>{stop();navigate('/dashboard')}} style={{ width:40,height:40,borderRadius:'50%',border:'none',background:'rgba(255,255,255,.18)',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
        <div style={{ color:'#fff',fontWeight:700,fontSize:15 }}>Itutok sa teksto</div>
        <button onClick={toggleFlash} style={{ width:40,height:40,borderRadius:'50%',border:'none',background:flashOn?'#D6B15E':'rgba(255,255,255,.18)',color:flashOn?'#4B4032':'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>⚡</button>
      </div>
      {!scanned&&(
        <div style={{ position:'absolute',top:'22%',left:'8%',right:'8%',bottom:'35%',zIndex:5,border:'1.5px dashed rgba(214,177,94,.35)',borderRadius:8 }}>
          <div style={{ position:'absolute',top:0,left:0,width:24,height:24,borderTop:'3px solid #D6B15E',borderLeft:'3px solid #D6B15E',borderRadius:'4px 0 0 0' }} />
          <div style={{ position:'absolute',top:0,right:0,width:24,height:24,borderTop:'3px solid #D6B15E',borderRight:'3px solid #D6B15E',borderRadius:'0 4px 0 0' }} />
          <div style={{ position:'absolute',bottom:0,left:0,width:24,height:24,borderBottom:'3px solid #D6B15E',borderLeft:'3px solid #D6B15E',borderRadius:'0 0 0 4px' }} />
          <div style={{ position:'absolute',bottom:0,right:0,width:24,height:24,borderBottom:'3px solid #D6B15E',borderRight:'3px solid #D6B15E',borderRadius:'0 0 4px 0' }} />
        </div>
      )}
      {!scanned?(
        <div style={{ position:'absolute',bottom:0,left:0,right:0,zIndex:10,padding:'0 24px 44px',display:'flex',flexDirection:'column',alignItems:'center',gap:16 }}>
          {error&&<div style={{ background:'rgba(220,50,50,.9)',color:'#fff',padding:'10px 16px',borderRadius:12,fontSize:13,textAlign:'center' }}>{error}</div>}
          <div style={{ display:'flex',gap:16,alignItems:'center' }}>
            <button onClick={()=>fileRef.current?.click()} style={{ width:52,height:52,borderRadius:'50%',border:'2px solid rgba(255,255,255,.4)',background:'rgba(255,255,255,.15)',color:'#fff',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>📁</button>
            <button onClick={handleCapture} disabled={scanning||!active} style={{ width:76,height:76,borderRadius:'50%',border:'4px solid #fff',background:scanning?'#D6B15E':'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 2px rgba(255,255,255,.3)' }}>
              {scanning?<div style={{ width:28,height:28,border:'3px solid #4B4032',borderTopColor:'transparent',borderRadius:'50%',animation:'dnSpin .8s linear infinite' }} />:<div style={{ width:54,height:54,borderRadius:'50%',background:'#4B4032' }} />}
            </button>
            <div style={{ width:52 }} />
          </div>
          <div style={{ color:'rgba(255,255,255,.6)',fontSize:13 }}>{scanning?'Scanning…':'Tap to scan'}</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload} />
        </div>
      ):(
        <div style={{ position:'absolute',bottom:0,left:0,right:0,zIndex:10,background:'#FFF9EE',borderRadius:'28px 28px 0 0',padding:'20px 24px 36px' }}>
          <div style={{ width:40,height:4,borderRadius:2,background:'rgba(75,64,50,.2)',margin:'0 auto 16px' }} />
          <div style={{ fontWeight:800,fontSize:16,fontFamily:"'Bricolage Grotesque'",marginBottom:4 }}>Tama Ba? · Review Scanned Text</div>
          <div style={{ fontSize:12,color:'#7A736B',marginBottom:12 }}>Edit anything the scanner misread.</div>
          {editing?(
            <textarea value={editText} onChange={e=>setEditText(e.target.value)} style={{ width:'100%',height:120,padding:12,borderRadius:14,border:'1.5px solid #D6B15E',fontSize:13.5,lineHeight:1.5,resize:'none',background:'#FFFDF6',color:'#4B4032',fontFamily:"'Hanken Grotesk'",outline:'none' }} />
          ):(
            <div style={{ background:'#FFFDF6',borderRadius:14,padding:12,fontSize:13.5,lineHeight:1.6,color:'#4B4032',maxHeight:120,overflowY:'auto',border:'1px solid rgba(75,64,50,.07)',marginBottom:4 }}>{scanned}</div>
          )}
          <div style={{ display:'flex',gap:10,marginTop:12 }}>
            <button onClick={()=>setEditing(e=>!e)} style={{ flex:1,height:44,borderRadius:999,border:'1.5px solid rgba(75,64,50,.16)',background:'transparent',color:'#4B4032',fontWeight:700,fontSize:14,cursor:'pointer' }}>{editing?'Done':'✏️ Edit'}</button>
            <button onClick={()=>{setScanned('');setEditText('')}} style={{ flex:1,height:44,borderRadius:999,border:'1.5px solid rgba(75,64,50,.16)',background:'transparent',color:'#7A736B',fontWeight:700,fontSize:14,cursor:'pointer' }}>🔄 Rescan</button>
            <button onClick={handleLock} style={{ flex:2,height:44,borderRadius:999,border:'none',background:'#4B4032',color:'#FFF9EE',fontWeight:700,fontSize:14,cursor:'pointer' }}>Lock Context →</button>
          </div>
        </div>
      )}
    </div>
  )
}
