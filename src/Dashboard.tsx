import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('priority_queue')
      .select('id, name, priority_score')

    if (error) {
      console.error('Error fetching entries:', error)
    } else {
      // ✅ Sort descending by score
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
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
      </DndContext>
    </div>
  )
}
