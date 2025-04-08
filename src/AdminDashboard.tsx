import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableItem from './SortableItem'

interface Entry {
  id: string
  name: string
  priority_score: number
  description: string
}

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [shippedEntries, setShippedEntries] = useState<Entry[]>([])
  const [isShippedOpen, setIsShippedOpen] = useState(false)

  // Login function for admin authentication
  const handleLogin = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || input === 'shiftwave') {
      setIsAuthorized(true)
    }
  }

  // Fetch entries from Supabase
  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('priority_queue')
      .select('id, name, priority_score, description')

    if (error) {
      console.error('Error fetching entries:', error)
    } else {
      // Sort the entries by priority score in descending order
      const sorted = data.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
      setEntries(sorted)
    }
  }

  useEffect(() => {
    if (isAuthorized) fetchEntries()
  }, [isAuthorized])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag-and-drop and deletion in the trash zone
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    if (over.id === 'trash-zone') {
      const entry = entries.find(e => e.id === active.id)
      const confirmed = window.confirm(`Would you like to delete ${entry?.name}?`)

      if (confirmed && entry) {
        const { error } = await supabase.from('priority_queue').delete().eq('id', entry.id)
        if (error) {
          console.error('Error deleting entry:', error)
          alert('Error deleting entry')
        } else {
          setEntries(entries.filter(e => e.id !== entry.id))
        }
      }
    } else if (active.id !== over.id) {
      const oldIndex = entries.findIndex(e => e.id === active.id)
      const newIndex = entries.findIndex(e => e.id === over.id)
      const newOrder = arrayMove(entries, oldIndex, newIndex)
      setEntries(newOrder)
    }
  }

  const toggleShipped = () => {
    setIsShippedOpen(!isShippedOpen)
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
          onKeyDown={handleLogin}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', fontFamily: 'Times New Roman' }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Times New Roman' }}>
      <h1 style={{ fontWeight: 'bold' }}>Shiftwave Admin Dashboard</h1>
      <h2 style={{ fontWeight: 'bold' }}>Priority Dashboard</h2>

      {/* Shipped section */}
      <div>
        <button onClick={toggleShipped} style={{ fontWeight: 'bold' }}>
          {isShippedOpen ? 'Collapse Shipped' : 'Expand Shipped'}
        </button>

        {isShippedOpen && (
          <div style={{ marginTop: '1rem' }}>
            {shippedEntries.map((entry) => (
              <div key={entry.id} style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 'bold' }}>{entry.name}</div>
                <div>{entry.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Priority Dashboard */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={entries.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
          {entries.map((entry) => (
            <SortableItem
              key={entry.id}
              id={entry.id}
              name={entry.name}
              score={entry.priority_score}
              description={entry.description} // Passing description to SortableItem
            />
          ))}
        </SortableContext>

        {/* Trash Zone */}
        <div
          id="trash-zone"
          style={{
            marginTop: '3rem',
            padding: '1rem',
            border: '2px dashed red',
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: '#ffe5e5',
            color: 'red',
            fontWeight: 'bold',
          }}
        >
          🗑️ Drag here to delete
        </div>
      </DndContext>
    </div>
  )
}
