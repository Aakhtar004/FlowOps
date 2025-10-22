import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
// ToastProvider se importará dinámicamente dentro de renderAuth para sincronizar contextos
import { QueryClient, QueryClientProvider } from 'react-query'

// Mocks hoisted para evitar problemas de inicialización en vi.mock
const { mockLogin, mockRegister } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRegister: vi.fn(),
}))

// Datos controlados para el mock de react-hook-form
let formDataLogin = { username: 'test@example.com', password: 'password123' }
let formDataRegister = { username: 'testuser', email: 'test@example.com', full_name: 'Test User', password: 'password123' }

vi.mock('../hooks/useApi', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isLoginLoading: false,
    isRegisterLoading: false,
  }),
}))
// Cubrir variantes de importación potenciales
vi.mock('src/hooks/useApi.js', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isLoginLoading: false,
    isRegisterLoading: false,
  }),
}))
vi.mock('@/hooks/useApi', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isLoginLoading: false,
    isRegisterLoading: false,
  }),
}))

// Import dinámico de AuthPage tras configurar mocks
async function renderAuth(mode = 'login') {
  vi.resetModules()
  // Re-mocks explícitos para asegurar coincidencia de resolución
  vi.doMock('../hooks/useApi', () => ({
    useAuth: () => ({
      login: mockLogin,
      register: mockRegister,
      isLoginLoading: false,
      isRegisterLoading: false,
    }),
  }))
  vi.doMock('src/hooks/useApi.js', () => ({
    useAuth: () => ({
      login: mockLogin,
      register: mockRegister,
      isLoginLoading: false,
      isRegisterLoading: false,
    }),
  }))
  vi.doMock('@/hooks/useApi', () => ({
    useAuth: () => ({
      login: mockLogin,
      register: mockRegister,
      isLoginLoading: false,
      isRegisterLoading: false,
    }),
  }))

  // Mock de react-hook-form para controlar handleSubmit y datos
  vi.doMock('react-hook-form', () => ({
    useForm: () => ({
      register: () => ({}),
      handleSubmit: (onSubmit) => (e) => {
        if (e && e.preventDefault) e.preventDefault()
        const data = mode === 'login' ? formDataLogin : formDataRegister
        return onSubmit(data)
      },
      formState: { errors: {} },
      reset: vi.fn(),
    }),
  }))

  const { default: AuthPage } = await import('../AuthPage')
  const { ToastProvider: ToastProviderRemocked } = await import('../../components/ui/Toast')

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProviderRemocked>
        <MemoryRouter>
          <AuthPage mode={mode} />
        </MemoryRouter>
      </ToastProviderRemocked>
    </QueryClientProvider>
  )
}

describe('AuthPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockReset()
    mockRegister.mockReset()
  })

  it('renderiza el formulario de login por defecto', async () => {
    const { container } = await renderAuth('login')
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/tu nombre de usuario/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/tu contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('cambia al formulario de registro', async () => {
    await renderAuth('register')
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/tu nombre completo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('envía el formulario de login', async () => {
    mockLogin.mockResolvedValue({})

    // Configurar datos esperados para el envío
    formDataLogin = { username: 'test@example.com', password: 'password123' }

    const { container } = await renderAuth('login')
    const form = container.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123'
      })
    })
  })

  it('envía el formulario de registro', async () => {
    mockRegister.mockResolvedValue({})

    // Configurar datos esperados para el envío
    formDataRegister = { username: 'testuser', email: 'test@example.com', full_name: 'Test User', password: 'password123' }

    const { container } = await renderAuth('register')
    const form = container.querySelector('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      password: 'password123'
      })
    })
  })
})