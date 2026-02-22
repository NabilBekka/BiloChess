'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import VerifyEmailModal from '@/components/VerifyEmailModal';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import styles from './settings.module.css';

export default function Settings() {
  const { user, updateUser, deleteAccount, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    firstname: '', lastname: '', username: '', email: '', birthDate: '',
    currentPassword: '', newPassword: '', deletePassword: ''
  });
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });
  const [deleteMsg, setDeleteMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (loading) return null;
  if (!user) { router.push('/'); return null; }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateMsg({ type: '', text: '' });
    if (!form.currentPassword) {
      setUpdateMsg({ type: 'error', text: 'Mot de passe actuel requis' });
      return;
    }
    setSaving(true);
    const data = { currentPassword: form.currentPassword };
    if (form.firstname) data.firstname = form.firstname;
    if (form.lastname) data.lastname = form.lastname;
    if (form.username) data.username = form.username;
    if (form.email) data.email = form.email;
    if (form.newPassword) data.newPassword = form.newPassword;
    if (form.birthDate) data.birthDate = form.birthDate;

    const result = await updateUser(data);
    if (result.success) {
      setUpdateMsg({ type: 'success', text: 'Modifications enregistrées' });
      setForm({ ...form, currentPassword: '', newPassword: '' });
    } else {
      setUpdateMsg({ type: 'error', text: result.error });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleteMsg({ type: '', text: '' });
    if (!form.deletePassword) {
      setDeleteMsg({ type: 'error', text: 'Mot de passe requis pour supprimer' });
      return;
    }
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    const result = await deleteAccount(form.deletePassword);
    if (result.success) {
      router.push('/');
    } else {
      setDeleteMsg({ type: 'error', text: result.error });
    }
  };

  const goToForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <main>
      <Header currentPage="settings" />
      <div className={styles.container}>
        <h1 className={styles.title}>Paramètres</h1>
        <p className={styles.subtitle}>Gérez votre compte Bilo Chess</p>

        {/* ── Infos profil ── */}
        <div className={styles.card}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Identifiant</span>
            <span className={styles.value}>{user.identifiant}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Email vérifié</span>
            {user.emailVerified ? (
              <span className={styles.value}>✅ Oui</span>
            ) : (
              <button className={styles.verifyLink} onClick={() => setShowVerifyEmail(true)}>
                Vérifier votre email
              </button>
            )}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Inscrit le</span>
            <span className={styles.value}>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* ── Modifier le profil ── */}
        <form className={styles.card} onSubmit={handleUpdate}>
          <h2 className={styles.cardTitle}>Modifier le profil</h2>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Prénom</label>
              <input placeholder={user.firstname} value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label>Nom</label>
              <input placeholder={user.lastname} value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Nom d'utilisateur</label>
            <input placeholder={user.username} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" placeholder={user.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Nouveau mot de passe (optionnel)</label>
            <input type="password" placeholder="Laisser vide pour ne pas changer" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </div>
          <hr className={styles.divider} />
          <div className={styles.formGroup}>
            <label>Mot de passe actuel (requis)</label>
            <input type="password" placeholder="Votre mot de passe actuel" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
            <button type="button" className={styles.forgotLink} onClick={goToForgotPassword}>
              Mot de passe oublié ?
            </button>
          </div>

          {updateMsg.text && (
            <div className={updateMsg.type === 'error' ? styles.inlineError : styles.inlineSuccess}>
              {updateMsg.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>

        {/* ── Zone dangereuse ── */}
        <div className={`${styles.card} ${styles.dangerCard}`}>
          <h2 className={styles.cardTitle} style={{ color: '#dc2626' }}>Zone dangereuse</h2>
          <p className={styles.dangerText}>La suppression de votre compte est irréversible. Toutes vos données seront perdues.</p>
          <div className={styles.formGroup}>
            <label>Mot de passe pour confirmer</label>
            <input type="password" placeholder="Votre mot de passe" value={form.deletePassword} onChange={(e) => setForm({ ...form, deletePassword: e.target.value })} />
          </div>

          {deleteMsg.text && (
            <div className={deleteMsg.type === 'error' ? styles.inlineError : styles.inlineSuccess}>
              {deleteMsg.text}
            </div>
          )}

          <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
            Supprimer mon compte
          </button>
        </div>
      </div>

      {showVerifyEmail && <VerifyEmailModal onClose={() => setShowVerifyEmail(false)} />}
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </main>
  );
}
