import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'

export function DeleteTreeDialog({ handleReset }: { handleReset: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>
          <Trash2 className="mr-1.5 w-4 h-4" /> Start Over
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-center">
            Start Over
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to start over? This will delete your current
            decision tree.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
