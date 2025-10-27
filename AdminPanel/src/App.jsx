import './App.css'
import Header from './Header'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <div className='grid-container'>
      <Header />
      
      {/* Routes Container */}
      <AppRoutes />
    </div>
  )
}

export default App