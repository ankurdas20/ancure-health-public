import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase/client' // Adjust this path to where your client is

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check for an existing session on mount
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkUser()

    // 2. Listen for the OAuth redirect login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      {user ? (
        <div>
          <h2>🏥 Ancure Health Dashboard</h2>
          <p>Welcome back, <strong>{user.user_metadata?.full_name || user.email}</strong></p>
          <div style={{ margin: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
             <p>Email: {user.email}</p>
             <p>User ID: {user.id}</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ padding: '10px 20px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <h1>Ancure Health</h1>
          <p>Please sign in to access your medical records.</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  )
}

export default App
