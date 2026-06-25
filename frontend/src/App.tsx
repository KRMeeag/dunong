import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './screens/Landing'
import Onboarding from './screens/Onboarding'
import Dashboard from './screens/Dashboard'
import ScanModule from './screens/ScanModule'
import SipatAral from './screens/SipatAral'
import RecitationMode from './screens/RecitationMode'
import FeedbackResults from './screens/FeedbackResults'
import Progress from './screens/Progress'
import Profile from './screens/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan" element={<ScanModule />} />
        <Route path="/sipat" element={<SipatAral />} />
        <Route path="/recitation" element={<RecitationMode />} />
        <Route path="/feedback" element={<FeedbackResults />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}
