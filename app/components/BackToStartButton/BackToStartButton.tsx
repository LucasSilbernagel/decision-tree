import { ArrowBigUp } from 'lucide-react'
import { Button } from '~/components/ui/button'

type BackToStartButtonProps = {
  onClick: () => void
}

export const BackToStartButton: React.FC<BackToStartButtonProps> = ({
  onClick,
}: BackToStartButtonProps) => (
  <Button
    className="top-44 right-12 fixed shadow-lg animate-bounce duration-3000"
    onClick={onClick}
  >
    <ArrowBigUp /> Back to start
  </Button>
)
