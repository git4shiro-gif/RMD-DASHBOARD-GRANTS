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
import { FaUpload, FaFolderOpen, FaMoneyBillWave, FaHandHoldingUsd, FaSpinner, FaCheckCircle } from 'react-icons/fa';

// Auto-detect backend URL - use network IP instead of localhost for multi-device access
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : `http://${window.location.hostname}:5000`;

function NAFES() {
  const [selectedYear, setSelectedYear] = useState('All')
  const [fiscalYears, setFiscalYears] = useState(['All'])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [visibleCharts, setVisibleCharts] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const chartRefs = useRef({})
  const sliderRef = useRef(null)
  const imageRefs = useRef([])
  const [nafesData, setNafesData] = useState({
    overview: { totalGrants: 0, totalAmount: 0, totalReleased: 0, activeProjects: 0, completedProjects: 0 },
    priorityArea: [],
    yearlyTrends: [],
    regionData: [],
    heiType: [],
    status: []
  })
  const [loading, setLoading] = useState(true)

  // Auto slider effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 4)
    }, 5000)
    return () => clearInterval(slideTimer)
  }, [])

  // Custom label renderer for pie charts with abbreviated amounts
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

  // Format large numbers with proper comma separation
  const formatAmount = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '₱0.00';
    return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format large numbers abbreviated (for axis labels)
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

  // Fetch available years on component mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const API_BASE = `${API_BASE_URL}/api/nafes`;
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

  // Fetch NAFES data from API
  useEffect(() => {
    const fetchNafesData = async () => {
      try {
        setLoading(true);
        const API_BASE = `${API_BASE_URL}/api/nafes`;
        const yearParam = selectedYear !== 'All' ? `?year=${selectedYear}` : '';

        // Fetch all data in parallel
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

        console.log('=== NAFES DATA FETCHED ===');
        console.log('Overview:', overview);
        console.log('Priority Area:', priorityArea);
        console.log('Yearly Trends:', yearlyTrends);
        console.log('Region Data:', regionData);
        console.log('HEI Type:', heiType);
        console.log('Status:', status);
        console.log('========================');

        // Add colors to priority area data
        const colors = ['#0033a0', '#0052cc', '#3b82f6', '#60a5fa', '#93c5fd'];
        const priorityWithColors = priorityArea.map((item, index) => ({
          ...item,
          color: colors[index % colors.length]
        }));

        // Add colors to HEI type data
        const heiWithColors = heiType.map((item, index) => ({
          ...item,
          color: colors[index % colors.length]
        }));

        // Add colors to status data
        const statusColors = {
          'Completed': '#10b981',
          'Due': '#f59e0b',
          'Withdrawn': '#ef4444',
          'Pending release due to unliquidated accounts': '#8b5cf6',
          'Overdue': '#dc2626',
          'Ongoing': '#3b82f6'
        };
        const statusWithColors = status.map(item => ({
          ...item,
          color: statusColors[item.name] || '#64748b'
        }));

        setNafesData({
          overview,
          priorityArea: priorityWithColors.length > 0 ? priorityWithColors : [],
          yearlyTrends: yearlyTrends.length > 0 ? yearlyTrends : [],
          regionData: regionData.length > 0 ? regionData : [],
          heiType: heiWithColors.length > 0 ? heiWithColors : [],
          status: statusWithColors.length > 0 ? statusWithColors : []
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching NAFES data:', error);
        // Set empty data on error so charts can still render
        setNafesData({
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

    fetchNafesData();
  }, [selectedYear]);

  useEffect(() => {
    // Make all charts visible immediately
    setVisibleCharts({
      chart1: true,
      chart2: true,
      chart3: true,
      chart4: true,
      chart5: true,
      chart6: true,
      chart7: true,
      chart8: true,
      chart9: true
    });
  }, [])

  // Handle CSV file upload
  const handleFileUpload = async (file, replaceAll = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replaceAll', replaceAll.toString());

    try {
      const response = await fetch(`${API_BASE_URL}/api/nafes/upload-csv`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Success! ${result.recordsProcessed} records uploaded. ${replaceAll ? 'All previous data was replaced.' : 'Data was merged with existing records.'}\n\nRefreshing data...`);
        // Refresh the data
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
      <main className='main-container' style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>⏳</div>
          <h2 style={{ color: '#0033a0' }}>Loading NAFES data...</h2>
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
        <header style={{ 
          marginBottom: '32px', 
          paddingBottom: '24px',
          borderBottom: '3px solid rgba(0, 51, 160, 0.08)'
        }}>
          <h1 style={{ 
            color: '#0f172a', 
            fontSize: '2.25rem', 
            fontWeight: '800', 
            margin: '0 0 8px 0',
            letterSpacing: '-0.025em'
          }}>
            NAFES Grants
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '1.05rem', 
            margin: '0 0 8px 0',
            fontWeight: '500'
          }}>
            CMO No. 46, s. 2016
          </p>
          <p style={{ 
            color: '#64748b', 
            fontSize: '0.95rem', 
            margin: '0',
            lineHeight: '1.5'
          }}>
            NAFES grants support national agriculture and fisheries extension system programs and initiatives.
          </p>
        </header>

        {/* Image Slider */}
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
          {[
            '/images/Slide1.jpg',
            '/images/Slider2.jpg',
            '/images/Slider3.jpg',
            '/images/Slider4.jpg'
          ].map((image, index) => (
            <img
              key={index}
              ref={(el) => (imageRefs.current[index] = el)}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
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
          {/* Left Side - Upload Button Only */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Upload Grant Button */}
            <div 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.onchange = (e) => {
                  if (e.target.files[0]) handleFileUpload(e.target.files[0]);
                };
                input.click();
              }}
              style={{ 
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

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          {[
            { title: 'Total Projects', subtitle: 'All NAFES grants', value: formatNumber(nafesData.overview.totalGrants), icon: <FaFolderOpen />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
            { title: 'Budget Approved', subtitle: 'Total allocated budget', value: formatAmount(nafesData.overview.totalAmount), icon: <FaMoneyBillWave />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
            { title: 'Budget Released', subtitle: 'Total budget disbursed', value: formatAmount(nafesData.overview.totalReleased || 0), icon: <FaHandHoldingUsd />, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
            { title: 'Active Projects', subtitle: 'Excludes completed & withdrawn', value: formatNumber(nafesData.overview.activeProjects), icon: <FaSpinner />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
            { title: 'Completed Projects', subtitle: 'Successfully finished', value: formatNumber(nafesData.overview.completedProjects), icon: <FaCheckCircle />, color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' }
          ].map((card, index) => (
            <div key={index} style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#ffffff',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default'
            }}>
              {/* Decorative Background Element */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: card.bgColor,
                opacity: '0.4',
                pointerEvents: 'none'
              }}></div>
              
              {/* Card Header with Icon */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#334155', 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    marginBottom: '4px',
                    letterSpacing: '0.01em'
                  }}>
                    {card.title}
                  </div>
                  <div style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.75rem', 
                    fontWeight: '500',
                    lineHeight: '1.4'
                  }}>
                    {card.subtitle}
                  </div>
                </div>
                <div style={{
                  background: card.bgColor,
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${card.bgColor}`
                }}>
                  <span style={{ fontSize: '24px', color: card.color }}>{card.icon}</span>
                </div>
              </div>
              
              {/* Card Value */}
              <div style={{ 
                color: card.color, 
                fontSize: '2rem', 
                fontWeight: '800',
                position: 'relative',
                zIndex: 1,
                letterSpacing: '-0.02em'
              }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Priority Area and Year Awarded (Projects) */}
        <div className='charts-row' style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Per Priority Area - Bar Chart (Projects) */}
          <div 
            ref={(el) => (chartRefs.current['chart1'] = el)}
            data-chart-id="chart1"
            className={`chart-card ${visibleCharts['chart1'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '720px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per Priority Area (Number of Projects)
            </h4>
            {nafesData.priorityArea.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%', color: '#64748b' }}>
                <p>No data available</p>
              </div>
            ) : (
            <>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart 
                data={nafesData.priorityArea} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                barGap={8}
                barCategoryGap={15}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis 
                  type="number" 
                  stroke="#475569" 
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#475569" 
                  style={{ fontSize: '11px', fontWeight: '500' }}
                  width={240}
                  interval={0}
                  tick={{ width: 230, wordWrap: 'break-word' }}
                />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="projects" name="Projects" radius={[0, 8, 8, 0]}>
                  {nafesData.priorityArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              marginTop: '10px',
              padding: '15px 20px',
              background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)',
              borderRadius: '12px',
              border: '2px solid #0033a0',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600', lineHeight: '1', flexShrink: 0 }}>
                Total Projects
              </div>
              <div style={{ 
                fontSize: '20px', 
                color: '#0033a0', 
                fontWeight: '700', 
                lineHeight: '1', 
                textAlign: 'right',
                wordBreak: 'break-all',
                maxWidth: '70%'
              }}>
                {formatNumber(nafesData.priorityArea.reduce((sum, item) => sum + (item.projects || 0), 0))}
              </div>
            </div>
            </>
            )}
          </div>

          {/* Per Year Awarded - Bar Chart (Projects) */}
          <div 
            ref={(el) => (chartRefs.current['chart2'] = el)}
            data-chart-id="chart2"
            className={`chart-card ${visibleCharts['chart2'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '420px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per Year Awarded (Number of Projects)
            </h4>
            {nafesData.yearlyTrends.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%', color: '#64748b' }}>
                <p>No data available</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={nafesData.yearlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis dataKey="year" stroke="#475569" style={{ fontSize: '12px', fontWeight: '500' }} />
                <YAxis stroke="#475569" style={{ fontSize: '12px', fontWeight: '500' }} />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="projects" fill="#3b82f6" radius={[10, 10, 0, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row 2: Priority Area and Year Awarded (Amount) */}
        <div className='charts-row' style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Per Priority Area - Bar Chart (Amount) */}
          <div 
            ref={(el) => (chartRefs.current['chart3'] = el)}
            data-chart-id="chart3"
            className={`chart-card ${visibleCharts['chart3'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '720px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per Priority Area (Amount)
            </h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart 
                data={nafesData.priorityArea} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                barGap={8}
                barCategoryGap={15}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis 
                  type="number" 
                  stroke="#475569" 
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickFormatter={(value) => formatAmountShort(value)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#475569" 
                  style={{ fontSize: '11px', fontWeight: '500' }}
                  width={240}
                  interval={0}
                  tick={{ width: 230, wordWrap: 'break-word' }}
                />
                <Tooltip 
                  formatter={(value) => formatAmount(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="amount" name="Amount" radius={[0, 8, 8, 0]}>
                  {nafesData.priorityArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              marginTop: '10px',
              padding: '15px 20px',
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              borderRadius: '12px',
              border: '2px solid #f59e0b',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600', lineHeight: '1', flexShrink: 0 }}>
                Total Amount
              </div>
              <div style={{ 
                fontSize: '18px', 
                color: '#f59e0b', 
                fontWeight: '700', 
                lineHeight: '1', 
                textAlign: 'right',
                wordBreak: 'break-all',
                maxWidth: '70%'
              }}>
                {formatAmount(nafesData.priorityArea.reduce((sum, item) => sum + (item.amount || 0), 0))}
              </div>
            </div>
          </div>

          {/* Per Year Awarded - Line Chart (Amount Trend) */}
          <div 
            ref={(el) => (chartRefs.current['chart4'] = el)}
            data-chart-id="chart4"
            className={`chart-card ${visibleCharts['chart4'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '420px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per Year Awarded (Budget Approved vs Released)
            </h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={nafesData.yearlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis dataKey="year" stroke="#475569" style={{ fontSize: '12px', fontWeight: '500' }} />
                <YAxis 
                  stroke="#475569" 
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickFormatter={(value) => formatAmountShort(value)}
                />
                <Tooltip 
                  formatter={(value) => formatAmount(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  name="Budget Approved"
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="released" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="Budget Released"
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3: Region (Projects and Amount) */}
        <div className='charts-row' style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Per Region - Bar Chart (Projects) */}
          <div 
            ref={(el) => (chartRefs.current['chart5'] = el)}
            data-chart-id="chart5"
            className={`chart-card ${visibleCharts['chart5'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '420px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per Region (Number of Projects)
            </h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={nafesData.regionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis dataKey="region" stroke="#475569" style={{ fontSize: '12px', fontWeight: '500' }} />
                <YAxis stroke="#475569" style={{ fontSize: '12px', fontWeight: '500' }} />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="projects" fill="#3b82f6" radius={[10, 10, 0, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per Region - Bar Chart (Amount) */}
          <div 
            ref={(el) => (chartRefs.current['chart6'] = el)}
            data-chart-id="chart6"
            className={`chart-card ${visibleCharts['chart6'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '420px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per Region (Amount)
            </h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={nafesData.regionData} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis dataKey="region" stroke="#475569" style={{ fontSize: '12px', fontWeight: '500' }} />
                <YAxis 
                  stroke="#475569" 
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  tickFormatter={(value) => formatAmountShort(value)}
                />
                <Tooltip 
                  formatter={(value) => formatAmount(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="amount" fill="#10b981" radius={[10, 10, 0, 0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 4: HEI Type (Projects and Amount) */}
        <div className='charts-row' style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Per HEI Type - Pie Chart (Projects) */}
          <div 
            ref={(el) => (chartRefs.current['chart7'] = el)}
            data-chart-id="chart7"
            className={`chart-card ${visibleCharts['chart7'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '620px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per HEI Type (Number of Projects)
            </h4>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={nafesData.heiType}
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="projects"
                  labelLine={false}
                  label={renderCustomLabel}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {nafesData.heiType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total Projects Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              padding: '15px 20px',
              background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)',
              borderRadius: '12px',
              border: '2px solid #0033a0',
              gap: '15px',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600', lineHeight: '1', flexShrink: 0 }}>
                Total Projects
              </div>
              <div style={{ 
                fontSize: '20px', 
                color: '#0033a0', 
                fontWeight: '700', 
                lineHeight: '1',
                textAlign: 'right',
                wordBreak: 'break-all',
                maxWidth: '70%'
              }}>
                {formatNumber(nafesData.heiType.reduce((sum, item) => sum + (item.projects || 0), 0))}
              </div>
            </div>
          </div>

          {/* Per HEI Type - Pie Chart (Amount) */}
          <div 
            ref={(el) => (chartRefs.current['chart8'] = el)}
            data-chart-id="chart8"
            className={`chart-card ${visibleCharts['chart8'] ? 'chart-visible' : ''}`}
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
              border: '1px solid rgba(0, 51, 160, 0.08)',
              height: '620px'
            }}
          >
            <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Per HEI Type (Amount)
            </h4>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={nafesData.heiType}
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="amount"
                  labelLine={false}
                  label={renderCustomLabel}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {nafesData.heiType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatAmount(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              padding: '15px 20px',
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              borderRadius: '12px',
              border: '2px solid #f59e0b',
              gap: '15px',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600', lineHeight: '1', flexShrink: 0 }}>
                Total Amount
              </div>
              <div style={{ 
                fontSize: '18px', 
                color: '#f59e0b', 
                fontWeight: '700', 
                lineHeight: '1', 
                textAlign: 'right',
                wordBreak: 'break-all',
                maxWidth: '70%'
              }}>
                {formatAmount(nafesData.heiType.reduce((sum, item) => sum + (item.amount || 0), 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Chart - Full Width */}
        <div 
          ref={(el) => (chartRefs.current['chart9'] = el)}
          data-chart-id="chart9"
          className={`chart-card ${visibleCharts['chart9'] ? 'chart-visible' : ''}`}
          style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 51, 160, 0.08)',
            border: '1px solid rgba(0, 51, 160, 0.08)',
            height: '620px',
            marginBottom: '48px'
          }}
        >
          <h4 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
            Project Status Distribution
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={nafesData.status}
                cx="50%"
                cy="50%"
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {nafesData.status.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            marginTop: '10px',
            padding: '15px 20px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '12px',
            border: '2px solid #10b981',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '600', lineHeight: '1', flexShrink: 0 }}>
              Total Projects
            </div>
            <div style={{ 
              fontSize: '20px', 
              color: '#10b981', 
              fontWeight: '700', 
              lineHeight: '1',
              textAlign: 'right',
              wordBreak: 'break-all',
              maxWidth: '70%'
            }}>
              {formatNumber(nafesData.status.reduce((sum, item) => sum + (item.value || 0), 0))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .chart-card {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
          transition: all 0.3s ease;
        }
        
        .chart-card.chart-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .chart-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(0, 51, 160, 0.15) !important;
        }
      `}</style>
    </main>
  )
}

export default NAFES
