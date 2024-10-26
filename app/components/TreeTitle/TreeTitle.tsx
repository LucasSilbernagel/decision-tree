import React from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import DOMPurify from 'dompurify'

type TreeTitleProps = {
  title: { value: string; isEditing: boolean }
  treeTitleDraft: string
  onTitleDraftChange: (value: string) => void
  onTitleEdit: () => void
}

export const TreeTitle: React.FC<TreeTitleProps> = ({
  title,
  treeTitleDraft,
  onTitleDraftChange,
  onTitleEdit,
}) => (
  <div className="mt-4 mb-6">
    <div>
      {title.isEditing ? (
        <>
          <Label htmlFor="decisionTreeTitle" className="sr-only">
            Decision Tree Title
          </Label>
          <Input
            id="decisionTreeTitle"
            value={DOMPurify.sanitize(treeTitleDraft)}
            placeholder="Decision Tree Title"
            onChange={(e) => onTitleDraftChange(e.target.value)}
            className="mx-auto max-w-max text-3xl text-center"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onBlur={onTitleEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onTitleEdit()
              }
            }}
          />
        </>
      ) : (
        <Button
          variant="ghost"
          onClick={onTitleEdit}
          className="relative text-center transition-all duration-300 cursor-text group"
        >
          <span className="text-3xl">{title.value}</span>
          <span className="-right-6 absolute opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60">
            <Pencil />
          </span>
        </Button>
      )}
    </div>
  </div>
)
