import React from 'react'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Pencil } from 'lucide-react'
import { Textarea } from '../ui/textarea'

type TreeNodeTitleProps = {
  id: number
  value: string
  isEditing: boolean
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onEditToggle: () => void
}

export const TreeNodeTitle: React.FC<TreeNodeTitleProps> = ({
  id,
  value,
  isEditing,
  onChange,
  onEditToggle,
}) => (
  <div className="w-full">
    <Label htmlFor={`condition-${id}`} className="sr-only">
      Condition {id + 1}
    </Label>
    {isEditing ? (
      <Textarea
        className="px-4 py-3 w-full min-h-[96px] max-h-[96px] text-center text-lg leading-normal overflow-auto resize-none"
        id={`condition-${id}`}
        value={value}
        onChange={onChange}
        placeholder="Yes or no?"
        onBlur={onEditToggle}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onEditToggle()
          }
        }}
      />
    ) : (
      <Button
        variant="ghost"
        className="relative hover:bg-gray-100 p-3 w-full h-[96px] transition-all duration-300 cursor-text overflow-hidden group"
        onClick={onEditToggle}
        aria-label="edit text"
      >
        <span className="m-0 line-clamp-3 pr-8 text-center text-lg text-wrap overflow-hidden">
          {value || 'Yes or no?'}
        </span>
        <Pencil className="top-3 right-3 absolute opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 w-5 h-5" />
      </Button>
    )}
  </div>
)
