'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import PasswordInput from '@/components/PasswordInput';
import styles from './Modal.module.css';

export default function DeleteAccountModal({ onClose, onForgotPassword, onDeleted }) {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Mot de passe requis');
      return;
    }
    setLoading(true);
    const result = await deleteAccount(password);
    if (result.success) {
      setDeleted(true);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  // ── Écran de confirmation ──
  if (deleted) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.modalLogo}>
            <Image src="/logo.png" alt="Bilo Chess" width={140} height={50} className={styles.modalLogoImage} />
          </div>

          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>👋</div>
            <h2 className={styles.title}>Compte supprimé</h2>
            <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
              Votre compte a bien été supprimé, on espère vous revoir bientôt.
            </p>
            <button className={styles.submitBtn} onClick={onDeleted}>
              Revenir à la page d'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulaire de suppression ──
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.modalLogo}>
          <Image src="/logo.png" alt="Bilo Chess" width={140} height={50} className={styles.modalLogoImage} />
        </div>

        <h2 className={styles.title} style={{ color: '#dc2626' }}>Supprimer mon compte</h2>
        <p className={styles.subtitle}>Cette action est irréversible. Toutes vos données seront perdues.</p>

        <form onSubmit={handleDelete}>
          <div className={styles.formGroup}>
            <label>Veuillez saisir votre mot de passe pour supprimer votre compte</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className={styles.formInput}
              required
            />
            {onForgotPassword && (
              <button type="button" className={styles.forgotLink} onClick={onForgotPassword}>
                Mot de passe oublié ?
              </button>
            )}
          </div>

          {error && <div className={styles.inlineError}>{error}</div>}

          <button type="submit" className={styles.deleteBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Confirmer la suppression'}
          </button>
        </form>
      </div>
    </div>
  );
}
