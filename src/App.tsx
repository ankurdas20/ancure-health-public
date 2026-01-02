import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './integrations/supabase/client'
import Index from './pages/Index' // This is your actual landing page
import Dashboard from './components/Dashboard' // Your health dashboard

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div>Loading...</div>

  // If logged in, show the Dashboard. If not, show the Index/Landing page.
  return (
    <>
      {user ? <Dashboard /> : <Index />}
    </>
  )
}

export default App
