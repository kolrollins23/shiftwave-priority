import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableItem from './SortableItem'

interface Entry {
  id: string
  name: string
  priority_score: number
  description?: string
  shipped?: boolean
}

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [isShippedCollapsed, setIsShippedCollapsed] = useState(false)
  const [shippedEntries, setShippedEntries] = useState<Entry[]>([])

  const { setNodeRef: setShippedZoneRef } = useDroppable({
    id: 'shipped-drop-area',
  })

  const handleLogin = () => {
    if (input === 'shiftwave') {
      setIsAuthorized(true)
    } else {
      alert('Incorrect password')
    }
  }

  const fetchEntries = async () => {
    const { data, error } = await supabase.from('priority_queue').select('*')
    if (error) {
      console.error('Error fetching entries:', error)
    } else if (data) {
      const sorted = data.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
      setEntries(sorted.filter(e => !e.shipped))
      setShippedEntries(sorted.filter(e => e.shipped))
    }
  }

  useEffect(() => {
    if (isAuthorized) fetchEntries()
  }, [isAuthorized])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const isOverShippedColumn = shippedEntries.some(entry => entry.id === over?.id)

    if (isOverShippedColumn || over?.id === 'shipped-drop-area') {
      const entry = entries.find(e => e.id === active.id)
      if (entry) {
        const confirmed = window.confirm(`Mark ${entry.name} as shipped?`)
        if (confirmed) {
          const { error } = await supabase.from('priority_queue').update({ shipped: true }).eq('id', entry.id)
          if (!error) {
            setEntries(prev => prev.filter(e => e.id !== entry.id))
            setShippedEntries(prev => [...prev, { ...entry, shipped: true }])
          } else {
            alert('Failed to mark as shipped')
          }
        }
      }
    } else if (active.id !== over.id) {
      const oldIndex = entries.findIndex(e => e.id === active.id)
      const newIndex = entries.findIndex(e => e.id === over.id)
      const newOrder = arrayMove(entries, oldIndex, newIndex)
      setEntries(newOrder)
    }
  }

  const handleDelete = async (id: string, name: string) => {
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin()
          }}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button onClick={handleLogin} style={{ padding: '0.5rem', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>
          Login
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Times New Roman' }}>
      <h1 style={{ fontWeight: 'bold', textAlign: 'center' }}>Shiftwave Admin Dashboard</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Priority Column */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 'bold' }}>Priority Rank</h2>
            <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
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
          </div>

          {/* Shipped Column */}
          <SortableContext items={shippedEntries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div
              ref={setShippedZoneRef}
              id="shipped-drop-area"
              style={{
                flex: 1,
                minHeight: '300px',
                padding: '1rem',
              }}
            >
              <h2 style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={toggleShippedCollapse}>
                Shipped {isShippedCollapsed ? '▼' : '▲'}
              </h2>
              {!isShippedCollapsed && shippedEntries.map((entry) => (
                <SortableItem
                  key={entry.id}
                  id={entry.id}
                  name={entry.name}
                  score={entry.priority_score}
                  description={entry.description}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>
    </div>
  )
}
