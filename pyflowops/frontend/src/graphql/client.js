import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'

// Derive URLs that work when sharing via host IP
const originProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
const originHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const defaultHttpUrl = `${originProtocol}//${originHostname}:8000/graphql`

const envHttpUrl = import.meta.env.VITE_GRAPHQL_HTTP_URL

// If env points to localhost but we are not on localhost, prefer host-aware defaults
const useHostAware = originHostname !== 'localhost' && originHostname !== '127.0.0.1'
const httpUrl = (envHttpUrl && !(useHostAware && envHttpUrl.includes('localhost'))) ? envHttpUrl : defaultHttpUrl

const authToken = () => localStorage.getItem('token') || localStorage.getItem('access_token')

const httpLink = new HttpLink({ uri: httpUrl })

const authLink = setContext((_, { headers }) => {
  const token = authToken()
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

// Error handling: only force logout on hard 401 network errors
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  const hasResolverAuthError = (graphQLErrors || []).some(err => {
    const msg = (err?.message || '').toLowerCase()
    return msg.includes('authentication required') || msg.includes('not authorized') || msg.includes('jwt')
  })
  if (hasResolverAuthError) {
    // Suavizar el registro para evitar alarmas innecesarias tras el login
    console.warn('Auth warning: GraphQL resolver requires authentication.', {
      operationName: operation?.operationName,
      graphQLErrors,
    })
    // No limpiar token en errores de resolvers; pueden ser transitorios
    return
  }
  if (networkError && (networkError.statusCode === 401 || networkError.status === 401)) {
    console.error('NETWORK 401: Clearing token and redirecting to login', { networkError })
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:logout'))
    } catch {}
    if (typeof window !== 'undefined' && !/\/login$/.test(window.location.pathname)) {
      window.location.href = '/login'
    }
  }
})

// Build a fresh Apollo client (used to reinitialize on token changes)
function buildClient() {
  return new ApolloClient({
    link: errorLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Simple merge strategy for any cached lists
            notifications: {
              merge(existing = [], incoming = []) {
                return incoming
              }
            }
          }
        }
      }
    })
  })
}

let apolloClientInstance = buildClient()

export function getApolloClient() {
  return apolloClientInstance
}

// Rebuild client when token changes or on explicit logout
function resetApolloClient() {
  apolloClientInstance = buildClient()
  try {
    window.dispatchEvent(new Event('apollo:reset'))
  } catch {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    resetApolloClient()
  })
  window.addEventListener('storage', (e) => {
    if (e.key === 'token') {
      resetApolloClient()
    }
  })
}