import React from 'react';

const brailleAlphabet = [
  { char: 'A', dots: [1, 0, 0, 0, 0, 0] },
  { char: 'B', dots: [1, 1, 0, 0, 0, 0] },
  { char: 'C', dots: [1, 0, 0, 1, 0, 0] },
  { char: 'D', dots: [1, 0, 0, 1, 1, 0] },
  { char: 'E', dots: [1, 0, 0, 0, 1, 0] },
  { char: 'F', dots: [1, 1, 0, 1, 0, 0] },
  { char: 'G', dots: [1, 1, 0, 1, 1, 0] },
  { char: 'H', dots: [1, 1, 0, 0, 1, 0] },
  { char: 'I', dots: [0, 1, 0, 1, 0, 0] },
  { char: 'J', dots: [0, 1, 0, 1, 1, 0] },
  { char: 'K', dots: [1, 0, 1, 0, 0, 0] },
  { char: 'L', dots: [1, 1, 1, 0, 0, 0] },
  { char: 'M', dots: [1, 0, 1, 1, 0, 0] },
  { char: 'N', dots: [1, 0, 1, 1, 1, 0] },
  { char: 'O', dots: [1, 0, 1, 0, 1, 0] },
  { char: 'P', dots: [1, 1, 1, 1, 0, 0] },
  { char: 'Q', dots: [1, 1, 1, 1, 1, 0] },
  { char: 'R', dots: [1, 1, 1, 0, 1, 0] },
  { char: 'S', dots: [0, 1, 1, 1, 0, 0] },
  { char: 'T', dots: [0, 1, 1, 1, 1, 0] },
  { char: 'U', dots: [1, 0, 1, 0, 0, 1] },
  { char: 'V', dots: [1, 1, 1, 0, 0, 1] },
  { char: 'W', dots: [0, 1, 0, 1, 1, 1] },
  { char: 'X', dots: [1, 0, 1, 1, 0, 1] },
  { char: 'Y', dots: [1, 0, 1, 1, 1, 1] },
  { char: 'Z', dots: [1, 0, 1, 0, 1, 1] },
];

function BrailleCard({ char, dots }) {
  return (
    <div className="braille-card" tabIndex={0} aria-label={`Braille character ${char}`}>
      <div className="braille-char">{char}</div>
      <div className="braille-dots">
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className={`dot${dots[idx] ? ' filled' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export default function BrailleChart({ onBack }) {
  return (
    <div className="main-bg interactive-bg">
      <button
        onClick={onBack}
        style={{ position: "absolute", left: 32, top: 32, zIndex: 2 }}
      >
        ← Back
      </button>
      <header className="centered-header">
        <h1>Braille Alphabet Chart</h1>
        <p className="subtitle">See all Braille characters here.</p>
      </header>
      <section className="braille-grid" aria-live="polite">
        {brailleAlphabet.map(({ char, dots }) => (
          <BrailleCard key={char} char={char} dots={dots} />
        ))}
      </section>
    </div>
  );
}
