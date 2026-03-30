export interface AuthGuardTarget {
  path: string
  fullPath: string
  meta?: Record<string, unknown>
}

export interface AuthGuardDecision {
  path: string
  query?: Record<string, string>
}

interface ResolveAuthGuardOptions {
  to: AuthGuardTarget
  isAuthenticated: boolean
  authRoute?: string
  authenticatedRoute?: string
}

export function resolveAuthRouteAccess(options: ResolveAuthGuardOptions): true | AuthGuardDecision {
  const authRoute = options.authRoute || '/auth'
  const authenticatedRoute = options.authenticatedRoute || '/'
  const requiresAuth = Boolean(options.to.meta?.requiresAuth)
  const guestOnly = Boolean(options.to.meta?.guestOnly)

  if (requiresAuth && !options.isAuthenticated) {
    return {
      path: authRoute,
      query: {
        redirect: options.to.fullPath,
      },
    }
  }

  if (guestOnly && options.isAuthenticated) {
    return {
      path: authenticatedRoute,
    }
  }

  return true
}
