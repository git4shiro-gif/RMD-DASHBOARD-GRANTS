import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  PieChart, Pie, Cell,
  BarChart, Bar, 
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid,
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FaHome, FaUpload, FaFolderOpen, FaMoneyBillWave, FaSpinner, FaCheckCircle } from 'react-icons/fa';

// Auto-detect backend URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : `http://${window.location.hostname}:5000`;

function GIA() {
  const [selectedYear, setSelectedYear] = useState('All')
  const [fiscalYears, setFiscalYears] = useState(['All'])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [visibleCharts, setVisibleCharts] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const chartRefs = useRef({})
  const sliderRef = useRef(null)
  const imageRefs = useRef([])
  const [giaData, setGiaData] = useState({
    overview: { totalGrants: 0, totalAmount: 0, activeProjects: 0, completedProjects: 0 },
    priorityArea: [],
    yearlyTrends: [],
    regionData: [],
    heiType: [],
    status: []
  })
  const [loading, setLoading] = useState(true)

  const COLORS = ['#0033a0', '#0052cc', '#0066dd', '#3399ff', '#66b3ff', '#99ccff']

  // Auto slider effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 4)
    }, 5000)
    return () => clearInterval(slideTimer)
  }, [])

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '0';
    return '' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US');
  };

  // Fetch years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/gia/yearly-trends`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.warn('Expected array of years but got:', data);
          return;
        }
        const years = ['All', ...data.map(item => item.year).filter(year => year).sort((a, b) => b - a)];
        setFiscalYears(years);
      } catch (error) {
        console.error('Error fetching GIA years:', error);
      }
    };
    fetchYears();
  }, []);

  // Fetch GIA data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const yearParam = selectedYear !== 'All' ? `?year=${selectedYear}` : '';
        
        const fetchWithErrorHandling = async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        };

        const [overview, priority, yearly, region, hei, status] = await Promise.all([
          fetch(`${API_BASE_URL}/api/gia/overview${yearParam}`).then(r => r.json()),
          fetchWithErrorHandling(`${API_BASE_URL}/api/gia/priority-area${yearParam}`),
          fetchWithErrorHandling(`${API_BASE_URL}/api/gia/yearly-trends`),
          fetchWithErrorHandling(`${API_BASE_URL}/api/gia/region${yearParam}`),
          fetchWithErrorHandling(`${API_BASE_URL}/api/gia/hei-type${yearParam}`),
          fetchWithErrorHandling(`${API_BASE_URL}/api/gia/status${yearParam}`)
        ]);

        // Calculate total disbursed from priority area data (most comprehensive breakdown)
        const priorityData = Array.isArray(priority) ? priority.map(i => ({ 
          name: i.area || 'Unspecified', 
          value: Number(i.projects) || 0, 
          amount: Number(i.amount) || 0 
        })) : [];
        const calculatedTotalDisbursed = priorityData.reduce((sum, item) => sum + (item.amount || 0), 0);

        setGiaData({
          overview: {
            ...overview,
            totalDisbursed: calculatedTotalDisbursed // Override with calculated total from charts
          },
          priorityArea: priorityData,
          yearlyTrends: yearly.map(i => ({ year: String(i.year), projects: Number(i.projects), amount: Number(i.amount) })),
          regionData: region.map(i => ({ region: i.region, projects: Number(i.projects), amount: Number(i.amount) })),
          heiType: hei.map(i => ({ name: i.type, value: Number(i.projects), amount: Number(i.amount) })),
          status: status.map(i => ({ name: i.status, value: Number(i.projects), amount: Number(i.amount) }))
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching GIA data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replaceAll', 'true');

    try {
      const response = await fetch(`${API_BASE_URL}/api/gia/upload-csv`, { method: 'POST', body: formData });
      const result = await response.json();
      if (response.ok) {
        alert(`Success! ${result.recordsProcessed} records uploaded.`);
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error uploading file.');
    }
  };

  return (
    <main className="main-container">
      {/* CHED Banner Section (standardized) */}
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
        {/* Page Header (modeled after NAFES) */}
        <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '3px solid rgba(0, 51, 160, 0.08)' }}>
          <h1 style={{ color: '#0f172a', fontSize: '2.25rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>
            Grants-in-Aid (GIA) for Research and Extension
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '0 0 8px 0', fontWeight: '500' }}>
            <a href="https://ched.gov.ph/wp-content/uploads/2017/10/CMO-52-s.-2016.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#0033a0', textDecoration: 'none' }}>
              CMO No. 52, Series of 2016
            </a>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0', lineHeight: '1.5' }}>
            Pathways to Equity, Relevance and Advancement in Research, Innovation, and Extension in Philippine Higher Education
          </p>
        </header>
        <div ref={sliderRef} style={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          marginBottom: '32px',
          border: '1px solid rgba(0, 51, 160, 0.1)',
          boxShadow: '0 8px 24px rgba(0, 51, 160, 0.15)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {['/images/Slide1.jpg', '/images/Slider2.jpg', '/images/Slider3.jpg', '/images/Slider4.jpg'].map((image, index) => (
            <img
              key={index}
              ref={el => (imageRefs.current[index] = el)}
              src={image}
              alt={`slide-${index + 1}`}
              style={{
                width: '100%',
                height: 'auto',
                display: index === currentSlide ? 'block' : 'none',
                transition: 'opacity 0.5s ease-in-out'
              }}
              loading="lazy"
            />
          ))}
          {/* Left Arrow */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? 3 : prev - 1))}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0033a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          {/* Right Arrow */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 3 ? 0 : prev + 1))}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0033a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          {/* Slider Navigation Dots */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            zIndex: 2
          }}>
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '20px',
                  height: '2px',
                  border: 'none',
                  background: index === currentSlide ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
              />
            ))}
          </div>
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Navigation and Filter Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '24px', 
          marginBottom: '32px', 
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 51, 160, 0.06)',
          border: '1px solid rgba(0, 51, 160, 0.08)'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              
            </Link>
            <div onClick={() => { 
              const input = document.createElement('input'); 
              input.type = 'file'; 
              input.accept = '.csv'; 
              input.onchange = (e) => { 
                if (e.target.files[0]) handleFileUpload(e.target.files[0]); 
              }; 
              input.click(); 
            }} style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'linear-gradient(135deg, #0066dd 0%, #0052cc 100%)', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(0, 102, 221, 0.25)', 
              fontWeight: '600', 
              fontSize: '14px',
              transition: 'all 0.2s ease',
              border: 'none'
            }}>
              <FaUpload style={{ fontSize: '16px' }} />
              <span>Upload Grant</span>
            </div>
          </div>

          {/* Year Filter */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0033a0 0%, #0052cc 100%)',
              borderRadius: '12px',
              padding: '12px 20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0, 51, 160, 0.2)'
            }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div>
                <div style={{ fontSize: '12px', opacity: '0.7', marginBottom: '2px' }}>Fiscal Year</div>
                <div style={{ fontSize: '16px' }}>FY {selectedYear}</div>
              </div>
              <span style={{ 
                fontSize: '20px',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}>▼</span>
            </div>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                marginTop: '8px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 51, 160, 0.15)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 51, 160, 0.15)',
                zIndex: '100'
              }}>
                {fiscalYears.map((year) => (
                  <div
                    key={year}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      color: selectedYear === year ? '#0033a0' : '#1e293b',
                      background: selectedYear === year ? 'rgba(0, 51, 160, 0.05)' : 'transparent',
                      fontWeight: selectedYear === year ? '700' : '500',
                      borderLeft: selectedYear === year ? '4px solid #0033a0' : '4px solid transparent'
                    }}
                    onClick={() => {
                      setSelectedYear(year)
                      setIsDropdownOpen(false)
                    }}
                  >
                    FY {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px', 
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)'
          }}>
            <FaSpinner style={{ fontSize: '56px', animation: 'spin 1s linear infinite', color: '#0033a0' }} />
            <p style={{ marginTop: '20px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Loading GIA data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px', 
              marginBottom: '48px' 
            }}>
              {[
                { title: 'Total Grants', subtitle: 'All GIA grants', value: formatNumber(giaData.overview.totalGrants), icon: FaFolderOpen, color: '#0033a0', bgColor: '#eff6ff', tooltip: 'COUNT of all grants with complete data' },
                { title: 'Total Disbursed', subtitle: 'Amount disbursed', value: formatCurrency(giaData.overview.totalDisbursed), icon: FaMoneyBillWave, color: '#0052cc', bgColor: '#f0f9ff', tooltip: 'CSV Column Q (DISBURSED) - Total amount actually paid out' },
                { title: 'Disbursed Projects', subtitle: 'Has disbursements', value: formatNumber(giaData.overview.disbursedProjects || 0), icon: FaCheckCircle, color: '#00aa55', bgColor: '#f0fdf4', tooltip: 'Status = Disbursed (Column Q > 0)' },
                { title: 'Obligated Projects', subtitle: 'Obligated only', value: formatNumber(giaData.overview.obligatedProjects || 0), icon: FaSpinner, color: '#ff9800', bgColor: '#fff7ed', tooltip: 'Status = Obligated (Column P > 0, but Q = 0)' }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} style={{ 
                    background: '#ffffff', 
                    borderRadius: '20px', 
                    padding: '28px', 
                    border: `1px solid rgba(0, 51, 160, 0.08)`,
                    boxShadow: '0 4px 16px rgba(0, 51, 160, 0.08)',
                    cursor: 'help',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }} title={card.tooltip}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: card.bgColor,
                      borderRadius: '0 0 0 100%',
                      opacity: 0.5
                    }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                      <div style={{
                        background: card.bgColor,
                        padding: '14px',
                        borderRadius: '14px',
                        marginRight: '16px',
                        boxShadow: `0 4px 12px ${card.color}20`
                      }}>
                        <Icon style={{ fontSize: '28px', color: card.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.subtitle}</div>
                        <div style={{ color: '#0f172a', fontSize: '15px', fontWeight: '700' }}>{card.title}</div>
                      </div>
                    </div>
                    <div style={{ color: card.color, fontSize: '32px', fontWeight: '800', position: 'relative', zIndex: 1, letterSpacing: '-0.025em' }}>{card.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row 1: Priority Area and Year - Projects */}
            <div className='charts-row' style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '32px',
              marginBottom: '48px'
            }}>
              <div style={{ 
                background: '#ffffff', 
                padding: '32px', 
                borderRadius: '24px', 
                boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)', 
                border: '1px solid rgba(0, 51, 160, 0.08)',
                height: '720px' 
              }}>
                <h4 style={{ 
                  margin: '0 0 24px 0', 
                  color: '#0f172a', 
                  fontSize: '20px', 
                  fontWeight: '800', 
                  cursor: 'help',
                  letterSpacing: '-0.025em',
                  paddingBottom: '16px',
                  borderBottom: '2px solid rgba(0, 51, 160, 0.08)'
                }} title="Data source: COUNT of grants grouped by Priority Area">
                  Per Priority Area (Number of Projects)
                </h4>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart 
                    data={giaData.priorityArea} 
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                    barGap={8}
                    barCategoryGap={15}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                    <XAxis 
                      type="number" 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#0f172a" 
                      style={{ fontSize: '11px' }}
                      width={240}
                      interval={0}
                      tick={{ width: 230, wordWrap: 'break-word' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatNumber(value)}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="value" name="Projects" radius={[0, 8, 8, 0]}>
                      {giaData.priorityArea.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '10px 15px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)', borderRadius: '8px', border: '2px solid #0033a0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Projects</div>
                  <div style={{ fontSize: '16px', color: '#0033a0', fontWeight: '700' }}>{formatNumber(giaData.priorityArea.reduce((sum, item) => sum + (item.value || 0), 0))}</div>
                </div>
              </div>

              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: COUNT of grants grouped by Year Awarded">
                  Per Year Awarded (Number of Projects)
                </h4>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart 
                    data={giaData.yearlyTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip 
                      formatter={(value) => formatNumber(value)}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="projects" name="Projects" fill="#0033a0" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2: Priority Area and Year - Amount */}
            <div className='charts-row' style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '700px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: CSV Column Q (DISBURSED) - SUM grouped by Priority Area">
                  Per Priority Area (Disbursed Amount)
                </h4>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart 
                    data={giaData.priorityArea} 
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                    barGap={8}
                    barCategoryGap={15}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                    <XAxis 
                      type="number" 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#0f172a" 
                      style={{ fontSize: '11px' }}
                      width={240}
                      interval={0}
                      tick={{ width: 230, wordWrap: 'break-word' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="amount" name="Amount" radius={[0, 8, 8, 0]}>
                      {giaData.priorityArea.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '10px 15px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)', borderRadius: '8px', border: '2px solid #0033a0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Disbursed</div>
                  <div style={{ fontSize: '16px', color: '#0033a0', fontWeight: '700' }}>{formatCurrency(giaData.priorityArea.reduce((sum, item) => sum + (item.amount || 0), 0))}</div>
                </div>
              </div>

              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: CSV Column Q (DISBURSED) - SUM grouped by Year Awarded">
                  Per Year Awarded (Disbursed Amount)
                </h4>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart 
                    data={giaData.yearlyTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} 
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="amount" name="Amount" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 3: Region and HEI Type - Projects */}
            <div className='charts-row' style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: COUNT of grants grouped by Region">
                  Per Region (Number of Projects)
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart 
                    data={giaData.regionData} 
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                    <XAxis 
                      type="number" 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis 
                      dataKey="region" 
                      type="category" 
                      stroke="#0f172a" 
                      style={{ fontSize: '11px' }}
                      width={100}
                      interval={0}
                    />
                    <Tooltip 
                      formatter={(value) => formatNumber(value)}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="projects" name="Projects" fill="#0052cc" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: COUNT of grants grouped by HEI Type (determined from HEI Name)">
                  Per HEI Type (Number of Projects)
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie 
                      data={giaData.heiType} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={({ name, value }) => `${name}: ${formatNumber(value)}`} 
                      outerRadius={80} 
                      dataKey="value"
                    >
                      {giaData.heiType.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '10px 15px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)', borderRadius: '8px', border: '2px solid #0033a0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Projects</div>
                  <div style={{ fontSize: '16px', color: '#0033a0', fontWeight: '700' }}>{formatNumber(giaData.heiType.reduce((sum, item) => sum + (item.value || 0), 0))}</div>
                </div>
              </div>
            </div>

            {/* Charts Row 4: Region and HEI Type - Amount */}
            <div className='charts-row' style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: CSV Column Q (DISBURSED) - SUM grouped by Region">
                  Per Region (Disbursed Amount)
                </h4>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart 
                    data={giaData.regionData} 
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} 
                      stroke="#0f172a" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      dataKey="region" 
                      type="category" 
                      stroke="#0f172a" 
                      style={{ fontSize: '11px' }}
                      width={100}
                      interval={0}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="amount" name="Amount" fill="#10b981" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: CSV Column Q (DISBURSED) - SUM grouped by HEI Type (determined from HEI Name)">
                  Per HEI Type (Disbursed Amount)
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie 
                      data={giaData.heiType} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={({ name, amount }) => `${name}: ${formatCurrency(amount)}`} 
                      outerRadius={80} 
                      dataKey="amount"
                    >
                      {giaData.heiType.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '10px 15px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)', borderRadius: '8px', border: '2px solid #0033a0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Disbursed</div>
                  <div style={{ fontSize: '16px', color: '#0033a0', fontWeight: '700' }}>{formatCurrency(giaData.heiType.reduce((sum, item) => sum + (item.amount || 0), 0))}</div>
                </div>
              </div>
            </div>

            {/* Charts Row 5: Status - Projects and Amount */}
            <div className='charts-row' style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: Exclusive stages - Amount (only N>0) | Allocated (O>0, P=0, Q=0) | Obligated (P>0, Q=0) | Disbursed (Q>0)">
                  Status (Number of Projects)
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie 
                      data={giaData.status} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={({ name, value }) => `${name}: ${formatNumber(value)}`} 
                      outerRadius={80} 
                      dataKey="value"
                    >
                      {giaData.status.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '10px 15px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)', borderRadius: '8px', border: '2px solid #0033a0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Projects</div>
                  <div style={{ fontSize: '16px', color: '#0033a0', fontWeight: '700' }}>{formatNumber(giaData.status.reduce((sum, item) => sum + (item.value || 0), 0))}</div>
                </div>
              </div>

              <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 51, 160, 0.1)', height: '400px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700', cursor: 'help' }} title="Data source: SUM(Column Q) grouped by exclusive stages - Amount (only N>0) | Allocated (O>0, P=0, Q=0) | Obligated (P>0, Q=0) | Disbursed (Q>0)">
                  Status (Disbursed Amount)
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie 
                      data={giaData.status} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={({ name, amount }) => `${name}: ${formatCurrency(amount)}`} 
                      outerRadius={80} 
                      dataKey="amount"
                    >
                      {giaData.status.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '10px 15px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)', borderRadius: '8px', border: '2px solid #0033a0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Disbursed</div>
                  <div style={{ fontSize: '16px', color: '#0033a0', fontWeight: '700' }}>{formatCurrency(giaData.status.reduce((sum, item) => sum + (item.amount || 0), 0))}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

export default GIA