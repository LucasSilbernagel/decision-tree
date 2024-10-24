import { Button } from '~/components/ui/button'

type BackToStartButtonProps = {
  onClick: () => void
}

export const BackToStartButton: React.FC<BackToStartButtonProps> = ({
  onClick,
}: BackToStartButtonProps) => (
  <Button className="top-44 right-12 fixed shadow-lg" onClick={onClick}>
    Back to start
  </Button>
)
