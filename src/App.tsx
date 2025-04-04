// App.tsx

import PublicForm from './PublicForm'
import AdminDashboard from './AdminDashboard'

function App() {
  const path = window.location.pathname

  // If URL includes /admin, show the Shiftwave dashboard
  if (path.includes('admin')) {
    return <AdminDashboard />
  }

  // Default view for customers: just the form
  return <PublicForm />
}

export default App
