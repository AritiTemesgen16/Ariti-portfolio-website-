import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, LogIn, LogOut, Save, Upload, ShieldCheck, AlertCircle } from 'lucide-react';

export const OwnerPhotoPage: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshSession = async () => {
    const response = await fetch('/api/owner/session', { credentials: 'include' });
    const data = await response.json();
    setAuthenticated(Boolean(data.authenticated));
  };

  const refreshPhoto = async () => {
    const response = await fetch('/api/profile-photo/active', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.url) setCurrentPhoto(data.url);
    }
  };

  useEffect(() => {
    refreshSession().catch(() => undefined);
    refreshPhoto().catch(() => undefined);
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed.');
      setPassword(''); setAuthenticated(true); setMessage('Owner authentication successful.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally { setBusy(false); }
  };

  const chooseFile = (selected: File | null) => {
    setError(null); setMessage(null); setFile(null); setPreview(null);
    if (!selected) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(selected.type.toLowerCase())) { setError('Choose a JPEG, PNG, WebP, or GIF image.'); return; }
    if (selected.size > 5 * 1024 * 1024) { setError('The image must be 5 MB or smaller.'); return; }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const savePhoto = async () => {
    if (!file) return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read the selected image.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/profile-photo', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type, fileName: file.name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Photo upload failed.');
      setCurrentPhoto(data.url); setFile(null); setPreview(null); setMessage('Your profile photo has been saved permanently.');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally { setBusy(false); }
  };

  const logout = async () => {
    await fetch('/api/owner/logout', { method: 'POST', credentials: 'include' });
    setAuthenticated(false); setMessage(null); setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20"><ShieldCheck className="w-6 h-6 text-blue-400" /></div>
          <div><h1 className="text-xl font-bold">Owner Photo Management</h1><p className="text-xs text-slate-400">Private administration area</p></div>
        </div>

        {!authenticated ? (
          <form onSubmit={login} className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Owner password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500" />
            <button disabled={busy} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-3 font-semibold flex items-center justify-center gap-2"><LogIn className="w-4 h-4" />{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between"><span className="text-sm text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Authenticated</span><button onClick={logout} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><LogOut className="w-3.5 h-3.5" />Sign out</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {preview || currentPhoto ? <img src={preview || currentPhoto || ''} alt="Profile preview" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-500">No photo available</span>}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-slate-300">Choose the actual photo you want visitors to see. It will be stored in persistent Cloudinary storage.</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => chooseFile(e.target.files?.[0] || null)} className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200" />
                <button onClick={savePhoto} disabled={!file || busy} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-3 font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />{busy ? 'Saving...' : 'Save profile photo'}</button>
                <div className="text-[11px] text-slate-500 flex gap-2"><Upload className="w-3.5 h-3.5 shrink-0" />Maximum 5 MB. JPEG, PNG, WebP, or GIF.</div>
              </div>
            </div>
          </div>
        )}

        {message && <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm p-3 flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{message}</div>}
        {error && <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      </div>
    </main>
  );
};
