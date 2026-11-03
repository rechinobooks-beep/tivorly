import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const container = document.getElementById('root')
const root = createRoot(container)

function showStartupError(error, source = 'Application startup') {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error')
  root.render(
    React.createElement(
      'main',
      {
        style: {
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: '40px 22px',
          display: 'grid',
          placeItems: 'center',
          background: '#0b1220',
          color: '#e5e7eb',
          fontFamily: 'system-ui, sans-serif',
        },
      },
      React.createElement(
        'section',
        {
          style: {
            width: 'min(100%, 680px)',
            padding: '28px',
            border: '1px solid #334155',
            borderRadius: '18px',
            background: '#111c2e',
          },
        },
        React.createElement('p', { style: { color: '#93c5fd', fontWeight: 700 } }, 'TIVORLY · DIAGNÓSTICO'),
        React.createElement('h1', { style: { fontSize: '26px', margin: '8px 0 12px' } }, 'Não foi possível carregar a página'),
        React.createElement('p', { style: { color: '#cbd5e1', lineHeight: 1.6 } }, 'A aplicação encontrou um erro durante o arranque. Os detalhes abaixo ajudam a identificar o problema.'),
        React.createElement('p', { style: { color: '#fca5a5', overflowWrap: 'anywhere' } }, source + ': ' + message),
        React.createElement('a', { href: 'mailto:tivorly.contact@gmail.com?subject=%5BTivorly%5D%20Erro%20no%20arranque', style: { display: 'inline-block', marginTop: '12px', marginRight: '10px', padding: '11px 18px', borderRadius: '10px', background: '#263449', color: 'white', textDecoration: 'none', fontWeight: 700 } }, 'Comunicar problema'),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          style: {
            marginTop: '12px',
            padding: '11px 18px',
            border: 0,
            borderRadius: '10px',
            background: '#2563eb',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          },
        }, 'Tentar novamente'),
      ),
    ),
  )
}

async function startApp() {
  try {
    const { default: App } = await import('./App.jsx')
    root.render(React.createElement(React.StrictMode, null, React.createElement(App)))
  } catch (error) {
    showStartupError(error, 'Arranque do Tivorly')
  }
}

startApp()
