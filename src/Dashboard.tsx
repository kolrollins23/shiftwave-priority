import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableItem from './SortableItem'

export default function Dashboard() {
  const [queue, setQueue] = useState<any[]>([])

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('priority_queue')
      .select('*')
      .order('override_score', { ascending: false })
    
    if (data) setQueue(data)
    if (error) console.error('Error fetching data:', error)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = queue.findIndex(i => i.id === active.id)
    const newIndex = queue.findIndex(i => i.id === over.id)
    const reordered = arrayMove(queue, oldIndex, newIndex)
    setQueue(reordered)

    // Update override score
    await supabase
      .from('priority_queue')
      .update({
        manual_override: true,
        override_score: reordered.length - newIndex,
        updated_at: new Date(),
      })
      .eq('id', active.id)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>📋 Priority Dashboard</h2>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={queue.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {queue.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              name={item.name}
              score={item.override_score ?? item.priority_score}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
