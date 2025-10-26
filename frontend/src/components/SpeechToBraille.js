import React, { useState, useEffect, useRef } from 'react';

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
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const shouldKeepListeningRef = useRef(false);
  const [printSize, setPrintSize] = useState('small'); // 'small' or 'normal'

  useEffect(() => {
    const lowerText = text.toLowerCase();
    const patterns = [...lowerText].map(ch => brailleMap[ch] || [0,0,0,0,0,0]);
    setBraillePatterns(patterns);
  }, [text]);

  // Initialize SpeechRecognition (if available) and wire event handlers.
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recog = new SpeechRecognition();
    // Keep listening until user explicitly stops
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onstart = () => setIsRecording(true);
    recog.onend = () => {
      // If user asked to keep listening, try to restart recognition. Some
      // browsers end recognition periodically, so restarting preserves a
      // continuous experience until the user presses Stop Listening.
      if (shouldKeepListeningRef.current) {
        // small delay to avoid potential start-after-end errors
        setTimeout(() => {
          try { recog.start(); } catch (e) { console.warn('Restart failed', e); }
        }, 250);
      } else {
        setIsRecording(false);
      }
    };

    recog.onerror = (evt) => {
      console.error('Speech recognition error', evt);
      // On serious errors, stop trying to keep it running
      shouldKeepListeningRef.current = false;
      setIsRecording(false);
    };

    recog.onresult = (event) => {
      // Collect interim and final transcripts
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }

      // If we have a final transcript, commit it to the base text; otherwise
      // show interim as a preview without mutating the committed base text.
      if (final) {
        const prefix = baseTextRef.current && !baseTextRef.current.endsWith(' ') ? baseTextRef.current + ' ' : baseTextRef.current || '';
        baseTextRef.current = prefix + final;
        setText(baseTextRef.current);
      } else {
        const previewPrefix = baseTextRef.current && !baseTextRef.current.endsWith(' ') ? baseTextRef.current + ' ' : baseTextRef.current || '';
        setText(previewPrefix + interim);
      }
    };

  recognitionRef.current = recog;

    return () => {
      // cleanup
      try {
        shouldKeepListeningRef.current = false;
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, []);

  const handleListenClick = () => {
    const recog = recognitionRef.current;
    if (!recog) {
      // Browser doesn't support Web Speech API
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      // User explicitly requested stop: don't restart on onend
      shouldKeepListeningRef.current = false;
      try { recog.stop(); } catch (e) { console.warn(e); }
      setIsRecording(false);
    } else {
      try {
        // starting recognition will prompt for microphone permission
        shouldKeepListeningRef.current = true;
        recog.start();
      } catch (e) {
        // Some browsers throw if start is called repeatedly; handle gracefully
        console.warn('Could not start recognition', e);
        // Try a delayed restart in case of transient state
        setTimeout(() => {
          try { shouldKeepListeningRef.current = true; recog.start(); } catch (err) { console.warn('Retry start failed', err); }
        }, 300);
      }
    }
  };

  const createPrintableHtml = (textValue, patterns, size = 'small') => {
    // Use SVG circles so dots reliably appear in printed PDFs (browser
    // print settings sometimes omit CSS background colors).
    // Adjust sizes for 'small' or 'normal' print sizes
    const isSmall = size === 'small';
    const brailleRowGap = isSmall ? 8 : 12;
    const charWidth = isSmall ? 48 : 84;
    const charHeight = isSmall ? 72 : 126;
    const viewBoxW = isSmall ? 36 : 72;
    const viewBoxH = isSmall ? 54 : 108;
    const coords = isSmall ? [ [9,9],[27,9], [9,27],[27,27], [9,45],[27,45] ] : [ [18,18],[54,18], [18,54],[54,54], [18,90],[54,90] ];
    const dotR = isSmall ? 6 : 12;

    const dotStyle = `
      .braille-row{ display:flex; flex-wrap:wrap; gap:${brailleRowGap}px; align-items:flex-start; }
      .braille-char{ width:${charWidth}px; height:${charHeight}px; display:flex; align-items:center; justify-content:center; margin:6px; }
      body{ font-family: Arial, Helvetica, sans-serif; padding:20px; color:#111; }
      h1{ font-size:${isSmall ? 16 : 20}px; margin-bottom:8px; }
      pre{ white-space:pre-wrap; word-wrap:break-word; background:transparent; }
    `;

    const buildCharSvg = (dots, idx) => {
      const circles = dots.map((d, i) => {
        const [cx, cy] = coords[i];
        const fill = d ? '#000' : '#fff';
        const stroke = '#000';
        return `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
      }).join('');

      return `
        <div class="braille-char" aria-hidden="true">
          <svg width="${charWidth}" height="${charHeight}" viewBox="0 0 ${viewBoxW} ${viewBoxH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="braille character ${idx}">
            <rect width="100%" height="100%" fill="white" />
            ${circles}
          </svg>
        </div>
      `;
    };

    const charsHtml = patterns.map((p,i) => buildCharSvg(p,i)).join('');

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Braille Print</title>
          <style>${dotStyle}</style>
        </head>
        <body>
          <h1>Braille Output</h1>
          <section>
            <strong>Original text:</strong>
            <pre>${String(textValue || '')}</pre>
          </section>
          <hr />
          <section class="braille-row">
            ${charsHtml}
          </section>
          <script>
            // Auto-print when the page finishes loading. Small timeout gives
            // the browser a moment to render SVGs before the print dialog.
            window.onload = function() { setTimeout(function(){ window.focus(); window.print(); }, 250); };
          </script>
        </body>
      </html>
    `;
  };

  const handlePrint = (size = 'small') => {
    if (!braillePatterns || braillePatterns.length === 0) {
      alert('No braille output to print. Please enter or speak some text first.');
      return;
    }
    const printable = createPrintableHtml(baseTextRef.current || text, braillePatterns, size);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Unable to open print window. Please allow popups for this site.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(printable);
    printWindow.document.close();
    printWindow.focus();
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
        onChange={(e) => { baseTextRef.current = e.currentTarget.value; setText(e.currentTarget.value); }}
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
        onClick={handleListenClick}
        aria-label={isRecording ? "Stop listening" : "Start listening"}
        style={{
          marginBottom: '2em',
          fontWeight: '700',
          cursor: 'pointer',
          padding: '0.6em 1.2em',
          borderRadius: '7px',
          border: 'none',
          background: isRecording ? 'linear-gradient(90deg, #ff5c5c, #ff8a8a)' : 'linear-gradient(90deg, #3753ff, #84aafe)',
          color: 'white',
          fontSize: '1.1rem',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 4px 32px rgba(55, 83, 255, 0.1)'
        }}
      >
         {isRecording ? 'Stop Listening' : 'Click to Speak'}
      </button>

      {(text && text.trim().length > 0) || braillePatterns.length > 0 ? (
        <div style={{ width: '100%', maxWidth: 480, margin: '0 auto 1em auto', textAlign: 'center' }}>
          <label htmlFor="printSize" style={{ marginRight: 8 }}>Print size:</label>
          <select id="printSize" value={printSize} onChange={(e) => setPrintSize(e.target.value)} style={{ marginRight: 12 }}>
            <option value="small">Small</option>
            <option value="normal">Normal</option>
          </select>

          <button
            onClick={() => handlePrint(printSize)}
            aria-label="Print braille output"
            style={{
              marginBottom: '2em',
              fontWeight: '700',
              cursor: 'pointer',
              padding: '0.6em 1.2em',
              borderRadius: '7px',
              border: 'none',
              background: 'linear-gradient(90deg, #22c55e, #7ee787)',
              color: 'white',
              fontSize: '1.1rem',
              display: 'inline-block',
              boxShadow: '0 4px 24px rgba(34,197,94,0.12)'
            }}
          >
            Print Braille
          </button>
        </div>
      ) : null}

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
