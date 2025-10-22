import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../components/ui/Toast'
import * as React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

// Mock hooks used by Dashboard (hoisted to avoid mock timing issues)
const { mockDeletePlan, mockCreatePlan, dashboardEmptyFlag } = vi.hoisted(() => ({
  mockDeletePlan: vi.fn(),
  mockCreatePlan: vi.fn(),
  dashboardEmptyFlag: { value: false },
}))

vi.mock('../hooks/useApi', () => {
  const samplePlans = [
    { id: 1, title: 'Plan Estratégico 1', description: 'Descripción 1', status: 'In development', progress: 45, created_at: new Date().toISOString() },
    { id: 2, title: 'Plan Estratégico 2', description: 'Descripción 2', status: 'Shared', progress: 80, created_at: new Date().toISOString() },
  ]

  const useOwnedPlans = () => {
    const plansData = dashboardEmptyFlag.value ? [] : samplePlans
    return { plans: plansData, isLoading: false, error: null, deletePlan: mockDeletePlan, isDeleting: false }
  }

  const useSharedPlans = () => {
    const plansData = [] // mantener compartidos vacíos para simplicidad
    return { plans: plansData, isLoading: false, error: null }
  }

  const usePlans = () => ({ createPlan: mockCreatePlan, isCreating: false })

  return { useOwnedPlans, useSharedPlans, usePlans }
})
// Cubrir posibles variantes de importación
vi.mock('src/hooks/useApi.js', () => {
  const samplePlans = [
    { id: 1, title: 'Plan Estratégico 1', description: 'Descripción 1', status: 'In development', progress: 45, created_at: new Date().toISOString() },
    { id: 2, title: 'Plan Estratégico 2', description: 'Descripción 2', status: 'Shared', progress: 80, created_at: new Date().toISOString() },
  ]

  const useOwnedPlans = () => {
    const plansData = dashboardEmptyFlag.value ? [] : samplePlans
    return { plans: plansData, isLoading: false, error: null, deletePlan: mockDeletePlan, isDeleting: false }
  }

  const useSharedPlans = () => {
    const plansData = []
    return { plans: plansData, isLoading: false, error: null }
  }

  const usePlans = () => ({ createPlan: mockCreatePlan, isCreating: false })

  return { useOwnedPlans, useSharedPlans, usePlans }
})
vi.mock('@/hooks/useApi', () => {
  const samplePlans = [
    { id: 1, title: 'Plan Estratégico 1', description: 'Descripción 1', status: 'In development', progress: 45, created_at: new Date().toISOString() },
    { id: 2, title: 'Plan Estratégico 2', description: 'Descripción 2', status: 'Shared', progress: 80, created_at: new Date().toISOString() },
  ]

  const useOwnedPlans = () => {
    const plansData = dashboardEmptyFlag.value ? [] : samplePlans
    return { plans: plansData, isLoading: false, error: null, deletePlan: mockDeletePlan, isDeleting: false }
  }

  const useSharedPlans = () => {
    const plansData = []
    return { plans: plansData, isLoading: false, error: null }
  }

  const usePlans = () => ({ createPlan: mockCreatePlan, isCreating: false })

  return { useOwnedPlans, useSharedPlans, usePlans }
})

// Mock Apollo client hooks para evitar necesidad de proveedor
vi.mock('@apollo/client', () => ({
  gql: (x) => x,
  useQuery: () => ({}),
  useMutation: () => [vi.fn(), {}],
}))

import Dashboard from '../Dashboard'

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeletePlan.mockReset()
    mockCreatePlan.mockReset()
  })

  it('renderiza el dashboard con planes', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Mis Planes Estratégicos')).toBeInTheDocument()
      expect(screen.getByText('Plan Estratégico 1')).toBeInTheDocument()
      expect(screen.getByText('Plan Estratégico 2')).toBeInTheDocument()
    })
  })

  it('muestra estado vacío cuando no hay planes', async () => {
    // Forzar estado vacío
    dashboardEmptyFlag.value = true

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay planes estratégicos')).toBeInTheDocument()
      expect(screen.getByText('Crear mi primer plan')).toBeInTheDocument()
    })
  })

  it('abre el modal de creación al pulsar el botón', async () => {
    // Estado vacío para mostrar el CTA
    dashboardEmptyFlag.value = true

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    )

    const createButton = await screen.findByText('Crear mi primer plan')
    createButton.click()

    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Plan Estratégico')).toBeInTheDocument()
    })
  })
})