import { useState } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Users, Mail, UserMinus, Crown } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// GraphQL operations for collaborators
const PLAN_COLLABORATORS = gql`
  query PlanCollaborators($planId: ID!) {
    planCollaborators(planId: $planId) {
      id
      role
      status
      user { id email name }
    }
  }
`

const INVITE_USER = gql`
  mutation InviteUser($planId: ID!, $email: String!) {
    inviteUser(planId: $planId, email: $email) { message invitationId }
  }
`

const REMOVE_COLLABORATOR = gql`
  mutation RemoveCollaborator($planId: ID!, $userId: ID!) {
    removeCollaborator(planId: $planId, userId: $userId) { message }
  }
`

const UPDATE_COLLABORATOR_ROLE = gql`
  mutation UpdateCollaboratorRole($planId: ID!, $userId: ID!, $role: String!) {
    updateCollaboratorRole(planId: $planId, userId: $userId, role: $role) { message }
  }
`

const UsersManager = ({ planId }) => {
  const { data: collaboratorsData, loading: collaboratorsLoading, refetch } = useQuery(PLAN_COLLABORATORS, {
    variables: { planId },
    skip: !planId,
    fetchPolicy: 'cache-and-network'
  })
  const [inviteUserMutation, { loading: isInviting }] = useMutation(INVITE_USER, {
    refetchQueries: [{ query: PLAN_COLLABORATORS, variables: { planId } }],
  })
  const [removeCollaboratorMutation, { loading: isRemoving }] = useMutation(REMOVE_COLLABORATOR, {
    refetchQueries: [{ query: PLAN_COLLABORATORS, variables: { planId } }],
  })
  const [updateRoleMutation, { loading: isUpdatingRole }] = useMutation(UPDATE_COLLABORATOR_ROLE, {
    refetchQueries: [{ query: PLAN_COLLABORATORS, variables: { planId } }],
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const users = collaboratorsData?.planCollaborators || []

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInviteUser = async (e) => {
    e.preventDefault()
    setEmailError('')

    if (!inviteEmail.trim()) {
      setEmailError('El email es requerido')
      return
    }

    if (!validateEmail(inviteEmail)) {
      setEmailError('Por favor ingresa un email válido')
      return
    }

    // Check if user is already in the plan
    const existingUser = users.find(user => user.user.email === inviteEmail)
    if (existingUser) {
      setEmailError('Este usuario ya tiene acceso al plan')
      return
    }

    try {
      await inviteUserMutation({ variables: { planId, email: inviteEmail.trim() } })
      setInviteEmail('')
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleRemoveUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres remover a este usuario del plan?')) {
      try {
        await removeCollaboratorMutation({ variables: { planId, userId } })
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }

  const handleChangeRole = async (userId, role) => {
    try {
      await updateRoleMutation({ variables: { planId, userId, role } })
    } catch (error) {
      // handled by mutation
    }
  }

  const getUserRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Propietario'
      case 'member':
        return 'Miembro'
      case 'pending':
        return 'Pendiente'
      default:
        return role
    }
  }

  const getUserRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'text-purple-600 bg-purple-100'
      case 'member':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Invitar usuarios */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Invitar Usuarios
          </h3>
          <p className="card-description">
            Invita a otros usuarios registrados para colaborar en este plan estratégico.
          </p>
        </div>
        <div className="card-content">
          <form onSubmit={handleInviteUser} className="flex space-x-3">
            <div className="flex-1">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="usuario@email.com"
                className="input w-full"
                disabled={isInviting}
              />
              {emailError && (
                <p className="form-error mt-1">{emailError}</p>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isInviting || !inviteEmail.trim()}
            >
              {isInviting ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Invitar
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuarios del Plan
          </h3>
          <p className="card-description">
            Usuarios que tienen acceso a este plan estratégico.
          </p>
        </div>
        <div className="card-content">
          {collaboratorsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" text="Cargando usuarios..." />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios en este plan aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((planUser) => (
                <div
                  key={planUser.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {planUser.user.name?.[0] || planUser.user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {planUser.user.name || planUser.user.email}
                        </p>
                        {planUser.role === 'owner' && (
                          <Crown className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{planUser.user.email}</p>
                      <p className="text-xs text-gray-500">Estado: {planUser.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserRoleColor(planUser.role)}`}>
                      {getUserRoleLabel(planUser.role)}
                    </span>
                    {planUser.role !== 'owner' && (
                      <select
                        className="text-sm border rounded px-2 py-1"
                        value={planUser.role}
                        onChange={(e) => handleChangeRole(planUser.user.id, e.target.value)}
                        disabled={isUpdatingRole}
                        title="Permisos"
                      >
                        <option value="viewer">Solo lectura</option>
                        <option value="editor">Edición</option>
                        <option value="member">Miembro</option>
                      </select>
                    )}
                    {planUser.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveUser(planUser.user.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        disabled={isRemoving}
                        title="Remover usuario"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UsersManager