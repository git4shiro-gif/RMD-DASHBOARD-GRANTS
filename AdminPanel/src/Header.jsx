import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [openDropdown, setOpenDropdown] = useState(null); // 'about' | 'announcements' | 'grants' | null
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
    setMobileNavOpen(false);
    setOpenDropdown(null);
  };

  // Close nav and dropdowns on link click
  const handleNavLinkClick = (cb) => {
    if (cb) cb();
    setMobileNavOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header className="header">
        <div className="header-left-mobile-menu">
        <button className="menu-icon" aria-label="Open navigation" onClick={() => {
          setMobileNavOpen((v) => !v);
          setOpenDropdown(null);
        }}>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
      </div>
      <nav className={`main-nav${mobileNavOpen ? ' nav-open' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0, width: '100%' }}>
        <button className="nav-btn" onClick={handleHomeClick}>Home</button>
        <span style={{ display: 'inline-block', height: '28px', borderLeft: '1.5px solid #d1d5db', margin: '0 16px', verticalAlign: 'middle' }}></span>
        <a href="https://www.gov.ph/" target="_blank" rel="noopener noreferrer" className="ched-brand" style={{ fontWeight: 700, color: '#0033a0', textDecoration: 'none', fontSize: '1rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', height: '40px' }}>
          GOVPH
        </a>
        <a
          className="nav-btn"
          href="https://sites.google.com/ched.gov.ph/chedoprkm/home?authuser=0"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setMobileNavOpen(false); setOpenDropdown(null); }}
          style={{ marginLeft: 24, fontWeight: 700, textDecoration: 'underline', color: '#222' }}
        >
          CHED Funded Research Project
        </a>
        {/* About Us Button with Modal */}
        <div className="nav-dropdown">
          <button
            className="nav-btn"
            onClick={() => setAboutModalOpen(true)}
            aria-expanded={aboutModalOpen}
          >
            About Us
          </button>
        </div>
        {aboutModalOpen && (
          <div className="about-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setAboutModalOpen(false)}>
            <div className="about-modal-content" style={{ background: '#fff', borderRadius: '16px', maxWidth: 600, width: '90%', padding: '32px 28px', boxShadow: '0 8px 32px rgba(0,51,160,0.18)', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setAboutModalOpen(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#0033a0', cursor: 'pointer', fontWeight: 700 }} aria-label="Close">×</button>
              <h2 style={{ color: '#0033a0', fontWeight: 800, fontSize: '2rem', marginBottom: 18, letterSpacing: '-0.015em', textAlign: 'center' }}>Vision, Mission and Mandate</h2>
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', margin: '18px 0 6px 0' }}>VISION</h3>
                <p style={{ color: '#334155', fontSize: '1rem', margin: 0 }}>
                  Philippine higher education system that is equitable and producing locally responsive, innovative, and globally competitive graduates and lifelong learners.
                </p>
              </div>
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', margin: '18px 0 6px 0' }}>MISSION</h3>
                <p style={{ color: '#334155', fontSize: '1rem', margin: 0 }}>
                  To promote equitable access and ensure quality and relevance of higher education institutions and their programs.
                </p>
              </div>
              <div>
                <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', margin: '18px 0 6px 0' }}>MANDATE</h3>
                <p style={{ color: '#334155', fontSize: '1rem', margin: 0, marginBottom: 10 }}>
                  Given the national government’s commitment to transformational leadership that puts education as the central strategy for investing in the Filipino people, reducing poverty, and building national competitiveness and pursuant to Republic Act 7722, CHED shall:
                </p>
                <ul style={{ color: '#334155', fontSize: '1rem', margin: 0, paddingLeft: 22, marginBottom: 0 }}>
                  <li style={{ marginBottom: 8 }}>Promote relevant and quality higher education (i.e. higher education institutions and programs are at par with international standards and graduates and professionals are highly competent and recognized in the international arena);</li>
                  <li style={{ marginBottom: 8 }}>Ensure that quality higher education is accessible to all who seek it particularly those who may not be able to afford it;</li>
                  <li style={{ marginBottom: 8 }}>Guarantee and protect academic freedom for continuing intellectual growth, advancement of learning and research, development of responsible and effective leadership, education of high level professionals, and enrichment of historical and cultural heritages; and</li>
                  <li style={{ marginBottom: 0 }}>Commit to moral ascendancy that eradicates corrupt practices, institutionalizes transparency and accountability and encourages participatory governance in the Commission and the sub-sector.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {/* Announcements Dropdown */}
        <div className="nav-dropdown">
          <button
            className="nav-btn"
            onClick={() => setOpenDropdown(openDropdown === 'announcements' ? null : 'announcements')}
            aria-expanded={openDropdown === 'announcements'}
          >
            Announcements ▾
          </button>
          {openDropdown === 'announcements' && (
            <div className="dropdown-menu" style={{ minWidth: 180, padding: 0 }}>
              <a href="#" className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick()}>Information</a>
              <a href="#" className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick()}>Procurement</a>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', boxSizing: 'border-box', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => { handleNavLinkClick(() => navigate('/fullcalendar')); }}>Events (Full Calendar)</button>
            </div>
          )}
        </div>
        {/* Grants Dropdown */}
        <div className="nav-dropdown">
          <button
            className="nav-btn"
            onClick={() => setOpenDropdown(openDropdown === 'grants' ? null : 'grants')}
            aria-expanded={openDropdown === 'grants'}
          >
            Grants ▾
          </button>
          {openDropdown === 'grants' && (
            <div className="dropdown-menu" style={{ minWidth: 180, padding: 0 }}>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', textAlign: 'left', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick(() => navigate('/grants/gia'))}>GIA</button>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', textAlign: 'left', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick(() => navigate('/grants/idig'))}>IDIG</button>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', textAlign: 'left', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick(() => navigate('/grants/lakas'))}>LAKAS</button>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', textAlign: 'left', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick(() => navigate('/grants/pcari'))}>PCARI</button>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', textAlign: 'left', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick(() => navigate('/grants/salikha'))}>SALIKHA</button>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', textAlign: 'left', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick(() => navigate('/grants/dareto'))}>DARETO</button>
              <button className="dropdown-item" style={{ padding: '10px 24px', minWidth: 180, width: '100%', display: 'block', textAlign: 'left', boxSizing: 'border-box', background: 'none', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = '#eaf2ff'} onMouseOut={e => e.currentTarget.style.background = ''} onClick={() => handleNavLinkClick(() => navigate('/grants/nafes'))}>NAFES</button>
            </div>
          )}
        </div>
      </nav>
      <div className="header-right">
        <img 
          src="/images/right-logo.png"
          alt="Right Logo" 
          className="right-logo"
        />
      </div>
    </header>
  );
}

export default Header;