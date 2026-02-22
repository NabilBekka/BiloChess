'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import GoogleRegisterModal from '@/components/GoogleRegisterModal';
import VerifyEmailModal from '@/components/VerifyEmailModal';
import styles from './Header.module.css';

export default function Header({ currentPage = 'home' }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showGoogleRegister, setShowGoogleRegister] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysRemaining = () => {
    if (!user || user.emailVerified || !user.createdAt) return null;
    const createdDate = new Date(user.createdAt);
    const deadline = new Date(createdDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (diffDays > 6) return 6;
    if (diffDays < 0) return 0;
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isLastDay = daysRemaining === 1 || daysRemaining === 0;

  const openLogin = () => { setShowRegister(false); setShowGoogleRegister(false); setShowLogin(true); };
  const openRegister = () => { setShowLogin(false); setShowGoogleRegister(false); setShowRegister(true); };
  const closeModals = () => { setShowLogin(false); setShowRegister(false); setShowGoogleRegister(false); setShowVerifyEmail(false); setGoogleData(null); };
  const handleGoogleRegister = (data) => { setShowLogin(false); setGoogleData(data); setShowGoogleRegister(true); };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    router.push('/');
  };

  const handleSettings = () => { setShowDropdown(false); router.push('/settings'); };

  const getInitials = () => {
    if (!user) return '';
    const first = user.firstname?.charAt(0)?.toUpperCase() || '';
    const last = user.lastname?.charAt(0)?.toUpperCase() || '';
    return first + last || user.username?.charAt(0)?.toUpperCase() || '?';
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logoLink} onClick={() => router.push('/')}>
          <Image src="/logo.png" alt="Bilo Chess" width={120} height={46} className={styles.logoImage} priority />
        </div>

        <div className={styles.headerRight}>
          <button className={`${styles.navLink} ${currentPage === 'home' ? styles.navLinkActive : ''}`} onClick={() => router.push('/')}>
            Accueil
          </button>
          <button className={`${styles.navLink} ${currentPage === 'about' ? styles.navLinkActive : ''}`} onClick={() => router.push('/about')}>
            À propos
          </button>

          <div className={styles.navSeparator} />

          {user ? (
            <div className={styles.userSection} ref={dropdownRef}>
              {!user.emailVerified && daysRemaining !== null && (
                <button
                  className={`${styles.verifyAlert} ${isLastDay ? styles.verifyAlertUrgent : ''}`}
                  onClick={() => setShowVerifyEmail(true)}
                >
                  {isLastDay
                    ? '⚠️ Dernier jour pour vérifier !'
                    : `${daysRemaining} jour${daysRemaining !== 1 ? 's' : ''} pour vérifier`}
                </button>
              )}

              <button className={styles.avatarBtn} onClick={() => setShowDropdown(!showDropdown)}>
                <div className={styles.avatar}>{getInitials()}</div>
              </button>

              {showDropdown && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.avatarSmall}>{getInitials()}</div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.firstname} {user.lastname}</span>
                      <span className={styles.identifiant}>ID: {user.identifiant}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={handleSettings}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                    </svg>
                    Paramètres
                  </button>
                  <button className={styles.dropdownItem}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                    Mes statistiques
                  </button>
                  <button className={styles.dropdownItem}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    Mon profil
                  </button>
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.profileBtn} onClick={openLogin}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Mon profil
            </button>
          )}
        </div>
      </header>

      {showLogin && <LoginModal onClose={closeModals} onSwitchToRegister={openRegister} onGoogleRegister={handleGoogleRegister} />}
      {showRegister && <RegisterModal onClose={closeModals} onSwitchToLogin={openLogin} />}
      {showGoogleRegister && googleData && <GoogleRegisterModal onClose={closeModals} googleData={googleData} />}
      {showVerifyEmail && <VerifyEmailModal onClose={closeModals} />}
    </>
  );
}
