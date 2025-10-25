import React from 'react';
import './HomePage.css';
import ImageCarousel from './ImageCarousel';

export default function HomePage({ onNavigate }) {
  return (
    <div className="main-bg interactive-bg">
      <header className="centered-header">
        <h1 style={{ fontFamily: 'Anton, sans-serif', fontWeight: 'normal', fontSize: '3rem', margin: 0 }}>
  Braille Learning Platform
</h1>

        <p className="subtitle">
          Empowering literacy & accessibility for everyone.
        </p>
      </header>

      <ImageCarousel />

      <nav className="homepage-nav">
        <button onClick={() => onNavigate('chart')}>Braille Chart</button>
        <button onClick={() => onNavigate('speech')}>Speech/Text to Braille</button>
        <button onClick={() => onNavigate('calendar')}>Braille Calendar</button>
      </nav>
    </div>
  );
}
