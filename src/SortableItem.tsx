import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableItem({
  id,
  name,
  score,
}: {
  id: string
  name: string
  score: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '1rem',
    marginBottom: '10px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    backgroundColor: isDragging ? '#e0f7fa' : '#f9f9f9',
    boxShadow: isDragging ? '0 0 10px rgba(0,0,0,0.2)' : '2px 2px 6px rgba(0,0,0,0.1)',
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{name}</strong> — Score: {score}
    </div>
  )
}
