import React from 'react';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
    </AuthProvider>
  );
}

export default App;
