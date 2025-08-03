'use client'

import React from 'react';
import './styles.css'

/**
 * Props for Header component:
 * - onLogoClick: callback to return to home when the logo is clicked
 */
type HeaderProps = {
  onLogoClick: () => void;
};

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <div className="edu-logo" onClick={onLogoClick}>
            <span>
              <img
                src="/images/Graduation_Cap.png"
                alt="Graduation-Cap"
                className="icon-logo"
                onClick={onLogoClick}
              />
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button className="header-button">ESSAY FAQ</button>
          <a
              href="/financial_aid_guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="header-button"
            >
              FINANCIAL AID GUIDE
            </a>
        </div>
      </div>
    </header>
  );
}