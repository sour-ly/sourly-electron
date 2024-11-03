import { useEffect, useState } from 'react';
import './styles/input.scss';

type InputProps = {
  placeholder: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export default function Input({ placeholder, onChange, value }: InputProps) {
  const [val, setVal] = useState(value ?? '');

  useEffect(() => {
    setVal(value ?? '');
  }, [value])

  useEffect(() => {
    if (val === value || val === undefined) return;
    onChange && onChange({ currentTarget: { value: val } } as any);
  }, [val])

  function _onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVal(e.currentTarget.value);
  }

  return (
    <div className="input--label">
      <label>{placeholder}</label>
      <input type="text" placeholder={placeholder} onChange={_onChange} value={val} />
    </div>
  )
}
