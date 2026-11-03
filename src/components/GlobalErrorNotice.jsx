import React, { Component, useEffect, useState } from 'react'

const SUPPORT_EMAIL = 'tivorly.contact@gmail.com'

function safeMessage(value) {
  const raw = value instanceof Error ? value.message : String(value ?? 'Erro desconhecido')
  return raw
    .replace(/sb_(publishable|secret)_[A-Za-z0-9_-]+/gi, '[chave ocultada]')
    .replace(/eyJ[A-Za-z0-9_-]{20,}/g, '[token ocultado]')
    .slice(0, 500)
}

function reportUrl(message, source) {
  const page = window.location.origin + window.location.pathname
  const body = [
    'Olá, equipa Tivorly.',
    '',
    'Quero comunicar um problema no site.',
    '',
    'Descrição técnica:',
    'Origem: ' + source,
    'Erro: ' + safeMessage(message),
    'Página: ' + page,
    'Data: ' + new Date().toISOString(),
    'Navegador: ' + navigator.userAgent.slice(0, 250),
    '',
    'Não incluí palavras-passe, textos escritos nem ficheiros pessoais.'
  ].join('\n')
  return 'mailto:' + SUPPORT_EMAIL + '?subject=' + encodeURIComponent('[Tivorly] Relato de problema') + '&body=' + encodeURIComponent(body)
}

export class TivorlyErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Tivorly interface error:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const message = safeMessage(this.state.error)
    return (
      <main style={{minHeight:'100vh',boxSizing:'border-box',padding:'32px 20px',display:'grid',placeItems:'center',background:'#0b1220',color:'#e5e7eb',fontFamily:'system-ui,sans-serif'}}>
        <section style={{width:'min(100%,620px)',padding:28,border:'1px solid #334155',borderRadius:18,background:'#111c2e'}}>
          <p style={{color:'#93c5fd',fontWeight:700}}>TIVORLY · PROTEÇÃO</p>
          <h1 style={{fontSize:25}}>Esta parte do Tivorly encontrou um problema</h1>
          <p style={{color:'#cbd5e1',lineHeight:1.6}}>O erro foi isolado para evitar que a aplicação inteira deixe de funcionar. Podes tentar novamente ou comunicar o problema à nossa equipa.</p>
          <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',padding:12,borderRadius:10,background:'#0b1220',color:'#fca5a5',fontSize:12}}>{message}</pre>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>
            <button onClick={()=>window.location.reload()} style={{padding:'11px 16px',border:0,borderRadius:10,background:'#4f46e5',color:'#fff',fontWeight:700}}>Tentar novamente</button>
            <a href={reportUrl(message,'Erro de interface')} style={{padding:'11px 16px',borderRadius:10,background:'#263449',color:'#fff',textDecoration:'none',fontWeight:700}}>Comunicar problema</a>
          </div>
        </section>
      </main>
    )
  }
}

export default function GlobalErrorNotice({ pt = true }) {
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const onError = (event) => {
      setNotice({ message: safeMessage(event.error || event.message), source: 'Erro JavaScript' })
    }
    const onRejection = (event) => {
      setNotice({ message: safeMessage(event.reason), source: 'Operação assíncrona' })
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  if (!notice) return null
  const link = reportUrl(notice.message, notice.source)
  return (
    <aside role="alert" aria-live="assertive" style={{position:'fixed',right:16,bottom:16,zIndex:1000,width:'min( calc(100% - 32px), 420px)',padding:16,border:'1px solid #9f5555',borderRadius:14,background:'#211923',color:'#fff',boxShadow:'0 16px 50px #0008'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start'}}>
        <strong>{pt ? 'Ocorreu um problema' : 'Something went wrong'}</strong>
        <button onClick={()=>setNotice(null)} aria-label={pt?'Fechar':'Close'} style={{background:'transparent',border:0,color:'#fff',fontSize:20,cursor:'pointer'}}>×</button>
      </div>
      <p style={{fontSize:13,lineHeight:1.5,color:'#e5caca',overflowWrap:'anywhere'}}>{pt?'Uma operação encontrou um erro. O resto do site pode continuar disponível.':'An operation encountered an error. The rest of the site may still be available.'}</p>
      <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
        <a href={link} style={{padding:'9px 12px',borderRadius:9,background:'#b45353',color:'#fff',textDecoration:'none',fontSize:12,fontWeight:700}}>{pt?'Comunicar problema':'Report problem'}</a>
        <button onClick={()=>window.location.reload()} style={{padding:'9px 12px',borderRadius:9,border:'1px solid #70515a',background:'transparent',color:'#fff',fontSize:12,cursor:'pointer'}}>{pt?'Recarregar':'Reload'}</button>
      </div>
    </aside>
  )
}
