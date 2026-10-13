 "use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Layers3, Menu, MessageCircle, MousePointer2, Palette, Sparkles, X, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Project = { id: string; title: string; category: string; description: string; image_url: string; featured?: boolean };
const demoProjects: Project[] = [
  { id: "p1", title: "Daily Rituals", category: "Beauty", description: "A calm, premium visual system for a beauty brand.", image_url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=85", featured: true },
  { id: "p2", title: "Kopi Sore", category: "F&B", description: "Warm, character-led content for a neighborhood coffee shop.", image_url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85" },
  { id: "p3", title: "Form Studio", category: "Fashion", description: "Editorial layouts built to make a collection feel considered.", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85", featured: true },
  { id: "p4", title: "Good Mood Club", category: "Lifestyle", description: "Playful social content with a confident color story.", image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85" },
  { id: "p5", title: "Studio Objects", category: "Branding", description: "Minimal product art direction with a crisp, modern finish.", image_url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85" },
  { id: "p6", title: "Sunday Table", category: "F&B", description: "Scroll-stopping food visuals with a fresh, human feel.", image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=85" }
];
const categories = ["Semua", "Branding", "F&B", "Beauty", "Fashion", "Lifestyle"];
const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890";
const waLink = (message: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [filter, setFilter] = useState("Semua");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [cursorGlow, setCursorGlow] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    if (supabase) {
      supabase.from("portfolio_projects").select("*").order("created_at", { ascending: false }).then(({ data }) => {
        if (data && data.length) setProjects(data as Project[]);
      });
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleProjects = useMemo(() => filter === "Semua" ? projects : projects.filter(p => p.category === filter), [filter, projects]);
  const faqs = [
    { q: "Bagaimana cara mulai bekerja sama?", a: "Klik tombol WhatsApp, ceritakan kebutuhan dan target brand kamu. Kami akan bantu menentukan arah visual, scope pekerjaan, dan timeline yang paling masuk akal." },
    { q: "Apakah bisa request desain sesuai identitas brand?", a: "Tentu. Kami mulai dari memahami karakter brand, audiens, dan tujuan konten supaya desain tetap konsisten, bukan sekadar terlihat bagus." },
    { q: "Apakah tersedia pengelolaan media sosial bulanan?", a: "Ya. Paket dapat mencakup perencanaan konten, desain feed, caption, kalender publikasi, hingga evaluasi performa sesuai kebutuhan." },
    { q: "Berapa lama proses pengerjaan?", a: "Timeline mengikuti jumlah aset dan kompleksitas brief. Estimasi dan jadwal akan dikonfirmasi sebelum proyek dimulai." }
  ];

  return (
    <main onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setCursorGlow({ x: ((e.clientX-r.left)/r.width)*100, y: ((e.clientY-r.top)/r.height)*100 }); }}>
      <div className="ambient" style={{ background: `radial-gradient(500px circle at ${cursorGlow.x}% ${cursorGlow.y}%, rgba(67,139,255,.10), transparent 65%)` }} />
      <header className={`navbar ${scrolled ? "nav-scrolled" : ""}`}>
        <a href="#home" className="brand" aria-label="Adihansyahproduction home">
          <span className="brand-mark brand-image"><img src="/logo-adihansyah.png" alt="Logo Adihansyahproduction" /></span>
          <span className="brand-copy">adihansyah<span>production</span></span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#work" onClick={() => setMenuOpen(false)}>Portofolio</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Layanan</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>Cara Kerja</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Kontak</a>
        </nav>
        <a className="nav-cta" href={waLink("Halo Adihansyahproduction, saya ingin konsultasi proyek.")} target="_blank" rel="noreferrer">Mulai Proyek <ArrowUpRight size={15}/></a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
      </header>

      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> INDEPENDENT CREATIVE STUDIO <span className="eyebrow-line"/></div>
          <h1>Make your brand<br/> <span className="outline-text">impossible</span> to<br/><span className="blue-text">ignore.</span></h1>
          <p className="hero-description">Kami mengubah ide menjadi visual yang punya arah, karakter, dan alasan untuk diingat. Untuk brand yang siap tampil lebih serius.</p>
          <div className="hero-actions">
            <a className="button-primary" href="#work">Jelajahi Karya <ArrowDownRight size={17}/></a>
            <a className="button-quiet" href={waLink("Halo, saya ingin diskusi tentang kebutuhan desain dan social media brand saya.")} target="_blank" rel="noreferrer"><span className="play-icon"><MessageCircle size={15}/></span> Diskusi ide kamu</a>
          </div>
          <div className="hero-proof"><div className="proof-avatars"><span>A</span><span>✳</span><span>◉</span></div><div><strong>Built for brands with ambition.</strong><small>Strategi • Desain • Konsistensi</small></div></div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline"><span>SELECTED VISUALS / 001</span><span>CREATIVE DIRECTION ↗</span></div>
          <div className="hero-art">
            <div className="art-grid"/>
            <div className="art-orb orb-one"/><div className="art-orb orb-two"/>
            <div className="art-card card-back"><span>BRAND<br/>SYSTEM</span><div className="mini-bars"><i/><i/><i/></div></div>
            <div className="art-card card-front"><div className="card-kicker">VISUAL IDENTITY / 2026</div><div className="card-word">CREATE<br/><em>with</em><br/>INTENT.</div><div className="card-bottom"><span>ADH® STUDIO</span><span>01 — 04</span></div></div>
            <div className="floating-tag tag-a"><Palette size={14}/> Art direction</div><div className="floating-tag tag-b"><span className="tag-dot"/> Design with purpose</div>
            <div className="crosshair cross-a">+</div><div className="crosshair cross-b">+</div>
          </div>
          <div className="visual-caption"><span>01 / CREATIVE THAT CONNECTS</span><span>JAKARTA · INDONESIA</span></div>
        </div>
        <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><div className="scroll-line"><i/></div><span>EST. FOR WHAT'S NEXT</span></div>
      </section>

      <section className="marquee" aria-label="Our focus"><div className="marquee-track">{Array.from({length:2}).map((_,i)=><span key={i}>SOCIAL MEDIA <b>✳</b> VISUAL IDENTITY <b>✳</b> CONTENT DESIGN <b>✳</b> CREATIVE DIRECTION <b>✳</b> BRAND EXPERIENCE <b>✳</b></span>)}</div></section>

      <section className="work-section section-wrap" id="work">
        <div className="section-heading"><div><div className="eyebrow"><span className="section-number">01</span> SELECTED WORK</div><h2>Good design gets noticed.<br/><span className="muted-heading">Great design gets remembered.</span></h2></div><p>Setiap visual punya tujuan. Ini adalah gambaran bagaimana strategi dan kreativitas bertemu dalam satu cerita brand.</p></div>
        <div className="filter-row">{categories.map(c=><button key={c} className={filter===c?"filter active":"filter"} onClick={()=>setFilter(c)}>{c}</button>)}<span className="project-count">{String(visibleProjects.length).padStart(2,"0")} PROJECTS</span></div>
        <div className="project-grid">
          {visibleProjects.map((p,i)=><a href={waLink(`Halo Adihansyahproduction, saya tertarik dengan konsep portofolio "${p.title}". Bisa diskusi untuk brand saya?`)} target="_blank" rel="noreferrer" className={`project-card ${i%3===0?"project-tall":""}`} key={p.id}>
            <div className="project-image" style={{backgroundImage:`url("${p.image_url}")`}}><div className="project-image-shade"/><span className="project-index">0{i+1} / {p.category.toUpperCase()}</span><span className="project-open"><ArrowUpRight size={19}/></span><span className="project-image-label">{p.title}</span></div>
            <div className="project-meta"><div><h3>{p.title}</h3><p>{p.description}</p></div><span className="project-arrow"><ArrowUpRight size={17}/></span></div>
          </a>)}
        </div>
        <div className="portfolio-note"><Sparkles size={16}/><span>Ini adalah contoh visual untuk preview. Portofolio asli bisa ditambahkan melalui panel admin setelah Supabase dikonfigurasi.</span><a href="/admin">Buka panel admin <ArrowRight size={14}/></a></div>
      </section>

      <section className="services-section" id="services"><div className="section-wrap">
        <div className="section-heading"><div><div className="eyebrow"><span className="section-number">02</span> WHAT WE DO</div><h2>Built to look good.<br/><span className="muted-heading">Designed to work.</span></h2></div><p>Kreativitas yang terarah, dibuat untuk membantu brand tampil konsisten dan membangun koneksi dengan audiensnya.</p></div>
        <div className="service-grid">
          <article className="service-card"><div className="service-top"><span>01</span><Layers3 size={22}/></div><h3>Social Media<br/>Management</h3><p>Strategi konten bulanan yang menjaga komunikasi brand tetap konsisten dan relevan.</p><ul><li><Check size={14}/> Content planning</li><li><Check size={14}/> Kalender konten</li><li><Check size={14}/> Evaluasi performa</li></ul><a href={waLink("Halo, saya tertarik dengan layanan Social Media Management. Mohon info paket dan harganya.")} target="_blank" rel="noreferrer">Diskusikan layanan <ArrowUpRight size={15}/></a></article>
          <article className="service-card service-featured"><div className="service-top"><span>02</span><Palette size={22}/></div><div className="popular-label">MOST REQUESTED <Sparkles size={12}/></div><h3>Instagram Feed<br/>Design</h3><p>Feed yang rapi, punya karakter, dan menyampaikan pesan brand dalam sekali lihat.</p><ul><li><Check size={14}/> Desain feed & carousel</li><li><Check size={14}/> Konsistensi visual</li><li><Check size={14}/> Arah kreatif</li></ul><a href={waLink("Halo, saya tertarik dengan layanan Instagram Feed Design. Mohon info paket dan harganya.")} target="_blank" rel="noreferrer">Diskusikan layanan <ArrowUpRight size={15}/></a></article>
          <article className="service-card"><div className="service-top"><span>03</span><Zap size={22}/></div><h3>Visual Branding<br/>& Campaign</h3><p>Bangun tampilan visual yang lebih solid untuk peluncuran, promosi, atau identitas brand.</p><ul><li><Check size={14}/> Visual direction</li><li><Check size={14}/> Campaign assets</li><li><Check size={14}/> Brand consistency</li></ul><a href={waLink("Halo, saya tertarik dengan layanan Visual Branding & Campaign. Bisa konsultasi?")} target="_blank" rel="noreferrer">Diskusikan layanan <ArrowUpRight size={15}/></a></article>
        </div>
      </div></section>

      <section className="process-section section-wrap" id="process"><div className="process-intro"><div className="eyebrow"><span className="section-number">03</span> SIMPLE, CLEAR, COLLABORATIVE</div><h2>Good work starts<br/>with a <span className="blue-text">good process.</span></h2><p>Proses yang jelas bikin kolaborasi lebih nyaman. Kamu selalu tahu apa yang sedang dikerjakan dan langkah berikutnya.</p><a className="text-link" href={waLink("Halo, saya ingin mulai proyek bersama Adihansyahproduction.")} target="_blank" rel="noreferrer">Let's work together <ArrowUpRight size={16}/></a></div>
        <div className="steps">{[{n:"01",t:"Discover",d:"Kami memahami kebutuhan, karakter brand, target audiens, dan tujuan proyek."},{n:"02",t:"Define",d:"Menyusun brief, arah visual, deliverables, timeline, dan penawaran yang jelas."},{n:"03",t:"Design",d:"Konsep dikembangkan menjadi desain. Kamu memberi masukan melalui tahap revisi."},{n:"04",t:"Deliver",d:"File final diserahkan sesuai format dan aset yang sudah disepakati."}].map(s=><div className="step" key={s.n}><span className="step-number">{s.n}</span><div><h3>{s.t}</h3><p>{s.d}</p></div><ArrowUpRight size={16}/></div>)}</div>
      </section>

      <section className="faq-section"><div className="section-wrap faq-layout"><div><div className="eyebrow"><span className="section-number">04</span> FAQ</div><h2>Questions?<br/><span className="muted-heading">We've got you.</span></h2><p>Belum yakin harus mulai dari mana? Cek beberapa hal yang sering ditanyakan.</p></div><div className="faq-list">{faqs.map((f,i)=><div className={`faq-item ${faqOpen===i?"faq-active":""}`} key={f.q}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)}><span>{f.q}</span><ChevronDown size={18}/></button>{faqOpen===i&&<p>{f.a}</p>}</div>)}</div></div></section>

      <section className="contact-section section-wrap" id="contact"><div className="contact-card"><div className="contact-glow"/><div className="eyebrow"><span className="status-dot"/> HAVE A PROJECT IN MIND?</div><h2>Let's make<br/><span>something matter.</span></h2><p>Ceritakan ide kamu. Kita cari cara terbaik untuk membuat brand-mu tampil beda.</p><a className="button-light" href={waLink("Halo Adihansyahproduction! Saya ingin konsultasi proyek.\n\nNama brand:\nLayanan yang dibutuhkan:\nTarget / tujuan:\nPerkiraan timeline:")} target="_blank" rel="noreferrer"><MessageCircle size={17}/> Mulai percakapan di WhatsApp <ArrowUpRight size={16}/></a><div className="contact-decoration">ADH®<br/><span>CREATIVE STUDIO</span></div></div></section>

      <footer className="footer section-wrap"><a href="#home" className="brand"><span className="brand-mark brand-image"><img src="/logo-adihansyah.png" alt="Logo Adihansyahproduction" /></span><span className="brand-copy">adihansyah<span>production</span></span></a><span className="footer-note">Independent creative studio · Made with intention.</span><div className="footer-links"><a href="#work">Work</a><a href="#services">Services</a><a href={waLink("Halo Adihansyahproduction!")} target="_blank" rel="noreferrer">WhatsApp ↗</a></div><span className="copyright">© {new Date().getFullYear()} ADIHANSYAHPRODUCTION</span></footer>
      <a className="whatsapp-float" href={waLink("Halo Adihansyahproduction, saya ingin konsultasi proyek.")} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp"><MessageCircle size={21}/></a>
    </main>
  );
}
