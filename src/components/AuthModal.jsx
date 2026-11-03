import React, { useState } from 'react'
import { X, Mail, Lock, UserRound, ArrowLeft, Star, History, Settings, ShieldCheck, Cookie } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

export default function AuthModal({pt,session,onClose,onSignOut,notice,setNotice,onNavigate,favoritesCount=0}){
 const [mode,setMode]=useState('login')
 const [name,setName]=useState('')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 const APP_URL='https://rechinobooks-beep.github.io/tivorly/'
 const label=pt?{login:'Entrar na tua conta',signup:'Criar conta Tivorly',forgot:'Recuperar palavra-passe',update:'Definir nova palavra-passe'}:{login:'Sign in to your account',signup:'Create a Tivorly account',forgot:'Reset your password',update:'Set a new password'}
 const clear=()=>{setMessage('');setError('');setNotice?.('')}
 const run=async(e)=>{e.preventDefault();clear();if(!isSupabaseConfigured){setError(pt?'A ligação ao Supabase ainda não está configurada no GitHub.':'Supabase connection is not configured in GitHub yet.');return}setBusy(true)
 try{
  if(mode==='signup'){const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name.trim()},emailRedirectTo:APP_URL}});if(error)throw error;setMessage(pt?'Conta criada. Verifica o teu e-mail para confirmar o registo.':'Account created. Check your email to confirm your registration.')}
  else if(mode==='login'){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;onClose()}
  else if(mode==='forgot'){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:APP_URL});if(error)throw error;setMessage(pt?'Se o endereço estiver registado, receberás um e-mail com instruções.':'If the address is registered, you will receive an email with instructions.')}
  else if(mode==='update'){const {error}=await supabase.auth.updateUser({password});if(error)throw error;setMessage(pt?'Palavra-passe atualizada com sucesso.':'Password updated successfully.')}
 }catch(err){setError(err.message|| (pt?'Ocorreu um erro.':'Something went wrong.'))}finally{setBusy(false)}
 }
 if(session)return <div className="auth-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="auth-modal"><button className="auth-close" onClick={onClose} aria-label="Close"><X/></button><span className="auth-eyebrow">TIVORLY ACCOUNT</span><h2>{pt?'A tua conta':'Your account'}</h2><p className="auth-muted">{session.user.user_metadata?.display_name||session.user.email?.split('@')[0]}</p><p className="auth-muted">{session.user.email}</p><div className="account-menu"><button onClick={()=>onNavigate?.('favorites')}><span><Star size={17}/>{pt?'Favoritos':'Favorites'}</span><small>{favoritesCount}</small></button><button onClick={()=>onNavigate?.('history')}><span><History size={17}/>{pt?'Histórico de atividade':'Activity history'}</span><ArrowLeft size={15}/></button><button onClick={()=>onNavigate?.('settings')}><span><Settings size={17}/>{pt?'Configurações':'Settings'}</span><ArrowLeft size={15}/></button><button onClick={()=>onNavigate?.('privacy')}><span><ShieldCheck size={17}/>{pt?'Privacidade e política':'Privacy policy'}</span><ArrowLeft size={15}/></button><button onClick={()=>onNavigate?.('cookies')}><span><Cookie size={17}/>{pt?'Política de cookies':'Cookie policy'}</span><ArrowLeft size={15}/></button><button onClick={()=>onNavigate?.('terms')}><span><Lock size={17}/>{pt?'Termos de utilização':'Terms of use'}</span><ArrowLeft size={15}/></button></div><button className="primary auth-submit" onClick={async()=>{await onSignOut();onClose()}}>{pt?'Terminar sessão':'Sign out'}</button></section></div>
 return <div className="auth-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-close" onClick={onClose} aria-label="Close"><X/></button>{mode!=='login'&&<button className="auth-back" onClick={()=>{clear();setMode('login')}}><ArrowLeft size={15}/>{pt?'Voltar':'Back'}</button>}<span className="auth-eyebrow">SMART TOOLS. SIMPLE SOLUTIONS.</span><h2 id="auth-title">{label[mode]}</h2><p className="auth-muted">{pt?'Acede às tuas preferências e ferramentas guardadas.':'Access your preferences and saved tools.'}</p>
 <form onSubmit={run}>{mode==='signup'&&<label><UserRound size={16}/><input value={name} onChange={e=>setName(e.target.value)} placeholder={pt?'Nome de apresentação':'Display name'} maxLength={60} required/></label>}<label><Mail size={16}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" autoComplete="email" required/></label>{mode!=='forgot'&&<label><Lock size={16}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={pt?'Palavra-passe':'Password'} autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} required/></label>}
 {mode==='login'&&<button type="button" className="auth-link" onClick={()=>{clear();setMode('forgot')}}>{pt?'Esqueceste a palavra-passe?':'Forgot password?'}</button>}
 <button className="primary auth-submit" type="submit" disabled={busy}>{busy?(pt?'A processar…':'Please wait…'):(mode==='login'?(pt?'Entrar':'Sign in'):mode==='signup'?(pt?'Criar conta':'Create account'):mode==='forgot'?(pt?'Enviar instruções':'Send instructions'):(pt?'Atualizar palavra-passe':'Update password'))}</button></form>
 {message&&<p className="auth-message">{message}</p>}{error&&<p className="auth-error">{error}</p>}
 {mode==='login'?<p className="auth-switch">{pt?'Ainda não tens conta?':'New to Tivorly?'} <button onClick={()=>{clear();setMode('signup')}}>{pt?'Criar conta':'Create account'}</button></p>:mode==='signup'?<p className="auth-switch">{pt?'Já tens conta?':'Already have an account?'} <button onClick={()=>{clear();setMode('login')}}>{pt?'Entrar':'Sign in'}</button></p>:null}
 <p className="auth-footnote">{pt?'Nunca partilhes a tua palavra-passe.':'Never share your password.'}</p></section></div>
}
