import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SymptomChecker from './pages/SymptomChecker'
import RiskAssessment from './pages/RiskAssessment'
import OutbreakPredictor from './pages/OutbreakPredictor'
import History from './pages/History'
import SignIn from './pages/SignIn'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/symptoms" element={<SymptomChecker />} />
        <Route path="/risk/:kind" element={<RiskAssessment />} />
        <Route path="/risk" element={<Navigate to="/risk/diabetes" replace />} />
        <Route path="/outbreak" element={<OutbreakPredictor />} />
        <Route path="/history" element={<History />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
