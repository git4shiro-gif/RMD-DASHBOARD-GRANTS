
import React from 'react';


function Home() {
  return (
    <main className="main-container">
      {/* CHED Banner Section (aligned with header width) */}
  <div>
        <div className="ched-banner">
          <div className="ched-banner-bg">
            <img src="/images/homepage-picture.jpg" alt="Background" className="ched-bg-image" />
          </div>
          <div className="ched-banner-content">
            <div className="ched-banner-left">
              <img src="/images/ched-sel.png" alt="CHED Seal" className="ched-seal" />
            </div>
            <div className="ched-banner-right">
              <img src="/images/bagong-pilipinas.png" alt="Bagong Pilipinas" className="banner-logo" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
