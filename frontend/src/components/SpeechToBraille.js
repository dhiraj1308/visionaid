import React, { useState, useEffect } from 'react';

const brailleMap = {
  a: [1,0,0,0,0,0], b: [1,1,0,0,0,0], c: [1,0,0,1,0,0], d: [1,0,0,1,1,0],
  e: [1,0,0,0,1,0], f: [1,1,0,1,0,0], g: [1,1,0,1,1,0], h: [1,1,0,0,1,0],
  i: [0,1,0,1,0,0], j: [0,1,0,1,1,0], k: [1,0,1,0,0,0], l: [1,1,1,0,0,0],
  m: [1,0,1,1,0,0], n: [1,0,1,1,1,0], o: [1,0,1,0,1,0], p: [1,1,1,1,0,0],
  q: [1,1,1,1,1,0], r: [1,1,1,0,1,0], s: [0,1,1,1,0,0], t: [0,1,1,1,1,0],
  u: [1,0,1,0,0,1], v: [1,1,1,0,0,1], w: [0,1,0,1,1,1], x: [1,0,1,1,0,1],
  y: [1,0,1,1,1,1], z: [1,0,1,0,1,1], ' ': [0,0,0,0,0,0]
};

export default function SpeechToBraille({ onBack }) {
  const [text, setText] = useState('');
  const [braillePatterns, setBraillePatterns] = useState([]);

  useEffect(() => {
    const lowerText = text.toLowerCase();
    const patterns = [...lowerText].map(ch => brailleMap[ch] || [0,0,0,0,0,0]);
    setBraillePatterns(patterns);
  }, [text]);

  const speakText = () => {
    if ('speechSynthesis' in window && text.trim()) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="main-bg interactive-bg">
      <button
        onClick={onBack}
        style={{ position: 'absolute', left: 32, top: 32, zIndex: 2 }}
      >
        ← Back
      </button>
      <header className="centered-header">
        <h1>Speech/Text to Braille</h1>
        <p className="subtitle">Convert typed or spoken words into Braille instantly.</p>
      </header>
      
      <label htmlFor="textInput" style={{ display: 'block', marginBottom: 6 }}>
        Enter text
      </label>
      <textarea
        id="textInput"
        rows="4"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        placeholder="Type or paste text here"
        aria-multiline="true"
        spellCheck="false"
        style={{
          borderRadius: '8px',
          border: '1.5px solid #e3e6ef',
          padding: '10px',
          width: '90%',
          maxWidth: 480,
          margin: '0 auto 1em auto',
          display: 'block',
          fontSize: '1rem',
          fontFamily: 'Arial, sans-serif'
        }}
      />
      <button
        onClick={speakText}
        aria-label="Read text aloud"
        style={{
          marginBottom: '2em',
          fontWeight: '700',
          cursor: 'pointer',
          padding: '0.6em 1.2em',
          borderRadius: '7px',
          border: 'none',
          background: 'linear-gradient(90deg, #3753ff, #84aafe)',
          color: 'white',
          fontSize: '1.1rem',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 4px 32px rgba(55, 83, 255, 0.1)'
        }}
      >
         Click to Speak
      </button>

      <section className="braille-grid" aria-live="polite" aria-label="Braille output">
        {braillePatterns.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '1rem', color: '#666' }}>No Braille output yet</p>
        ) : (
          braillePatterns.map((dots, i) => (
            <div key={i} className="braille-card" aria-label="Braille character">
              <div className="braille-dots">
                {[0,1,2,3,4,5].map(idx => (
                  <div key={idx} className={`dot${dots[idx] ? ' filled' : ''}`}></div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
