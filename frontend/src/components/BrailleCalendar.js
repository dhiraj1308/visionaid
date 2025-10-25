import React, { useState } from 'react';
import './BrailleCalendar.css';

// Braille digit patterns (0-9)
const brailleDigits = {
  0: [0,1,1,1,1,0],
  1: [1,0,0,0,0,0],
  2: [1,1,0,0,0,0],
  3: [1,0,0,1,0,0],
  4: [1,0,0,1,1,0],
  5: [1,0,0,0,1,0],
  6: [1,1,0,1,0,0],
  7: [1,1,0,1,1,0],
  8: [1,1,0,0,1,0],
  9: [0,1,0,1,0,0],
};

// Braille digit renderer
function BrailleDigit({ digit }) {
  const dots = brailleDigits[digit] || [0,0,0,0,0,0];
  return (
    <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2,10px)',
        gridTemplateRows: 'repeat(3,10px)',
        gap: '3px',
        margin: '0 auto'
      }}>
        {dots.map((filled, idx) => (
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
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const matrix = getMonthMatrix(year, month);

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
                  {cell.toString().split('').map((digit, idx) => (
                    <BrailleDigit key={idx} digit={parseInt(digit)} />
                  ))}
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
