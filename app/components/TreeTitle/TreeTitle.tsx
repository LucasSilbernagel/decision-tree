import React from 'react'
import { Pencil, Save } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

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
  <div className="flex justify-center items-center gap-6 mt-4 mb-6">
    <div>
      {title.isEditing ? (
        <>
          <Label htmlFor="decisionTreeTitle" className="sr-only">
            Decision Tree Title
          </Label>
          <Input
            id="decisionTreeTitle"
            value={treeTitleDraft}
            placeholder="Decision Tree Title"
            onChange={(e) => onTitleDraftChange(e.target.value)}
            className="text-4xl text-center"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </>
      ) : (
        <Button
          variant="ghost"
          onClick={onTitleEdit}
          className="flex gap-4 transition-all duration-300 cursor-text group"
        >
          <span className="text-4xl">{title.value}</span>
          <span className="opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60">
            <Pencil />
          </span>
        </Button>
        // <h2 className="text-4xl text-center">{title.value}</h2>
      )}
    </div>
    {title.isEditing && (
      <div>
        <Button variant="ghost" size="icon" onClick={onTitleEdit}>
          <Save />
        </Button>
      </div>
    )}
  </div>
)
