import React, { useMemo } from 'react';
import './styles/progressbar.scss';

type ProgressBarProps = {
  max: number;
  value: number;
}

export default function ProgressBar({ max, value }: ProgressBarProps) {
  const ref = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    changePercentage(value);
  }, [ref, value, max])

  const changePercentage = useMemo(() => {
    return (value: number) => {
      const percentage = (value / max) * 100;
      if (!ref.current) return;
      ref.current.style.setProperty('--private-progress', `${percentage}%`);
    }
  }, [value, max, ref]);

  return (
    <div className="progress-bar">
      <div className="progress-bar__background"></div>
      <div className="progress-bar__fill" ref={ref}></div>
    </div>
  )
}
