import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Stub window.location navigation to avoid JSDOM "not implemented" errors during tests
// This neutralizes assignments like `window.location.href = '/login'` used by Axios interceptors
let __test_href__ = 'http://localhost/'

const __locationMock__ = {
  assign: () => {},
  replace: () => {},
  reload: () => {},
}

Object.defineProperty(__locationMock__, 'href', {
  get: () => __test_href__,
  set: (url) => { __test_href__ = url },
  configurable: true,
})

// Override window.location with our mock to prevent actual navigation in JSDOM
Object.defineProperty(window, 'location', {
  value: __locationMock__,
  configurable: true,
})