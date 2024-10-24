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
  <div className="flex justify-center items-center gap-6 mb-6">
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
          />
        </>
      ) : (
        <h2 className="text-4xl text-center">{title.value}</h2>
      )}
    </div>
    <div>
      <Button variant="ghost" size="icon" onClick={onTitleEdit}>
        {title.isEditing ? <Save /> : <Pencil />}
      </Button>
    </div>
  </div>
)
