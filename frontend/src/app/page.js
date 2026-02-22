'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import styles from './page.module.css';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const openLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <main>
      <Header currentPage="home" />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Image
            src="/logo.png"
            alt="Bilo Chess"
            width={400}
            height={320}
            className={styles.heroLogo}
            priority
          />

          <h1 className={styles.heroTitle}>Crée ton profil pour t'améliorer aux échecs</h1>

          <button className={styles.heroCta} onClick={openRegister}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Je crée mon profil
          </button>

          <div className={styles.heroLoginLink}>
            <button className={styles.heroLoginBtn} onClick={openLogin}>
              J'ai déjà un compte
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>Pourquoi Bilo Chess ?</h2>
          <p className={styles.featuresSub}>Tout ce qu'il faut pour progresser, au même endroit</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(74, 124, 89, 0.08)' }}>📚</div>
            <h3 className={styles.featureTitle}>Cours structurés</h3>
            <p className={styles.featureDesc}>Du débutant au maître, suivez un parcours adapté à votre niveau avec des leçons interactives</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(139, 105, 20, 0.08)' }}>🧩</div>
            <h3 className={styles.featureTitle}>Puzzles tactiques</h3>
            <p className={styles.featureDesc}>Plus de 500 puzzles classés par thème et difficulté pour aiguiser votre vision du jeu</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ background: 'rgba(46, 107, 138, 0.08)' }}>📊</div>
            <h3 className={styles.featureTitle}>Suivi de progression</h3>
            <p className={styles.featureDesc}>Visualisez votre Elo, vos forces et faiblesses avec des statistiques détaillées</p>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className={styles.statsBanner}>
        <div className={styles.statsGrid}>
          <div><div className={styles.statValue}>500+</div><div className={styles.statLabel}>Puzzles</div></div>
          <div><div className={styles.statValue}>80+</div><div className={styles.statLabel}>Leçons</div></div>
          <div><div className={styles.statValue}>12K</div><div className={styles.statLabel}>Joueurs</div></div>
          <div><div className={styles.statValue}>6</div><div className={styles.statLabel}>Cours complets</div></div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <Image src="/logo.png" alt="Bilo Chess" width={120} height={36} className={styles.footerLogo} />
            <p className={styles.footerSub}>Apprendre les échecs, progresser ensemble</p>
          </div>
          <div className={styles.footerLinks}>
            <button className={styles.footerLink}>À propos</button>
            <button className={styles.footerLink}>Contact</button>
            <button className={styles.footerLink}>Mentions légales</button>
            <button className={styles.footerLink}>Confidentialité</button>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>© 2026 Bilo Chess. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Modals from hero buttons */}
      {showLogin && (
        <LoginModal onClose={closeModals} onSwitchToRegister={openRegister} onGoogleRegister={() => {}} />
      )}
      {showRegister && (
        <RegisterModal onClose={closeModals} onSwitchToLogin={openLogin} />
      )}
    </main>
  );
}
