import { Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import TimeTableGeneratorPage from './pages/timetable_generator'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/time-table" element={<TimeTableGeneratorPage />} />
      </Routes>
    </>
  )
}

export default App
