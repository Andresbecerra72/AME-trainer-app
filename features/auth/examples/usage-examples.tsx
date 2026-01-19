/**
 * Ejemplos de uso del nuevo sistema de autenticación
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar
 * el sistema de autenticación mejorado en diferentes escenarios.
 */

import { useAuth, useProfile, useRole, useRequireAuth, useRefreshProfile } from "@/features/auth"

// ========================================
// EJEMPLO 1: Dashboard con información completa
// ========================================
function DashboardExample() {
  const { user, profile, role, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <div>Please login</div>
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <p>Email: {user?.email}</p>
        <p>Name: {profile?.display_name}</p>
        <p>Role: {role}</p>
      </div>
    </div>
  )
}

// ========================================
// EJEMPLO 2: Perfil de usuario (hook especializado)
// ========================================
function ProfileCardExample() {
  const profile = useProfile()
  
  if (!profile) {
    return null
  }
  
  return (
    <div>
      <img src={profile.avatar_url || '/default-avatar.png'} alt="Avatar" />
      <h3>{profile.display_name}</h3>
      <p>{profile.bio}</p>
    </div>
  )
}

// ========================================
// EJEMPLO 3: Verificación de roles
// ========================================
function AdminPanelExample() {
  const role = useRole()
  
  const isAdmin = role === 'admin' || role === 'super_admin'
  
  if (!isAdmin) {
    return <div>Access Denied - Admin only</div>
  }
  
  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Welcome, administrator!</p>
    </div>
  )
}

// ========================================
// EJEMPLO 4: Página protegida con redirección automática
// ========================================
function ProtectedPageExample() {
  // Redirige automáticamente al login si no está autenticado
  const { user, isLoading } = useRequireAuth()
  
  if (isLoading) {
    return <div>Verifying authentication...</div>
  }
  
  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome back, {user?.email}!</p>
    </div>
  )
}

// ========================================
// EJEMPLO 5: Actualizar perfil con refresh de cache
// ========================================
function EditProfileExample() {
  const profile = useProfile()
  const refreshProfile = useRefreshProfile()
  
  async function handleUpdateProfile(newData: any) {
    try {
      // Actualizar en la base de datos
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: JSON.stringify(newData),
      })
      
      if (!response.ok) throw new Error('Update failed')
      
      // Refrescar el cache para obtener los datos actualizados
      await refreshProfile()
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }
  
  return (
    <div>
      <h2>Edit Profile</h2>
      <input 
        defaultValue={profile?.display_name || ''} 
        onBlur={(e) => handleUpdateProfile({ display_name: e.target.value })}
      />
    </div>
  )
}

// ========================================
// EJEMPLO 6: Menú condicional basado en autenticación
// ========================================
function NavigationExample() {
  const { isAuthenticated, isLoading } = useAuth()
  const role = useRole()
  
  if (isLoading) {
    return <nav>Loading...</nav>
  }
  
  return (
    <nav>
      <a href="/">Home</a>
      
      {isAuthenticated ? (
        <>
          <a href="/protected/dashboard">Dashboard</a>
          <a href="/protected/profile">Profile</a>
          
          {(role === 'admin' || role === 'super_admin') && (
            <a href="/admin">Admin Panel</a>
          )}
          
          <button>Logout</button>
        </>
      ) : (
        <a href="/public/auth/login">Login</a>
      )}
    </nav>
  )
}

// ========================================
// EJEMPLO 7: Badge de usuario con info mínima
// ========================================
function UserBadgeExample() {
  const profile = useProfile()
  
  if (!profile) return null
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src={profile.avatar_url || '/default-avatar.png'} 
        alt="Avatar"
        style={{ width: 32, height: 32, borderRadius: '50%' }}
      />
      <span>{profile.display_name}</span>
    </div>
  )
}

// ========================================
// EJEMPLO 8: Loading states manejados correctamente
// ========================================
function SmartLoadingExample() {
  const { user, profile, isLoading, isAuthenticated, error } = useAuth()
  
  // Estado de error
  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }
  
  // Estado de carga
  if (isLoading) {
    return <div className="loading">Loading user data...</div>
  }
  
  // No autenticado
  if (!isAuthenticated) {
    return <div>Please <a href="/public/auth/login">login</a></div>
  }
  
  // Perfil no disponible aún
  if (!profile) {
    return <div>Setting up your profile...</div>
  }
  
  // Todo listo
  return (
    <div>
      <h1>Welcome {profile.display_name}</h1>
      <p>Email: {user?.email}</p>
    </div>
  )
}

export {
  DashboardExample,
  ProfileCardExample,
  AdminPanelExample,
  ProtectedPageExample,
  EditProfileExample,
  NavigationExample,
  UserBadgeExample,
  SmartLoadingExample,
}
