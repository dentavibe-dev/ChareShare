import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { Body } from './screens/Body';
import { Dashboard } from './screens/Dashboard';
import { Profile } from './screens/Profile';
import { Calendar } from './screens/Calendar';
import { Messages } from './screens/Messages';
import { FindProvider } from './screens/FindProvider';
import { AdminProfile } from './screens/AdminProfile';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            session ? (
              <Navigate to="/dashboard\" replace />
            ) : (
              <Body />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            session ? (
              <Dashboard />
            ) : (
              <Navigate to="/\" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            session ? (
              <Profile />
            ) : (
              <Navigate to="/\" replace />
            )
          } 
        />
        <Route 
          path="/admin-profile" 
          element={
            session?.user?.email === 'admin@gmail.com' ? (
              <AdminProfile />
            ) : (
              <Navigate to="/dashboard\" replace />
            )
          } 
        />
        <Route 
          path="/calendar" 
          element={
            session ? (
              <Calendar />
            ) : (
              <Navigate to="/\" replace />
            )
          } 
        />
        <Route 
          path="/messages" 
          element={
            session ? (
              <Messages />
            ) : (
              <Navigate to="/\" replace />
            )
          } 
        />
        <Route 
          path="/find-provider" 
          element={
            session ? (
              <FindProvider />
            ) : (
              <Navigate to="/\" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;