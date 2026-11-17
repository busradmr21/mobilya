import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, UploadCloud, Layers, Sparkles, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import type { Banner } from '../../types';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'slider' | 'concept'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Koleksiyonu Keşfet',
    buttonLink: '/urunler',
    imageUrl: '',
    imageAlt: '',
    location: 'slider',
    sortOrder: 0,
    isPublished: true,
  });

  const loadData = () => {
    setLoading(true);
    adminApi.getBanners()
      .then(setBanners)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = (defaultLocation: 'slider' | 'concept' = 'slider') => {
    setEditingBanner(null);
    setForm({
      title: '',
      subtitle: defaultLocation === 'concept' ? 'Konfor & Estetik' : '',
      buttonText: 'Koleksiyonu Keşfet',
      buttonLink: defaultLocation === 'concept' ? '/urunler/oturma-gruplari' : '/urunler',
      imageUrl: '',
      imageAlt: '',
      location: activeTab === 'concept' ? 'concept' : defaultLocation,
      sortOrder: (banners.filter((b) => (activeTab === 'concept' ? b.location === 'concept' : b.location !== 'concept')).length + 1),
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || '',
      buttonText: b.buttonText || '',
      buttonLink: b.buttonLink || '',
      imageUrl: b.imageUrl,
      imageAlt: b.imageAlt || '',
      location: b.location || 'slider',
      sortOrder: b.sortOrder,
      isPublished: b.isPublished,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadMedia(file);
      setForm((prev) => ({
        ...prev,
        imageUrl: res.url,
        imageAlt: prev.imageAlt || file.name.replace(/\.[^/.]+$/, ''),
      }));
    } catch {
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      alert('Başlık ve Görsel URL alanları zorunludur.');
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, form);
      } else {
        await adminApi.createBanner(form);
      }
      setModalOpen(false);
      loadData();
    } catch {
      alert('Kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu banner / konsepti silmek istediğinize emin misiniz?')) return;
    try {
      await adminApi.deleteBanner(id);
      loadData();
    } catch {
      alert('Silme işlemi başarısız.');
    }
  };

  const sliderBanners = banners.filter((b) => b.location !== 'concept');
  const conceptBanners = banners.filter((b) => b.location === 'concept');

  const filteredBanners =
    activeTab === 'slider'
      ? sliderBanners
      : activeTab === 'concept'
      ? conceptBanners
      : banners;

  return (
    <div>
      {/* Sayfa Başlığı */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Banner & Görsel Vitrin Yönetimi</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Ana sayfa üst slider'ını ve "Eviniz İçin Yaşam Alanları" (Oda Konseptleri) görsellerini yönetin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => openCreateModal('concept')} className="btn btn-outline" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent-dark)' }}>
            <Sparkles size={16} /> Yeni Yaşam Alanı / Konsept Ekle
          </button>
          <button onClick={() => openCreateModal('slider')} className="btn btn-primary">
            <Plus size={18} /> Yeni Slider Banner Ekle
          </button>
        </div>
      </div>

      {/* Sekmeler / Filtreler */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'all' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'all' ? '#fff' : 'var(--color-text-main)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
          }}
        >
          Tümü ({banners.length})
        </button>
        <button
          onClick={() => setActiveTab('slider')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'slider' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'slider' ? '#fff' : 'var(--color-text-main)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
          }}
        >
          <Layers size={14} /> Ana Slider ({sliderBanners.length})
        </button>
        <button
          onClick={() => setActiveTab('concept')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'concept' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'concept' ? '#fff' : 'var(--color-text-main)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={14} /> Yaşam Alanları (Oda Konseptleri) ({conceptBanners.length})
        </button>
      </div>

      {/* Tablo */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Yükleniyor...</div>
        ) : filteredBanners.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Bu filtrede kayıtlı içerik bulunamadı.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Görsel</th>
                  <th>Konum / Alan</th>
                  <th>Başlık</th>
                  <th>Etiket / Alt Başlık</th>
                  <th>Yönlendirme Linki</th>
                  <th>Sıralama</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ width: '85px', height: '50px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--color-bg-subtle)' }}>
                        <img src={b.imageUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td>
                      {b.location === 'concept' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(197, 155, 39, 0.16)',
                            color: '#92610d',
                          }}
                        >
                          <Sparkles size={12} /> Yaşam Alanı (Oda)
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(0, 135, 121, 0.12)',
                            color: '#008779',
                          }}
                        >
                          <Layers size={12} /> Ana Slider
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.title}</td>
                    <td style={{ color: 'var(--color-text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.subtitle || '-'}
                    </td>
                    <td>
                      {b.buttonLink ? (
                        <a href={b.buttonLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                          {b.buttonText || 'Link'} <ExternalLink size={12} />
                        </a>
                      ) : '-'}
                    </td>
                    <td>{b.sortOrder}</td>
                    <td>
                      <span className={`badge ${b.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {b.isPublished ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button onClick={() => openEditModal(b)} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.6rem' }}>
                          <Edit2 size={14} /> Düzenle
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.5rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingBanner
                  ? form.location === 'concept'
                    ? 'Oda Konseptini Düzenle'
                    : 'Slider Bannerını Düzenle'
                  : form.location === 'concept'
                  ? 'Yeni Yaşam Alanı (Oda Konsepti) Ekle'
                  : 'Yeni Slider Banner Ekle'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
              {/* Konum / Alan Seçimi */}
              <div className="form-group">
                <label className="form-label">Görünüm Alanı (Konum) *</label>
                <select
                  className="form-control"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  <option value="slider">Ana Slider (Sayfa Başı Geniş Banner)</option>
                  <option value="concept">Yaşam Alanları (Eviniz İçin Yaşam Alanları / Oda Konseptleri)</option>
                </select>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '0.3rem' }}>
                  {form.location === 'concept'
                    ? '📌 Bu görsel ana sayfadaki "Eviniz İçin Yaşam Alanları" kartlarında yayınlanacaktır.'
                    : '📌 Bu görsel ana sayfanın en üstündeki kayan ana vitrin sliderında yayınlanacaktır.'}
                </small>
              </div>

              {/* Başlık */}
              <div className="form-group">
                <label className="form-label">
                  {form.location === 'concept' ? 'Oda / Konsept Adı *' : 'Banner Başlığı *'}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={form.location === 'concept' ? 'Örn: Salon & Oturma Odası' : 'Örn: Zarif Yaşam Alanları'}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Alt Başlık / Etiket */}
              <div className="form-group">
                <label className="form-label">
                  {form.location === 'concept' ? 'Üst Etiket (Tag)' : 'Alt Başlık / Açıklama'}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={form.location === 'concept' ? 'Örn: Konfor & Estetik veya Sıcak Sofralar' : 'Örn: Doğal ahşap dokular ve modern çizgiler...'}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />
              </div>

              {/* Görsel Yükleme / URL */}
              <div className="form-group">
                <label className="form-label">Görsel (Dosyadan Yükle veya URL Gir) *</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://... veya /uploads/..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    required
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="btn btn-outline"
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <UploadCloud size={16} />
                    {uploadingImage ? 'Yükleniyor...' : 'Gözat...'}
                  </button>
                </div>

                {/* Önizleme */}
                {form.imageUrl && (
                  <div style={{ marginTop: '0.5rem', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                    <img src={form.imageUrl} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Buton ve Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Buton Metni</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: Koleksiyonu Keşfet"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yönlendirme Linki</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: /urunler/oturma-gruplari"
                    value={form.buttonLink}
                    onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                  />
                </div>
              </div>

              {/* Sıralama ve Yayın Durumu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Sıralama No</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem' }}>
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isPublished" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Yayında
                  </label>
                </div>
              </div>

              {/* Footer Butonları */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  İptal
                </button>
                <button type="submit" disabled={saving || uploadingImage} className="btn btn-primary">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
