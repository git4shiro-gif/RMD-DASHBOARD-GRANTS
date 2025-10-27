import React from 'react'

function Insert6() {
  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>INSERT6 PAGE</h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #b6ccfb 0%, #d4e3fc 100%)',
          padding: '40px 60px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(182, 204, 251, 0.3)',
          color: '#0033a0'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '20px',
            fontWeight: '700'
          }}>
            Insert6 Content
          </h1>
          <p style={{ 
            fontSize: '1.2rem',
            opacity: '0.9'
          }}>
            This is the Insert6 page. Add your content here.
          </p>
        </div>
      </div>
    </main>
  )
}

export default Insert6