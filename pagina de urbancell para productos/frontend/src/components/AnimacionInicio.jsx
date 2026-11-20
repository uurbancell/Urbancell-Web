import { useState, useEffect } from 'react';

export default function AnimacionInicio() {
  const [show, setShow] = useState(true);
  const [shifted, setShifted] = useState(false);

  useEffect(() => {
    const timerShift = setTimeout(() => {
      setShifted(true);
    }, 1200);

    const timerHide = setTimeout(() => {
      setShow(false);
    }, 4500);

    return () => {
      clearTimeout(timerShift);
      clearTimeout(timerHide);
    };
  }, []);

  if (!show) return null;

  const urbanText = "URBAN";
  const cellText = "CELL";

  return (
    <div className={`intro-overlay ${!show ? 'fade-out' : ''}`}>
      <div className={`intro-container ${shifted ? 'shifted' : ''}`}>
        <div className="intro-logo-box">
          <img src="/logo.jpg" alt="Urbancell Paysandú" className="intro-logo-img" />
        </div>
        <div className="intro-brand-box">
          <div className="intro-title">
            {urbanText.split("").map((char, index) => (
              <span key={`u-${index}`} className="char urban-char" style={{ animationDelay: `${2.0 + (index * 0.1)}s` }}>
                {char}
              </span>
            ))}
            {cellText.split("").map((char, index) => (
              <span key={`c-${index}`} className="char cell-char" style={{ animationDelay: `${2.5 + (index * 0.1)}s` }}>
                {char}
              </span>
            ))}
          </div>
          <div className="intro-subtitle">PAYSANDÚ</div>
        </div>
      </div>
    </div>
  );
}