'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function LoginModal({ onClose, onSwitchToRegister, onGoogleRegister }) {
  const { login, googleAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      const result = await googleAuth(tokenResponse.access_token);
      if (result.success) {
        if (result.isExistingUser) {
          onClose();
        } else {
          onGoogleRegister(result.googleData);
        }
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    onError: () => setError('Échec de la connexion Google'),
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.modalLogo}>
          <Image src="/logo.png" alt="Bilo Chess" width={140} height={50} className={styles.modalLogoImage} />
        </div>

        <h2 className={styles.title}>Se connecter</h2>
        <p className={styles.subtitle}>Accédez à votre espace d'apprentissage</p>

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.googleBtn} onClick={() => googleLogin()} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuer avec Google
        </button>

        <div className={styles.divider}><span className={styles.dividerText}>ou avec votre email</span></div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Adresse email</label>
            <input className={styles.formInput} type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Mot de passe</label>
            <input className={styles.formInput} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="button" className={styles.forgotLink} onClick={() => { onClose(); window.location.href = '/forgot-password'; }}>
            Mot de passe oublié ?
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Se connecter'}
          </button>
        </form>

        <div className={styles.modalFooter}>
          <p>Pas encore de compte ?</p>
          <button className={styles.createBtn} onClick={onSwitchToRegister}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}
