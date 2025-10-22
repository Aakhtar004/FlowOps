import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastProvider } from '../../components/ui/Toast'
import * as React from 'react'

// Mock hooks usados por PlanEditor, inicializados con hoisting seguro
const { mockUpdateIdentity, mockUpdateAnalysis } = vi.hoisted(() => ({
  mockUpdateIdentity: vi.fn(),
  mockUpdateAnalysis: vi.fn(),
}))

// Simular correctamente ciclo de vida de carga: inicia en isLoading: true y resuelve a datos
vi.mock('../hooks/useApi', () => {

  const useAuth = () => ({ user: { id: 'u1' }, isAuthenticated: true })

  const usePlan = (planId) => {
    // Synchronous error case to avoid timing flakiness in tests
    if (planId === 'error') {
      return { data: null, isLoading: false, error: new Error('Failed to load') }
    }
    // Synchronous loading case for spinner test
    if (planId === 'loading') {
      return { data: null, isLoading: true, error: null }
    }
    const [state, setState] = React.useState({ data: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({ data: { id: Number(planId), title: 'Test Plan' }, isLoading: false, error: null })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return state
  }

  const useCompanyIdentity = (planId) => {
    const [state, setState] = React.useState({ identity: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({ identity: { mission: 'Test Mission', vision: 'Test Vision', values: ['Valor 1'] }, isLoading: false, error: null })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return { ...state, updateIdentity: mockUpdateIdentity }
  }

  const useStrategicAnalysis = (planId) => {
    const [state, setState] = React.useState({ analysis: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({
          analysis: {
            internal_strengths: ['Strength 1'],
            internal_weaknesses: ['Weakness 1'],
            external_opportunities: [],
            external_threats: []
          },
          isLoading: false,
          error: null
        })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return { ...state, updateAnalysis: mockUpdateAnalysis }
  }

  const useAnalysisTools = () => ({ tools: {}, isLoading: false })
  const useStrategies = () => ({ strategies: [], isLoading: false })

  return { useAuth, usePlan, useCompanyIdentity, useStrategicAnalysis, useAnalysisTools, useStrategies }
})

// Cubrir resoluciones alternativas del import del módulo
vi.mock('src/hooks/useApi.js', () => {

  const useAuth = () => ({ user: { id: 'u1' }, isAuthenticated: true })

  const usePlan = (planId) => {
    if (planId === 'error') return { data: null, isLoading: false, error: new Error('Failed to load') }
    if (planId === 'loading') return { data: null, isLoading: true, error: null }
    const [state, setState] = React.useState({ data: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({ data: { id: Number(planId), title: 'Test Plan' }, isLoading: false, error: null })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return state
  }

  const useCompanyIdentity = (planId) => {
    const [state, setState] = React.useState({ identity: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({ identity: { mission: 'Test Mission', vision: 'Test Vision', values: ['Valor 1'] }, isLoading: false, error: null })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return { ...state, updateIdentity: mockUpdateIdentity }
  }

  const useStrategicAnalysis = (planId) => {
    const [state, setState] = React.useState({ analysis: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({
          analysis: {
            internal_strengths: ['Strength 1'],
            internal_weaknesses: ['Weakness 1'],
            external_opportunities: [],
            external_threats: []
          },
          isLoading: false,
          error: null
        })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return { ...state, updateAnalysis: mockUpdateAnalysis }
  }

  const useAnalysisTools = () => ({ tools: {}, isLoading: false })
  const useStrategies = () => ({ strategies: [], isLoading: false })

  return { useAuth, usePlan, useCompanyIdentity, useStrategicAnalysis, useAnalysisTools, useStrategies }
})

vi.mock('@/hooks/useApi', () => {

  const useAuth = () => ({ user: { id: 'u1' }, isAuthenticated: true })

  const usePlan = (planId) => {
    if (planId === 'error') return { data: null, isLoading: false, error: new Error('Failed to load') }
    if (planId === 'loading') return { data: null, isLoading: true, error: null }
    const [state, setState] = React.useState({ data: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({ data: { id: Number(planId), title: 'Test Plan' }, isLoading: false, error: null })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return state
  }

  const useCompanyIdentity = (planId) => {
    const [state, setState] = React.useState({ identity: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({ identity: { mission: 'Test Mission', vision: 'Test Vision', values: ['Valor 1'] }, isLoading: false, error: null })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return { ...state, updateIdentity: mockUpdateIdentity }
  }

  const useStrategicAnalysis = (planId) => {
    const [state, setState] = React.useState({ analysis: null, isLoading: true, error: null })
    React.useEffect(() => {
      const t = setTimeout(() => {
        setState({
          analysis: {
            internal_strengths: ['Strength 1'],
            internal_weaknesses: ['Weakness 1'],
            external_opportunities: [],
            external_threats: []
          },
          isLoading: false,
          error: null
        })
      }, 0)
      return () => clearTimeout(t)
    }, [planId])
    return { ...state, updateAnalysis: mockUpdateAnalysis }
  }

  const useAnalysisTools = () => ({ tools: {}, isLoading: false })
  const useStrategies = () => ({ strategies: [], isLoading: false })

  return { useAuth, usePlan, useCompanyIdentity, useStrategicAnalysis, useAnalysisTools, useStrategies }
})
// Nota: sólo se necesita el mock relativo para PlanEditor; se eliminan alias redundantes


// Mock Apollo client hooks to avoid network usage
vi.mock('@apollo/client', () => ({
  gql: (x) => x,
  useQuery: () => ({}),
  useMutation: () => [vi.fn(), {}],
}))


import PlanEditor from '../PlanEditor'

const renderWithRouter = (initialPath = '/plan/1/identidad') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } }
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/plan/:planId/:section" element={<PlanEditor />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

describe('PlanEditor', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateIdentity.mockReset()
    mockUpdateAnalysis.mockReset()
  })

  it('carga y muestra datos del plan e identidad', async () => {
    renderWithRouter('/plan/1/identidad')

    await waitFor(() => {
      expect(screen.getByText('Test Plan')).toBeInTheDocument()
    })

    // La pestaña Identidad debe estar visible
    expect(await screen.findByRole('heading', { name: 'Identidad Empresarial' })).toBeInTheDocument()
    // Campo misión pre-cargado
    expect(await screen.findByLabelText(/misión/i)).toBeInTheDocument()
  })

  it('muestra la sección SWOT al navegar a su ruta', async () => {
    renderWithRouter('/plan/1/swot')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Análisis SWOT' })).toBeInTheDocument()
      expect(screen.getByText('Fortalezas (Internas - Positivas)')).toBeInTheDocument()
    })
  })

  it('guarda la identidad empresarial', async () => {
    renderWithRouter('/plan/1/identidad')

    const missionTextarea = await screen.findByLabelText(/misión/i)
    await user.type(missionTextarea, '{selectall}{backspace}New Mission Statement')

    const saveButton = screen.getByRole('button', { name: /guardar identidad empresarial/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateIdentity).toHaveBeenCalled()
      const args = mockUpdateIdentity.mock.calls[0][0]
      expect(args.mission).toContain('New Mission Statement')
    })
  })

  it('muestra estado de carga', async () => {
    renderWithRouter('/plan/loading/identidad')
    expect(screen.getByText('Cargando plan estratégico...')).toBeInTheDocument()
  })

  it('muestra estado de error', async () => {
    renderWithRouter('/plan/error/identidad')
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })
})