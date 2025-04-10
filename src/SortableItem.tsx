import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableItemProps {
  id: string
  name: string
  score: number
  description?: string  // Add description as a prop
}

export default function SortableItem({
  id,
  name,
  score,
  description
}: SortableItemProps) {
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
      <strong style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}>
        {name}
      </strong>
      <p>Score: {score}</p>
      <p><strong>Description:</strong> {description}</p> {/* Display the description */}
    </div>
  )
}
