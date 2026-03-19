import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage } from '../../pages/auth/AuthPage'
import { GoodsPage } from '../../pages/goods/GoodsPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/goods"
        element={
          <ProtectedRoute>
            <GoodsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}