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
}

export default function Dashboard() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [trashId, setTrashId] = useState('trash-zone')

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
    fetchEntries()
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    if (over.id === trashId) {
      const entry = entries.find(e => e.id === active.id)
      const confirmed = window.confirm(`Are you sure you want to delete ${entry?.name} from the priority list?`)

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

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📋 Priority Dashboard</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={entries.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
          {entries.map((entry) => (
            <SortableItem
              key={entry.id}
              id={entry.id}
              name={entry.name}
              score={entry.priority_score}
            />
          ))}
        </SortableContext>

        {/* Trash Zone */}
        <div
          id={trashId}
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
