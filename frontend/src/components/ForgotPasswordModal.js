'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function ForgotPasswordModal({ onClose, onBackToLogin }) {
  const { forgotPassword, verifyResetCode, resetPassword } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) {
      setStep(2);
      setSuccess('Si cet email existe, un code a été envoyé');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.charAt(0);
    if (value && !/[0-9]/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) { setError('Code complet requis'); return; }
    setError('');
    setLoading(true);
    const result = await verifyResetCode(email, fullCode);
    if (result.success) {
      setStep(3);
      setSuccess('');
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?!.*\s).{8,}$/;
    if (!pwRegex.test(newPassword)) {
      setError('8+ caractères, 1 majuscule, 1 chiffre, 1 spécial requis');
      return;
    }
    setError('');
    setLoading(true);
    const result = await resetPassword(email, code.join(''), newPassword);
    if (result.success) {
      setSuccess('Mot de passe réinitialisé !');
      setError('');
      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          onClose();
        }
      }, 1500);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {onBackToLogin && (
          <button className={styles.backBtn} onClick={onBackToLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}

        <div className={styles.modalLogo}>
          <Image src="/logo.png" alt="Bilo Chess" width={140} height={50} className={styles.modalLogoImage} />
        </div>

        <h2 className={styles.title}>Mot de passe oublié</h2>

        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <p className={styles.subtitle}>Entrez votre email pour recevoir un code de réinitialisation</p>
            <div className={styles.formGroup}>
              <label>Adresse email</label>
              <input className={styles.formInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            {error && <div className={styles.inlineError}>{error}</div>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Envoyer le code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <p className={styles.subtitle}>Entrez le code à 6 chiffres envoyé à {email}</p>
            {success && <div className={styles.inlineSuccess}>{success}</div>}
            <div className={styles.codeInputs}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={styles.codeInput}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>
            {error && <div className={styles.inlineError}>{error}</div>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Vérifier le code'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p className={styles.subtitle}>Choisissez votre nouveau mot de passe</p>
            <div className={styles.formGroup}>
              <label>Nouveau mot de passe</label>
              <input className={styles.formInput} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 caractères" required />
            </div>
            {error && <div className={styles.inlineError}>{error}</div>}
            {success && <div className={styles.inlineSuccess}>{success}</div>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Réinitialiser'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
