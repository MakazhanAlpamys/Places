import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import PlaceDetail from '../pages/PlaceDetail';
import AdminPanel from '../pages/AdminPanel';
import Contacts from '../pages/Contacts';
import PlacesList from '../pages/PlacesList';
import AddPlace from '../pages/AddPlace';
import Admin from '../pages/Admin';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/places/:id" element={<PlaceDetail />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/places/add" element={<AddPlace />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/places-list" element={<PlacesList />} />
    </Routes>
  );
}

export default AppRouter; 