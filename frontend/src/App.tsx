import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import LandingPage from './routes/landing/LandingPage';
import LoginForm from './routes/landing/LoginForm';
import RegisterForm from './routes/landing/RegisterForm';
import Dashboard from './routes/dashboard/Dashboard';
import React from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
