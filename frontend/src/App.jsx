import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard";
import Settings      from "./pages/Settings";
import DataSources   from "./pages/DataSources";
import HighDividendScanner from "./pages/Scanners/HighDividendScanner";
import InsiderActivityScanner from "./pages/Scanners/InsiderActivityScanner";
import ScannerList from "./pages/Scanners/ScannerList";
import ScannerForm from "./pages/Scanners/ScannerForm";
import ScannerResults from "./pages/Scanners/ScannerResults";
import JournalList from "./pages/Journal/JournalList";
import JournalForm from "./pages/Journal/JournalForm";
import JournalDetail from "./pages/Journal/JournalDetail";
import EarningsCalendar from "./pages/EarningsCalendar";
import AnalystActions from "./pages/AnalystActions";
import EventsFeed from "./pages/EventsFeed";
import AlertsList from "./pages/Alerts/AlertsList";
import AlertForm from "./pages/Alerts/AlertForm";
import OptionsSimulator from "./pages/OptionsSimulator";



function PrivateRoute({ children }) {
  const { accessToken } = useContext(AuthContext);
  return accessToken ? children : <Navigate to="/" replace />;
}

function RootRedirect() {
  const { accessToken } = useContext(AuthContext);
  return accessToken ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes - Root redirects based on auth status */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route
                  path="/settings"
                  element={<PrivateRoute><Settings /></PrivateRoute>}
            />
          <Route
                  path="/data-sources"
                  element={<PrivateRoute><DataSources /></PrivateRoute>}
            />

          {/* Built-in Scanners */}
          <Route path="/scanners/high-dividend" element={
            <PrivateRoute>
              <HighDividendScanner />
            </PrivateRoute>
          } />
          <Route path="/scanners/insider-activity" element={
            <PrivateRoute>
              <InsiderActivityScanner />
            </PrivateRoute>
          } />

          {/* Custom Scanners */}
          <Route path="/scanners" element={
            <PrivateRoute>
              <ScannerList />
            </PrivateRoute>
          } />
          <Route path="/scanners/new" element={
            <PrivateRoute>
              <ScannerForm />
            </PrivateRoute>
          } />
          <Route path="/scanners/:id/results" element={
            <PrivateRoute>
              <ScannerResults />
            </PrivateRoute>
          } />

          {/* Other Pages */}
          <Route path="/earnings" element={
            <PrivateRoute>
              <EarningsCalendar />
            </PrivateRoute>
          } />
          <Route path="/analyst" element={
            <PrivateRoute>
              <AnalystActions />
            </PrivateRoute>
          } />
          <Route path="/events" element={
            <PrivateRoute>
              <EventsFeed />
            </PrivateRoute>
          } />
          <Route path="/alerts" element={
            <PrivateRoute>
              <AlertsList />
            </PrivateRoute>
          } />
          <Route path="/alerts/new" element={
            <PrivateRoute>
              <AlertForm />
            </PrivateRoute>
          } />
          <Route path="/alerts/:id/edit" element={
            <PrivateRoute>
              <AlertForm />
            </PrivateRoute>
          } />

          {/* Journal */}
          <Route path="/journal" element={
            <PrivateRoute>
              <JournalList />
            </PrivateRoute>
          } />
          <Route path="/journal/new" element={
            <PrivateRoute>
              <JournalForm />
            </PrivateRoute>
          } />
          <Route path="/journal/:id" element={
            <PrivateRoute>
              <JournalDetail />
            </PrivateRoute>
          } />

          <Route
            path="/options"
            element={
              <PrivateRoute>
                <OptionsSimulator />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}