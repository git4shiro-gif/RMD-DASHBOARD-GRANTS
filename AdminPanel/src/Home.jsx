
import React from 'react';


// If recharts is not installed, you can run: npm install recharts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const summaryData = [
  { label: "Revenue", value: "$120,000", change: "+8%", color: "#4caf50" },
  { label: "Expenses", value: "$45,000", change: "-2%", color: "#f44336" },
  { label: "Net Profit", value: "$75,000", change: "+12%", color: "#2196f3" },
  { label: "Growth", value: "18%", change: "+3%", color: "#ff9800" },
];

const chartData = [
  { month: "Jan", revenue: 10000, expenses: 4000 },
  { month: "Feb", revenue: 12000, expenses: 4200 },
  { month: "Mar", revenue: 15000, expenses: 5000 },
  { month: "Apr", revenue: 17000, expenses: 4800 },
  { month: "May", revenue: 20000, expenses: 6000 },
  { month: "Jun", revenue: 22000, expenses: 7000 },
  { month: "Jul", revenue: 25000, expenses: 8000 },
];

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

      {/* Financial Trends Section */}
      <section className="financial-trends-section">
        <h2>Financial Trends</h2>
        <div className="summary-cards-row">
          {summaryData.map((item) => (
            <div className="summary-card" key={item.label} style={{ borderTop: `4px solid ${item.color}` }}>
              <div className="summary-label">{item.label}</div>
              <div className="summary-value">{item.value}</div>
              <div className="summary-change" style={{ color: item.color }}>{item.change}</div>
            </div>
          ))}
        </div>
        <div className="financial-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#4caf50" strokeWidth={3} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={3} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}

export default Home;
