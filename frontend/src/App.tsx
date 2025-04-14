import PublicForm from './PublicForm'
import AdminDashboard from './AdminDashboard'
import PrivateForm from './PrivateForm'

function App() {
  const path = window.location.pathname

  // If URL includes /admin, show the Shiftwave dashboard
  if (path.includes('admin')) {
    return <AdminDashboard />
  }
  if (path.includes('privateform')) {
    return <PrivateForm />
  }

  // Default view for customers: just the form
  return <PublicForm />
}

export default App
