 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LogIn, LogOut, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Project = { id: string; title: string; category: string; description: string; image_url: string; storage_path?: string };
const cats = ["Branding", "F&B", "Beauty", "Fashion", "Lifestyle", "Other"];

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Branding");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadProjects() {
    if (!supabase) return;
    const { data } = await supabase.from("portfolio_projects").select("*").order("created_at", { ascending: false });
    setProjects((data || []) as Project[]);
  }
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setLoggedIn(!!data.session); if (data.session) loadProjects(); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setLoggedIn(!!session); if (session) loadProjects(); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/admin` : undefined } });
    setMessage(error ? error.message : "Link masuk sudah dikirim ke email. Buka email tersebut untuk masuk ke panel admin.");
    setBusy(false);
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !file || !title.trim()) { setMessage("Isi judul dan pilih gambar terlebih dahulu."); return; }
    setBusy(true); setMessage("");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) { setMessage(uploadError.message); setBusy(false); return; }
    const { data: publicData } = supabase.storage.from("portfolio").getPublicUrl(path);
    const { error: insertError } = await supabase.from("portfolio_projects").insert({ title, category, description, image_url: publicData.publicUrl, storage_path: path });
    if (insertError) {
      await supabase.storage.from("portfolio").remove([path]);
      setMessage(insertError.message);
    } else {
      setTitle(""); setDescription(""); setCategory("Branding"); setFile(null);
      const input = document.getElementById("portfolio-file") as HTMLInputElement | null; if (input) input.value = "";
      setMessage("Portofolio berhasil ditambahkan."); await loadProjects();
    }
    setBusy(false);
  }

  async function remove(p: Project) {
    if (!supabase || !confirm(`Hapus portofolio "${p.title}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from("portfolio_projects").delete().eq("id", p.id);
    if (!error && p.storage_path) await supabase.storage.from("portfolio").remove([p.storage_path]);
    setMessage(error ? error.message : "Portofolio dihapus."); await loadProjects(); setBusy(false);
  }

  if (!supabase) return <main className="admin-page"><div className="admin-shell"><Link href="/" className="admin-back"><ArrowLeft size={16}/> Kembali ke website</Link><div className="admin-card"><div className="eyebrow">ADH® / ADMIN SETUP</div><h1>Hubungkan <span>Supabase.</span></h1><p>Panel upload membutuhkan database dan storage Supabase. Ikuti petunjuk di README, lalu isi environment variables di Vercel atau file .env.local.</p><code>NEXT_PUBLIC_SUPABASE_URL<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></div></div></main>;

  return <main className="admin-page"><div className="admin-shell"><Link href="/" className="admin-back"><ArrowLeft size={16}/> Kembali ke website</Link><div className="admin-head"><div><div className="eyebrow">ADH® / CONTENT STUDIO</div><h1>Portfolio <span>manager.</span></h1><p>Kelola karya yang tampil di website Adihansyahproduction.</p></div>{loggedIn&&<button className="admin-logout" onClick={async()=>{await supabase.auth.signOut();setLoggedIn(false);}}><LogOut size={15}/> Keluar</button>}</div>
    {!loggedIn ? <form className="admin-card login-card" onSubmit={signIn}><div className="admin-icon"><LogIn size={22}/></div><h2>Masuk ke panel admin</h2><p>Masukkan email admin yang sudah diizinkan pada konfigurasi Supabase. Kami akan mengirimkan magic link.</p><label>Email admin</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com"/><button className="button-primary admin-submit" disabled={busy}>{busy?"Mengirim...":"Kirim link masuk"} <LogIn size={16}/></button>{message&&<p className="admin-message">{message}</p>}</form> :
    <div className="admin-content"><form className="admin-card upload-card" onSubmit={upload}><div className="admin-icon"><ImagePlus size={22}/></div><h2>Tambah karya baru</h2><p>Unggah gambar, lalu lengkapi informasi proyek.</p><label>Judul proyek</label><input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Contoh: Kopi Sore — Social Campaign"/><label>Kategori</label><select value={category} onChange={e=>setCategory(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select><label>Deskripsi singkat</label><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ceritakan fokus dan tujuan desain..." rows={3}/><label className="file-drop" htmlFor="portfolio-file"><UploadCloud size={24}/><strong>{file ? file.name : "Pilih gambar portofolio"}</strong><span>PNG, JPG, WEBP · maks. 8 MB</span><input id="portfolio-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0]||null;if(f&&f.size>8*1024*1024){setMessage("Ukuran file maksimal 8 MB.");setFile(null);return;}setFile(f);}} required/></label><button className="button-primary admin-submit" disabled={busy}>{busy?"Memproses...":"Upload portofolio"} <UploadCloud size={16}/></button>{message&&<p className="admin-message">{message}</p>}</form>
      <div className="admin-card project-manager"><div className="manager-heading"><div><h2>Karya tersimpan</h2><p>{projects.length} proyek di portofolio</p></div></div>{projects.length===0?<div className="empty-state"><ImagePlus size={28}/><p>Belum ada karya yang diunggah.</p></div>:projects.map(p=><div className="admin-project" key={p.id}><img src={p.image_url} alt={p.title}/><div><strong>{p.title}</strong><span>{p.category}</span></div><button aria-label={`Hapus ${p.title}`} onClick={()=>remove(p)}><Trash2 size={16}/></button></div>)}</div></div>}
    </div></main>;
}
