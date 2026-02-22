'use client';

import Header from '@/components/Header';
import styles from './about.module.css';

export default function About() {
  return (
    <main>
      <Header currentPage="about" />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>À propos de Bilo Chess</h1>
          <p className={styles.subtitle}>Une plateforme conçue pour rendre l'apprentissage des échecs accessible à tous</p>
        </div>

        <div className={styles.mission}>
          <h2>Notre mission</h2>
          <p>
            Bilo Chess est né d'une passion pour les échecs et d'une conviction : tout le monde peut apprendre à jouer et progresser, quel que soit son niveau de départ. Notre plateforme propose des cours structurés, des puzzles stimulants et des outils de suivi pour accompagner chaque joueur dans son parcours.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🎯</div>
            <h3>Apprentissage progressif</h3>
            <p>Des cours du débutant complet jusqu'au joueur avancé, avec une difficulté qui s'adapte à votre progression.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🧠</div>
            <h3>Entraînement tactique</h3>
            <p>Des centaines de puzzles organisés par thème pour développer votre vision du jeu et vos réflexes tactiques.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🌍</div>
            <h3>Communauté francophone</h3>
            <p>Une plateforme entièrement en français, pensée pour la communauté francophone passionnée d'échecs.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📱</div>
            <h3>Accessible partout</h3>
            <p>Apprenez sur votre ordinateur, tablette ou téléphone, à votre rythme et quand vous le souhaitez.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
