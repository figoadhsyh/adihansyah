
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  LogIn,
  LogOut,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  storage_path?: string;
  created_at?: string;
};

const categories = [
  "Branding",
  "F&B",
  "Beauty",
  "Fashion",
  "Lifestyle",
  "Other",
];

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

  const loadProjects = useCallback(async () => {
    const client = supabase;

    if (!client) {
      setMessage(
        "Supabase belum terhubung. Periksa environment variables di Vercel."
      );
      return;
    }

    try {
      const { data, error } = await client
        .from("portfolio_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Gagal memuat portofolio: ${error.message}`);
        return;
      }

      setProjects((data ?? []) as Project[]);
    } catch {
      setMessage("Koneksi gagal saat memuat portofolio.");
    }
  }, []);

  useEffect(() => {
    const client = supabase;

    if (!client) return;

    let active = true;

    client.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      const sessionExists = Boolean(data.session);
      setLoggedIn(sessionExists);

      if (sessionExists) {
        void loadProjects();
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const sessionExists = Boolean(session);
      setLoggedIn(sessionExists);

      if (sessionExists) {
        void loadProjects();
      } else {
        setProjects([]);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProjects]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      setMessage(
        "Supabase belum terhubung. Periksa URL dan API key di Vercel."
      );
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        setMessage(`Gagal mengirim link: ${error.message}`);
      } else {
        setMessage(
          "Permintaan login berhasil. Periksa email dan folder Spam untuk menemukan link masuk."
        );
      }
    } catch {
      setMessage(
        "Koneksi ke Supabase gagal. Periksa URL proyek, API key, dan koneksi internet."
      );
    } finally {
      setBusy(false);
    }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      setMessage("Supabase belum terhubung.");
      return;
    }

    if (!file || !title.trim()) {
      setMessage("Isi judul dan pilih gambar terlebih dahulu.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Ukuran gambar maksimal 8 MB.");
      return;
    }

    setBusy(true);
    setMessage("");

    let uploadedPath: string | null = null;

    try {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setMessage("Format gambar harus PNG, JPG, atau WEBP.");
        return;
      }

      const extension = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await client.storage
        .from("portfolio")
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setMessage(`Upload gagal: ${uploadError.message}`);
        return;
      }

      uploadedPath = path;

      const { data: publicData } = client.storage
        .from("portfolio")
        .getPublicUrl(path);

      const { error: insertError } = await client
        .from("portfolio_projects")
        .insert({
          title: title.trim(),
          category,
          description: description.trim(),
          image_url: publicData.publicUrl,
          storage_path: path,
        });

      if (insertError) {
        await client.storage.from("portfolio").remove([path]);
        uploadedPath = null;
        setMessage(`Gagal menyimpan data: ${insertError.message}`);
        return;
      }

      uploadedPath = null;
      setTitle("");
      setDescription("");
      setCategory("Branding");
      setFile(null);

      const input = document.getElementById(
        "portfolio-file"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      setMessage("Portofolio berhasil ditambahkan.");
      await loadProjects();
    } catch {
      if (uploadedPath) {
        await client.storage.from("portfolio").remove([uploadedPath]);
      }

      setMessage("Terjadi kesalahan saat mengunggah portofolio.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProject(project: Project) {
    const client = supabase;

    if (!client) {
      setMessage("Supabase belum terhubung.");
      return;
    }

    const confirmed = window.confirm(
      `Hapus portofolio "${project.title}"?`
    );

    if (!confirmed) return;

    setBusy(true);
    setMessage("");

    try {
      const { error } = await client
        .from("portfolio_projects")
        .delete()
        .eq("id", project.id);

      if (error) {
        setMessage(`Gagal menghapus: ${error.message}`);
        return;
      }

      if (project.storage_path) {
        const { error: storageError } = await client.storage
          .from("portfolio")
          .remove([project.storage_path]);

        if (storageError) {
          setMessage(
            "Data portofolio dihapus, tetapi file gambar gagal dihapus."
          );
          await loadProjects();
          return;
        }
      }

      setMessage("Portofolio berhasil dihapus.");
      await loadProjects();
    } catch {
      setMessage("Terjadi kesalahan saat menghapus portofolio.");
    } finally {
      setBusy(false);
    }
  }

  const supabaseClient = supabase;

  if (!supabaseClient) {
    return (
      <main className="admin-page">
        <div className="admin-shell">
          <Link href="/" className="admin-back">
            <ArrowLeft size={16} /> Kembali ke website
          </Link>

          <div className="admin-card">
            <div className="eyebrow">ADH® / ADMIN SETUP</div>
            <h1>
              Hubungkan <span>Supabase.</span>
            </h1>
            <p>
              Panel admin membutuhkan koneksi Supabase. Pastikan kedua
              environment variables sudah diatur di Vercel dan lakukan
              deployment ulang.
            </p>
            <code>
              NEXT_PUBLIC_SUPABASE_URL
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <Link href="/" className="admin-back">
          <ArrowLeft size={16} /> Kembali ke website
        </Link>

        <div className="admin-head">
          <div>
            <div className="eyebrow">ADH® / CONTENT STUDIO</div>
            <h1>
              Portfolio <span>manager.</span>
            </h1>
            <p>Kelola karya yang tampil di website Adihansyahproduction.</p>
          </div>

          {loggedIn && (
            <button
              type="button"
              className="admin-logout"
              disabled={busy}
              onClick={async () => {
                const client = supabase;

                if (!client) {
                  setMessage("Supabase belum terhubung.");
                  return;
                }

                const { error } = await client.auth.signOut();

                if (error) {
                  setMessage(`Gagal keluar: ${error.message}`);
                  return;
                }

                setLoggedIn(false);
                setProjects([]);
                setMessage("Kamu berhasil keluar.");
              }}
            >
              <LogOut size={15} /> Keluar
            </button>
          )}
        </div>

        {!loggedIn ? (
          <form className="admin-card login-card" onSubmit={signIn}>
            <div className="admin-icon">
              <LogIn size={22} />
            </div>

            <h2>Masuk ke panel admin</h2>
            <p>
              Masukkan email admin. Link masuk akan dikirim melalui email
              jika konfigurasi autentikasi Supabase sudah benar.
            </p>

            <label htmlFor="admin-email">Email admin</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
            />

            <button
              type="submit"
              className="button-primary admin-submit"
              disabled={busy}
            >
              {busy ? "Mengirim..." : "Kirim link masuk"}
              <LogIn size={16} />
            </button>

            {message && (
              <p className="admin-message" role="status">
                {message}
              </p>
            )}
          </form>
        ) : (
          <div className="admin-content">
            <form
              className="admin-card upload-card"
              onSubmit={upload}
            >
              <div className="admin-icon">
                <ImagePlus size={22} />
              </div>

              <h2>Tambah karya baru</h2>
              <p>Unggah gambar, lalu lengkapi informasi proyek.</p>

              <label htmlFor="project-title">Judul proyek</label>
              <input
                id="project-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                placeholder="Contoh: Kopi Sore — Social Campaign"
              />

              <label htmlFor="project-category">Kategori</label>
              <select
                id="project-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <label htmlFor="project-description">
                Deskripsi singkat
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ceritakan fokus dan tujuan desain..."
                rows={3}
              />

              <label className="file-drop" htmlFor="portfolio-file">
                <UploadCloud size={24} />
                <strong>
                  {file ? file.name : "Pilih gambar portofolio"}
                </strong>
                <span>PNG, JPG, WEBP · maks. 8 MB</span>
                <input
                  id="portfolio-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] ?? null;

                    if (
                      selectedFile &&
                      selectedFile.size > 8 * 1024 * 1024
                    ) {
                      setMessage("Ukuran file maksimal 8 MB.");
                      setFile(null);
                      event.target.value = "";
                      return;
                    }

                    setMessage("");
                    setFile(selectedFile);
                  }}
                  required
                />
              </label>

              <button
                type="submit"
                className="button-primary admin-submit"
                disabled={busy}
              >
                {busy ? "Memproses..." : "Upload portofolio"}
                <UploadCloud size={16} />
              </button>

              {message && (
                <p className="admin-message" role="status">
                  {message}
                </p>
              )}
            </form>

            <div className="admin-card project-manager">
              <div className="manager-heading">
                <div>
                  <h2>Karya tersimpan</h2>
                  <p>{projects.length} proyek di portofolio</p>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="empty-state">
                  <ImagePlus size={28} />
                  <p>Belum ada karya yang diunggah.</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div className="admin-project" key={project.id}>
                    <img
                      src={project.image_url}
                      alt={project.title}
                    />

                    <div>
                      <strong>{project.title}</strong>
                      <span>{project.category}</span>
                    </div>

                    <button
                      type="button"
                      aria-label={`Hapus ${project.title}`}
                      disabled={busy}
                      onClick={() => void removeProject(project)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
