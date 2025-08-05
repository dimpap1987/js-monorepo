import React, { lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

const Home = lazy(() => import('../pages/home'))
const About = lazy(() => import('../pages/about'))
const NotFound = lazy(() => import('../pages/not-found'))

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default AppRoutes
