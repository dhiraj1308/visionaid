import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BrailleCalendar.css';

// Braille digit renderer: now accepts a dots array (6 elements of 0/1)
function BrailleDigit({ dots }) {
  const d = dots || [0,0,0,0,0,0];
  return (
    <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2,10px)',
        gridTemplateRows: 'repeat(3,10px)',
        gap: '3px',
        margin: '0 auto'
      }}>
        {d.map((filled, idx) => (
          <div
            key={idx}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: filled ? '#2b59e7' : '#dae7ff',
              boxShadow: filled ? '0 1px 5px #3562e8cc' : undefined,
              margin: '0 auto',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Helper to get month grid
function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let rows = [];
  let day = 1;
  let started = false;
  for (let week = 0; week < 6; ++week) {
    let weekRow = [];
    for (let d = 0; d < 7; ++d) {
      if (!started && d === firstDay) started = true;
      if (!started) {
        weekRow.push('');
      } else if (day > daysInMonth) {
        weekRow.push('');
      } else {
        weekRow.push(day);
        day++;
      }
    }
    rows.push(weekRow);
  }
  return rows;
}

// Calendar Page Component
export default function BrailleCalendar({ onBack }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [digitsMap, setDigitsMap] = useState(null);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const matrix = getMonthMatrix(year, month);

  useEffect(() => {
    // fetch mapping for digits 0-9 once and cache it
    (async () => {
      try {
        const res = await axios.post('http://localhost:8080/api/braille/dots', '0123456789', { headers: { 'Content-Type': 'text/plain' } });
        const json = res.data;
        // json expected to be array of arrays in order for '0','1',..'9'
        const map = {};
        // If backend returns for '0'..'9' in order, map accordingly
        const sample = json || [];
        for (let i = 0; i < sample.length; i++) {
          const ch = String(sample.length === 10 ? i : i); // if length 10, index i corresponds to char at position i in '0123456789'
          map[ch] = sample[i];
        }
        // ensure characters '0'..'9' are keys
        if (sample.length === 10) {
          const explicit = {};
          for (let i = 0; i < 10; i++) explicit[String(i)] = sample[i];
          setDigitsMap(explicit);
        } else {
          setDigitsMap(map);
        }
      } catch (e) {
        console.warn('Unable to load digit braille patterns', e);
        setDigitsMap(null);
      }
    })();
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else { setMonth(month - 1); }
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else { setMonth(month + 1); }
  }

  return (
    <div className="main-bg interactive-bg" style={{ minHeight: '100vh', width: '100vw', padding: 0 }}>
      <button
        onClick={onBack}
        className="calendar-back-btn"
        style={{ position: 'absolute', left: 32, top: 32, zIndex: 2 }}
      >← Back</button>
      <header className="centered-header">
        <h1 style={{ marginTop: '1.4em' }}>Braille Calendar</h1>
        <p className="subtitle" style={{ marginBottom: '1.5em' }}>
          Visualize days with Braille digits.
        </p>
      </header>
      <div className="braille-calendar-container">
        <div className="calendar-header">
          <div className="calendar-header-box">
            <button onClick={prevMonth} className="calendar-arrow-btn">‹</button>
            <span className="calendar-title">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="calendar-arrow-btn">›</button>
          </div>
        </div>
        <div className="calendar-grid">
          {weekDays.map(wd => (
            <div key={wd} className="calendar-cell calendar-weekday">{wd}</div>
          ))}
          {matrix.flat().map((cell, i) =>
            cell ? (
              <div
                key={i}
                className={
                  "calendar-cell calendar-day" +
                  (year === today.getFullYear() && month === today.getMonth() && cell === today.getDate()
                    ? " calendar-today"
                    : "")
                }
              >
                <span className="calendar-day-num">{cell}</span>
                <span className="calendar-braille">
                  {cell.toString().split('').map((digit, idx) => {
                    const pattern = digitsMap && digitsMap[digit] ? digitsMap[digit] : [0,0,0,0,0,0];
                    return <BrailleDigit key={idx} dots={pattern} />;
                  })}
                </span>
              </div>
            ) : (
              <div key={i} className="calendar-cell calendar-empty"></div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
