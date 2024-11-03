//use this for actual selecting and input
import './styles/dropdown.scss';
import React from 'react';

export type DropdownOption = {
  key: string;
  value: string;
}

export function Dropdown({ name = "", options, value, onChange }: { name?: string, options: DropdownOption[], value?: string, onChange: (value: string) => void }) {

  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(value ?? '');

  React.useEffect(() => {
    onChange(current);
  }, [current]);

  React.useEffect(() => {
    if (value === 'Other') return;
    setCurrent(value ?? '');
  }, [value]);

  function onClick(option: DropdownOption) {
    setCurrent(option.value);
    setOpen(false);
  }

  return (
    <div className="dropdown__container" >
      <label>{name}</label>
      <div className="dropdown" >
        <div className="dropdown__selected" onClick={() => setOpen(!open)}>
          <span>{current === '' ? 'Select' : current}</span>
          <div className="dropdown__arrow"></div>
        </div>
        <div className={"dropdown__menu" + ` ${open && 'open' || ''}`}>
          {options.map(option => <div key={option.key} className="dropdown__item" onClick={() => { onClick(option); }}>{option.value}</div>)}
        </div>
      </div>
    </div>
  )
}
