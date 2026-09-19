import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-lg mx-auto min-h-screen pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}