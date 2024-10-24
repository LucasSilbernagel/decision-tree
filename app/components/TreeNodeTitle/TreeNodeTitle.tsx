import React from 'react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'

type TreeNodeTitleProps = {
  id: number
  value: string
  isEditing: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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
      Condition {id}
    </Label>
    {isEditing ? (
      <Input
        className="w-full text-center text-xl"
        id={`condition-${id}`}
        value={value}
        onChange={onChange}
        placeholder="Yes or no?"
        onBlur={onEditToggle}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={true}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onEditToggle()
          }
        }}
      />
    ) : (
      <Button
        variant="ghost"
        className="hover:bg-gray-100 py-2 w-full text-center text-xl cursor-text"
        onClick={onEditToggle}
        aria-label="edit text"
      >
        {value || 'Yes or no?'}
      </Button>
    )}
  </div>
)
