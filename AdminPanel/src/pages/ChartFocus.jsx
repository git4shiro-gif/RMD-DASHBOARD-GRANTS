import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { BsArrowLeft } from 'react-icons/bs';

function ChartFocus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chartType, data, title } = location.state || {};

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={200}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ color: '#0f172a' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
              <XAxis dataKey="year" stroke="#0f172a" />
              <YAxis stroke="#0f172a" />
              <Tooltip />
              <Legend wrapperStyle={{ color: '#0f172a' }} />
              <Bar dataKey="grants" fill="#0033a0" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
              <XAxis dataKey="month" stroke="#0f172a" />
              <YAxis stroke="#0f172a" />
              <Tooltip />
              <Legend wrapperStyle={{ color: '#0f172a' }} />
              <Line type="monotone" dataKey="budget" stroke="#0033a0" strokeWidth={3} />
              <Line type="monotone" dataKey="spent" stroke="#7799dd" strokeWidth={3} />
              <Line type="monotone" dataKey="allocated" stroke="#0052cc" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: '#ffffff'
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '10px',
          border: '1px solid rgba(0, 51, 160, 0.2)',
          background: 'rgba(0, 51, 160, 0.05)',
          color: '#0033a0',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 51, 160, 0.1)';
          e.currentTarget.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 51, 160, 0.05)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <BsArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '30px',
        height: 'calc(100vh - 140px)',
        border: '1px solid rgba(0, 51, 160, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 51, 160, 0.1)'
      }}>
        <h2 style={{
          color: '#0f172a',
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: '600'
        }}>{title}</h2>
        {renderChart()}
      </div>
    </div>
  );
}

export default ChartFocus;