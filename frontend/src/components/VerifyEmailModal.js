'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import styles from './Modal.module.css';

export default function VerifyEmailModal({ onClose }) {
  const { sendVerificationCode, verifyEmail, user } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef([]);

  const handleSendCode = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await sendVerificationCode();
    if (result.success) {
      setCodeSent(true);
      setSuccess('Code envoyé à ' + user.email);
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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code complet');
      return;
    }
    setError('');
    setLoading(true);
    const result = await verifyEmail(fullCode);
    if (result.success) {
      setSuccess('Email vérifié avec succès !');
      setTimeout(onClose, 1500);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.modalLogo}>
          <Image src="/logo.png" alt="Bilo Chess" width={140} height={50} className={styles.modalLogoImage} />
        </div>

        <h2 className={styles.title}>Vérifier votre email</h2>
        <p className={styles.subtitle}>
          {codeSent ? `Code envoyé à ${user?.email}` : 'Un code de vérification sera envoyé à votre adresse email'}
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {!codeSent ? (
          <button className={styles.submitBtn} onClick={handleSendCode} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Envoyer le code'}
          </button>
        ) : (
          <>
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
            <button className={styles.submitBtn} onClick={handleVerify} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Vérifier'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button className={styles.switchLink} onClick={handleSendCode} disabled={loading}>
                Renvoyer le code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
