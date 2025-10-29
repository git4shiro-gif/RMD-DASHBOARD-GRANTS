
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUpload, FaFolderOpen, FaMoneyBillWave, FaHandHoldingUsd, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : `http://${window.location.hostname}:5000`;

function IDIG() {
  const [selectedYear, setSelectedYear] = useState('All');
  const [fiscalYears, setFiscalYears] = useState(['All']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const chartRefs = useRef({});
  const sliderRef = useRef(null);
  const imageRefs = useRef([]);
  const [idigData, setIdigData] = useState({
    overview: { totalGrants: 0, totalAmount: 0, totalReleased: 0, activeProjects: 0, completedProjects: 0 },
    priorityArea: [],
    yearlyTrends: [],
    regionData: [],
    heiType: [],
    status: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 4);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const formatAmount = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '₱0.00';
    return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatAmountShort = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '₱0';
    if (num >= 1000000) {
      return `₱${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `₱${(num / 1000).toFixed(0)}K`;
    }
    return `₱${num.toLocaleString()}`;
  };

  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US');
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const API_BASE = `${API_BASE_URL}/api/idig`;
        const yearlyRes = await fetch(`${API_BASE}/yearly-trends`);
        const yearlyData = await yearlyRes.json();
        const years = ['All', ...yearlyData.map(item => item.year).sort((a, b) => b - a)];
        setFiscalYears(years);
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    const fetchIdigData = async () => {
      try {
        setLoading(true);
        const API_BASE = `${API_BASE_URL}/api/idig`;
        const yearParam = selectedYear !== 'All' ? `?year=${selectedYear}` : '';
        const [overviewRes, priorityRes, yearlyRes, regionRes, heiRes, statusRes] = await Promise.all([
          fetch(`${API_BASE}/overview${yearParam}`),
          fetch(`${API_BASE}/priority-area${yearParam}`),
          fetch(`${API_BASE}/yearly-trends`),
          fetch(`${API_BASE}/region${yearParam}`),
          fetch(`${API_BASE}/hei-type${yearParam}`),
          fetch(`${API_BASE}/status${yearParam}`)
        ]);
        const overview = await overviewRes.json();
        const priorityArea = await priorityRes.json();
        const yearlyTrends = await yearlyRes.json();
        const regionData = await regionRes.json();
        const heiType = await heiRes.json();
        const status = await statusRes.json();
        const colors = ['#0033a0', '#0052cc', '#3b82f6', '#60a5fa', '#93c5fd'];
        const priorityWithColors = priorityArea.map((item, index) => ({ ...item, color: colors[index % colors.length] }));
        const heiWithColors = heiType.map((item, index) => ({ ...item, color: colors[index % colors.length] }));
        const statusColors = {
          'Completed': '#10b981',
          'Due': '#f59e0b',
          'Withdrawn': '#ef4444',
          'Pending release due to unliquidated accounts': '#8b5cf6',
          'Overdue': '#dc2626',
          'Ongoing': '#3b82f6'
        };
        const statusWithColors = status.map(item => ({ ...item, color: statusColors[item.name] || '#64748b' }));
        setIdigData({
          overview,
          priorityArea: priorityWithColors.length > 0 ? priorityWithColors : [],
          yearlyTrends: yearlyTrends.length > 0 ? yearlyTrends : [],
          regionData: regionData.length > 0 ? regionData : [],
          heiType: heiWithColors.length > 0 ? heiWithColors : [],
          status: statusWithColors.length > 0 ? statusWithColors : []
        });
        setLoading(false);
      } catch (error) {
        setIdigData({
          overview: { totalGrants: 0, totalAmount: 0, totalReleased: 0, activeProjects: 0, completedProjects: 0 },
          priorityArea: [],
          yearlyTrends: [],
          regionData: [],
          heiType: [],
          status: []
        });
        setLoading(false);
      }
    };
    fetchIdigData();
  }, [selectedYear]);

  useEffect(() => {
    setVisibleCharts({ chart1: true, chart2: true, chart3: true, chart4: true, chart5: true, chart6: true, chart7: true, chart8: true, chart9: true });
  }, []);

  const handleFileUpload = async (file, replaceAll = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replaceAll', replaceAll.toString());
    try {
      const response = await fetch(`${API_BASE_URL}/api/idig/upload-csv`, { method: 'POST', body: formData });
      const result = await response.json();
      if (response.ok) {
        alert(`Success! ${result.recordsProcessed} records uploaded. ${replaceAll ? 'All previous data was replaced.' : 'Data was merged with existing records.'}\n\nRefreshing data...`);
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <main className='main-container' style={{ padding: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⏳</div>
          <h2 style={{ color: '#0033a0' }}>Loading IDIG data...</h2>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="main-container">
      {/* CHED Banner Section */}
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
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Page Header */}
        <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '3px solid rgba(0, 51, 160, 0.08)' }}>
          <h1 style={{ color: '#0f172a', fontSize: '2.25rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>
            IDIG Grants
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '0 0 8px 0', fontWeight: '500' }}>
            <a href="https://ched.gov.ph/wp-content/uploads/CMO-NO.-17-S.-2021.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#0033a0', textDecoration: 'none' }}>
              CMO No. 17 series of 2021
            </a>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0', lineHeight: '1.5' }}>
            IDIG research grants support development and innovation initiatives in higher education institutions.
          </p>
        </header>
        </div>
        <div ref={sliderRef} style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(0, 51, 160, 0.1)', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.15)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {['/images/Slide1.jpg', '/images/Slider2.jpg', '/images/Slider3.jpg', '/images/Slider4.jpg'].map((image, index) => (
            <img key={index} ref={el => (imageRefs.current[index] = el)} src={image} alt={`slide-${index + 1}`} style={{ width: '100%', height: 'auto', display: index === currentSlide ? 'block' : 'none', transition: 'opacity 0.5s ease-in-out' }} loading="lazy" />
          ))}
          {/* Left Arrow */}
          <button onClick={() => setCurrentSlide(prev => (prev === 0 ? 3 : prev - 1))} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255, 255, 255, 0.5)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0033a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          {/* Right Arrow */}
          <button onClick={() => setCurrentSlide(prev => (prev === 3 ? 0 : prev + 1))} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255, 255, 255, 0.5)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0033a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          {/* Slider Navigation Dots */}
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 2 }}>
            {[0, 1, 2, 3].map(index => (
              <button key={index} onClick={() => setCurrentSlide(index)} style={{ width: '20px', height: '2px', border: 'none', background: index === currentSlide ? '#fff' : 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
            ))}
          </div>
          {/* Gradient Overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />
        </div>
        {/* Navigation and Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', background: '#ffffff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 51, 160, 0.06)', border: '1px solid rgba(0, 51, 160, 0.08)' }}>
          {/* Left Side - Upload Button Only */}
          <div onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv'; input.onchange = e => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); }; input.click(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #0066dd 0%, #0052cc 100%)', color: '#fff', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 221, 0.25)', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s ease', border: 'none' }}><FaUpload style={{ fontSize: '16px' }} /><span>Upload Grant</span></div>
          {/* Year Filter */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0033a0 0%, #0052cc 100%)', borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontWeight: '600', boxShadow: '0 4px 12px rgba(0, 51, 160, 0.2)' }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginBottom: '2px' }}>Fiscal Year</div>
                <div style={{ fontSize: '16px' }}>FY {selectedYear}</div>
              </div>
              <span style={{ fontSize: '20px', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</span>
            </div>
            {isDropdownOpen && (<div style={{ position: 'absolute', top: '100%', left: '0', right: '0', marginTop: '8px', background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 51, 160, 0.15)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 51, 160, 0.15)', zIndex: '100' }}>{fiscalYears.map(year => (<div key={year} style={{ padding: '12px 20px', cursor: 'pointer', color: selectedYear === year ? '#0033a0' : '#1e293b', background: selectedYear === year ? 'rgba(0, 51, 160, 0.05)' : 'transparent', fontWeight: selectedYear === year ? '700' : '500', borderLeft: selectedYear === year ? '4px solid #0033a0' : '4px solid transparent' }} onClick={() => { setSelectedYear(year); setIsDropdownOpen(false); }}>FY {year}</div>))}</div>)}
          </div>
        </div>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {[
            { title: 'Total Projects', subtitle: 'All IDIG grants', value: formatNumber(idigData.overview.totalGrants), icon: <FaFolderOpen />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
            { title: 'Total Amount', subtitle: 'Total grant amount', value: formatAmount(idigData.overview.totalAmount), icon: <FaMoneyBillWave />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
            { title: 'Total Released', subtitle: 'Funds released', value: formatAmount(idigData.overview.totalReleased), icon: <FaHandHoldingUsd />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
            { title: 'Active Projects', subtitle: 'Ongoing', value: formatNumber(idigData.overview.activeProjects), icon: <FaSpinner />, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' },
            { title: 'Completed Projects', subtitle: 'Finished', value: formatNumber(idigData.overview.completedProjects), icon: <FaCheckCircle />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' }
          ].map((card, idx) => (
            <div key={idx} style={{ background: card.bgColor, borderRadius: '14px', padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0, 51, 160, 0.06)', border: '1px solid rgba(0, 51, 160, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 10 }}>
                <span style={{ color: card.color, fontSize: 28 }}>{card.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>{card.title}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 6 }}>{card.subtitle}</div>
              <div style={{ fontWeight: 800, fontSize: 28, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>
    </main>
  );
}

export default IDIG;