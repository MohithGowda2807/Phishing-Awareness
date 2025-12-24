import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MissionViewer from "./pages/MissionViewer";
import PhishSpotter from "./pages/PhishSpotter";
import WeeklyChallenges from "./pages/WeeklyChallenges";
import CommunityHub from "./pages/CommunityHub";
import CreateChallenge from "./pages/CreateChallenge";
import ChallengePlayer from "./pages/ChallengePlayer";
import ModerationQueue from "./pages/ModerationQueue";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/mission/:id" element={<MissionViewer />} />
                <Route path="/phish-spotter" element={<PhishSpotter />} />
                <Route path="/challenges" element={<WeeklyChallenges />} />
                <Route path="/community" element={<CommunityHub />} />
                <Route path="/create-challenge" element={<CreateChallenge />} />
                <Route path="/challenge/:id" element={<ChallengePlayer />} />
                <Route path="/moderation" element={<ModerationQueue />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
