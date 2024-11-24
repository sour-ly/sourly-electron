import { absorb } from '../util/click';
import './styles/button.scss';

type ButtonProps = {
  onClick: () => void,
  children: React.ReactNode,
  className?: string,
  disabled?: boolean
  type: 'solid' | 'outline'
}

export function Button({ onClick, children, className, disabled, type }: ButtonProps) {

  function onClickWrapper(e: React.MouseEvent<HTMLButtonElement>) {
    absorb(e);
    onClick();
  }

  return (
    <button className={`button ${className ?? ''} ${type}`} onClick={onClickWrapper} disabled={disabled}>
      {children}
    </button>
  )
}
