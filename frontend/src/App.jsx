import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Inbox from "./pages/Inbox";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MissionViewer from "./pages/MissionViewer";

import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/inbox" />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/mission/:id" element={<MissionViewer />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
