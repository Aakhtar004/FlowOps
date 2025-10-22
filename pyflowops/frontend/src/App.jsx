import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useApi'
import { ToastProvider } from './components/ui/Toast'
import { ApolloProvider } from '@apollo/client'
import { getApolloClient } from './graphql/client'
import Header from './components/common/Header'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import PlanEditor from './pages/PlanEditor'
import ResumenPage from './pages/ResumenPage'
import LoadingSpinner from './components/common/LoadingSpinner'

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [apolloVersion, setApolloVersion] = useState(0)

  useEffect(() => {
    const onReset = () => setApolloVersion(v => v + 1)
    window.addEventListener('apollo:reset', onReset)
    return () => window.removeEventListener('apollo:reset', onReset)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <ApolloProvider key={apolloVersion} client={getApolloClient()}>
      <ToastProvider>
        <AppInner isAuthenticated={isAuthenticated} user={user} />
      </ToastProvider>
    </ApolloProvider>
  )
}

function AppInner({ isAuthenticated, user }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Header user={user} />}
      
      <main className={isAuthenticated ? 'pt-16' : ''}>
          <Routes>
            {/* Rutas públicas */}
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <AuthPage mode="login" />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <AuthPage mode="register" />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/informacion-empresa"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/identidad"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/cadena-valor"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/swot"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/herramientas"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/bcg-matrix"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/estrategias"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/usuarios"
              element={
                isAuthenticated ? (
                  <PlanEditor />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/plan/:planId/resumen"
              element={
                isAuthenticated ? (
                  <ResumenPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Redirección por defecto */}
            <Route
              path="/"
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              }
            />

            {/* Ruta 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <a
                      href={isAuthenticated ? "/dashboard" : "/login"}
                      className="btn-primary"
                    >
                      Volver al inicio
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
  )
}

function App() {
  return <AppContent />
}

export default App
