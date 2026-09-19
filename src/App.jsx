import React from 'react';

// 1. If you have a primary page or component (e.g. in src/pages/ or src/components/)
// Check your src folder and adjust this import to your main file:
import MainCalculator from './pages/Home'; 
// If your file is named differently, use:
// import MainCalculator from './pages/index';
// or: import MainCalculator from './components/Calculator';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
      <MainCalculator />
    </div>
  );
}
