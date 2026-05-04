import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
