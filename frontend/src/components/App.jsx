import React from 'react';
import HomeTownHelper from './HomeTownHelper';
import { AuthProvider } from '../context/AuthContext';
import '../styles/App.css';

function App() {
  return (
    <AuthProvider>
      <HomeTownHelper />
    </AuthProvider>
  );
}

export default App;
