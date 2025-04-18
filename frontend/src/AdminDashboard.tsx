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
import logo from './assets/shiftwave-logo.png'

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
      const formatDescription = (entry: any) => {
        return [
          `Athlete Type: ${entry.athlete_type ?? 'N/A'}`,
          `Season Status: ${entry.season_status ?? 'N/A'}`,
          `Injury: ${entry.injured ?? 'N/A'}`,
          `Use Case: ${entry.use_case ?? 'N/A'}`,
          `Referral: ${entry.referral_source ?? 'N/A'}`,
          `Repeat Customer: ${entry.repeat_customer ? 'Yes' : 'No'}`,
          `Public Influence: ${entry.public_influence ?? 'N/A'}`,
          `Urgency: ${entry.urgency ?? 'N/A'}`,
          `Purchase Scope: ${entry.purchase_scope ?? 'N/A'}`,
          `Represents Group: ${entry.represents_group ?? 'N/A'}`,
          `System Broken: ${entry.system_broken ?? 'N/A'}`,
          `Customer Type: ${entry.customer_type ?? 'N/A'}`,
          `Notes: ${entry.additional_notes ?? 'N/A'}`
        ].join('\n')
      }
      
      const enhanced = sorted.map((entry) => ({
        ...entry,
        description: formatDescription(entry)
      }))
      
      setEntries(enhanced.filter(e => !e.shipped))
      setShippedEntries(enhanced.filter(e => e.shipped))
      
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
      <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <img src={logo} alt="Shiftwave Logo" style={{ height: '40px', marginBottom: '1rem' }} />
        <h2 style={{ fontWeight: '600', color: '#0D1B2A' }}>Shiftwave Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin()
          }}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button onClick={handleLogin} style={{ padding: '0.5rem', backgroundColor: '#20B486', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Login
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <img src={logo} alt="Shiftwave Logo" style={{ height: '40px' }} />
        <h1 style={{ fontWeight: '700', fontSize: '1.75rem', color: '#0D1B2A' }}>Shiftwave Admin Dashboard</h1>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', width: '100%', padding: '0 2rem' }}>
            {/* Priority Column */}
            <div style={{ flex: 1, minWidth: '320px' }}>
              <h2 style={{ fontWeight: '600', color: '#0D1B2A' }}>Priority Rank</h2>
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
                style={{ flex: 1, minWidth: '320px', minHeight: '300px', padding: '1rem' }}
              >
                <h2 style={{ fontWeight: '600', color: '#0D1B2A', cursor: 'pointer' }} onClick={toggleShippedCollapse}>
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
        </div>
      </DndContext>
    </div>
  )
}
