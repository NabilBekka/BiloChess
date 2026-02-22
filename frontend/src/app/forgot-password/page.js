'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import styles from './forgot-password.module.css';

export default function ForgotPassword() {
  const { forgotPassword, verifyResetCode, resetPassword } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password
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
      setSuccess('Mot de passe réinitialisé ! Vous pouvez vous connecter.');
      setTimeout(() => router.push('/'), 2000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <main>
      <Header />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <Image src="/logo.png" alt="Bilo Chess" width={140} height={50} style={{ objectFit: 'contain' }} />
          </div>
          <h1 className={styles.title}>Mot de passe oublié</h1>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <p className={styles.text}>Entrez votre adresse email pour recevoir un code de réinitialisation.</p>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <p className={styles.text}>Entrez le code à 6 chiffres envoyé à {email}</p>
              <div className={styles.codeInputs}>
                {code.map((digit, i) => (
                  <input key={i} ref={(el) => (inputRefs.current[i] = el)} className={styles.codeInput} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleCodeChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} />
                ))}
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <p className={styles.text}>Choisissez votre nouveau mot de passe.</p>
              <div className={styles.formGroup}>
                <label>Nouveau mot de passe</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 caractères" required />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </form>
          )}

          <div className={styles.backLink}>
            <button onClick={() => router.push('/')}>← Retour à l'accueil</button>
          </div>
        </div>
      </div>
    </main>
  );
}
