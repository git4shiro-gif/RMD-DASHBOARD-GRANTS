import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import { About } from './About';
import Insert1 from './pages/Insert1';
import Insert2 from './pages/Insert2';
import Insert3 from './pages/Insert3';
import Insert4 from './pages/Insert4';
import Insert5 from './pages/Insert5';
import Insert6 from './pages/Insert6';
import ChartFocus from './pages/ChartFocus';
import Grants from './pages/SmallCards/Grants';
import Tab2 from './pages/SmallCards/Tab2';
import Tab3 from './pages/SmallCards/Tab3';
import Tab4 from './pages/SmallCards/Tab4';
import CsvUploader from './pages/CsvUploader';
import FullCalendar from './pages/FullCalendar';
import GIA from './pages/grants/GIA';
import IDIG from './pages/grants/IDIG';
import LAKAS from './pages/grants/LAKAS';
import PCARI from './pages/grants/PCARI';
import SALIKHA from './pages/grants/SALIKHA';
import DARETO from './pages/grants/DARETO';
import NAFES from './pages/grants/NAFES';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/insert1" element={<Insert1 />} />
      <Route path="/insert2" element={<Insert2 />} />
      <Route path="/insert3" element={<Insert3 />} />
      <Route path="/insert4" element={<Insert4 />} />
      <Route path="/insert5" element={<Insert5 />} />
      <Route path="/insert6" element={<Insert6 />} />
  <Route path="/grants" element={<Grants />} />
  <Route path="/tab2" element={<Tab2 />} />
  <Route path="/tab3" element={<Tab3 />} />
  <Route path="/tab4" element={<Tab4 />} />
  <Route path="/chart/:id" element={<ChartFocus />} />
  <Route path="/csv-upload" element={<CsvUploader />} />
  <Route path="/grants/gia" element={<GIA />} />
  <Route path="/grants/idig" element={<IDIG />} />
  <Route path="/grants/lakas" element={<LAKAS />} />
  <Route path="/grants/pcari" element={<PCARI />} />
  <Route path="/grants/salikha" element={<SALIKHA />} />
  <Route path="/grants/dareto" element={<DARETO />} />
  <Route path="/grants/nafes" element={<NAFES />} />
      <Route path="/fullcalendar" element={<FullCalendar />} />
    </Routes>
  );
}

export default AppRoutes;