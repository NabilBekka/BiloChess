'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function RegisterModal({ onClose, onSwitchToLogin, onForgotPassword }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstname: '', lastname: '', username: '', birthDate: '', email: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const pwChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!pwChecks.length || !pwChecks.upper || !pwChecks.number || !pwChecks.special) {
      setError('Le mot de passe ne respecte pas les critères');
      return;
    }
    setLoading(true);
    const result = await register(form);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.backBtn} onClick={onSwitchToLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.modalLogo}>
          <Image src="/logo.png" alt="Bilo Chess" width={140} height={50} className={styles.modalLogoImage} />
        </div>

        <h2 className={styles.title}>Créer un compte</h2>
        <p className={styles.subtitle}>Rejoignez la communauté Bilo Chess</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div className={styles.formRow}>
              <div>
                <label>Prénom</label>
                <input className={`${styles.formInput} ${styles.formInputSm}`} placeholder="Votre prénom" value={form.firstname} onChange={(e) => update('firstname', e.target.value)} required />
              </div>
              <div>
                <label>Nom</label>
                <input className={`${styles.formInput} ${styles.formInputSm}`} placeholder="Votre nom" value={form.lastname} onChange={(e) => update('lastname', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Nom d'utilisateur</label>
            <input className={`${styles.formInput} ${styles.formInputSm}`} placeholder="Choisissez un pseudo" value={form.username} onChange={(e) => update('username', e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Date de naissance</label>
            <input className={`${styles.formInput} ${styles.formInputSm}`} type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Adresse email</label>
            <input className={`${styles.formInput} ${styles.formInputSm}`} type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Mot de passe</label>
            <input className={`${styles.formInput} ${styles.formInputSm}`} type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={(e) => update('password', e.target.value)} required />
            <button type="button" className={styles.forgotLink} onClick={onForgotPassword}>
              Mot de passe oublié ?
            </button>
            <div className={styles.pwReqs}>
              <span className={`${styles.pwReq} ${pwChecks.length ? styles.pwReqPass : styles.pwReqFail}`}>8+ caractères</span>
              <span className={`${styles.pwReq} ${pwChecks.upper ? styles.pwReqPass : styles.pwReqFail}`}>1 majuscule</span>
              <span className={`${styles.pwReq} ${pwChecks.number ? styles.pwReqPass : styles.pwReqFail}`}>1 chiffre</span>
              <span className={`${styles.pwReq} ${pwChecks.special ? styles.pwReqPass : styles.pwReqFail}`}>1 spécial</span>
            </div>
          </div>

          {error && <div className={styles.inlineError}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Créer mon compte'}
          </button>
        </form>

        <p className={styles.terms}>
          En créant un compte, vous acceptez nos <a href="#">Conditions d'utilisation</a> et notre <a href="#">Politique de confidentialité</a>.
        </p>

        <div className={styles.modalFooter} style={{ marginTop: '20px', paddingTop: '18px' }}>
          <p style={{ marginBottom: 0 }}>Déjà un compte ? <button className={styles.switchLink} onClick={onSwitchToLogin}>Se connecter</button></p>
        </div>
      </div>
    </div>
  );
}
