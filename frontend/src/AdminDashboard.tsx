import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
// import {
//   // DndContext,
//   // closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
// } from '@dnd-kit/core'
import {
  // arrayMove,
  SortableContext,
  // sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableItem from './SortableItem'

interface Entry {
  id: string
  name: string
  priority_score: number
  description?: string
}

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [shippedEntries] = useState<Entry[]>([]) // Remove unused setShippedEntries
  const [isShippedCollapsed, setIsShippedCollapsed] = useState(false) // Collapsible state for shipped items

  // Login function for admin authentication
  const handleLogin = () => {
    if (input === 'shiftwave') {
      setIsAuthorized(true)
    } else {
      alert('Incorrect password')
    }
  }

  // Fetch entries from Supabase
  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('priority_queue')
      .select('id, name, priority_score')

    if (error) {
      console.error('Error fetching entries:', error)
    } else {
      const sorted = data.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
      setEntries(sorted)
    }
  }

  useEffect(() => {
    if (isAuthorized) fetchEntries()
  }, [isAuthorized])

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

  // Handle drag-and-drop and deletion in the trash zone
  // const handleDragEnd = async (event: DragEndEvent) => {
  //   const { active, over } = event

  //   if (!over) return

  //   if (over.id === 'trash-zone') {
  //     const entry = entries.find(e => e.id === active.id)
  //     const confirmed = window.confirm(`Are you sure you want to delete ${entry?.name} from the priority list?`)

  //     if (confirmed && entry) {
  //       const { error } = await supabase.from('priority_queue').delete().eq('id', entry.id)
  //       if (error) {
  //         console.error('Error deleting entry:', error)
  //         alert('Error deleting entry')
  //       } else {
  //         setEntries(entries.filter(e => e.id !== entry.id))
  //       }
  //     }
  //   } else if (active.id !== over.id) {
  //     const oldIndex = entries.findIndex(e => e.id === active.id)
  //     const newIndex = entries.findIndex(e => e.id === over.id)
  //     const newOrder = arrayMove(entries, oldIndex, newIndex)
  //     setEntries(newOrder)
  //   }
  // }
  const handleDelete = async (id: string, name: string) => {
    console.log('Handle delete called')
    console.log('Deleting entry:', id, name)
    const confirmed = window.confirm(`Are you sure you want to delete ${name} from the priority list?`)
    if (confirmed) {
      const { error } = await supabase.from('priority_queue').delete().eq('id', id)
      if (error) {
        console.error('Error deleting entry:', error)
        alert('Error deleting entry')
      } else {
        setEntries(entries.filter(e => e.id !== id))
      }
    }
  }
  

  // Toggle shipped items visibility
  const toggleShippedCollapse = () => {
    setIsShippedCollapsed(!isShippedCollapsed)
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}>Shiftwave Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            fontFamily: 'Times New Roman',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin()
            }
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            padding: '0.5rem',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </div>
    )
  }
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'Times New Roman' }}>
      <h1 style={{ fontWeight: 'bold', textAlign: 'center' }}>Shiftwave Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 'bold' }}>Priority Rank</h2>
          {/* <DndContext sensors={sensors} collisionDetection={closestCenter}> */}
          <SortableContext items={entries.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
              {entries.map((entry) => (
                <SortableItem
                  key={entry.id}
                  id={entry.id}
                  name={entry.name}
                  score={entry.priority_score}
                  description={entry.description}
                  onDelete={handleDelete}
                />
              ))}
          </SortableContext>

          {/* </DndContext> */}
        </div>
  
        {/* Right Column */}
        <div style={{ flex: 1 }}>
          <h2
            style={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={toggleShippedCollapse}
          >
            Shipped {isShippedCollapsed ? '▼' : '▲'}
          </h2>
          {!isShippedCollapsed && (
            <div>
              {shippedEntries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <strong>{entry.name}</strong> — {entry.priority_score}
                  <p style={{ margin: '0.5rem 0', fontStyle: 'italic' }}>{entry.description}</p>
                </div>
              ))}
            </div>
          )}
  
          {/* Trash Zone */}
          <div
            id="trash-zone"
            style={{
              marginTop: '2rem',
              padding: '1rem',
              border: '2px dashed red',
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: '#ffe5e5',
              color: 'red',
              fontWeight: 'bold',
              fontFamily: 'Times New Roman',
            }}
          >
            Drag here to delete
          </div>
        </div>
      </div>
    </div>
  )
}