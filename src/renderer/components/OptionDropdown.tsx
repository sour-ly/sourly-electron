import './styles/optiondropdown.scss';
import React, { useEffect } from "react";
import dots from '../../../assets/ui/dots.svg';

export type Option = {
  key: string;
  value: string
  onClick: () => void;
  // add default props for a div
};


export type Options = Option[];

type OptionDropdownProps = {
  options: Options;
} & React.HTMLProps<HTMLDivElement>

export default function OptionDropdown({ options, ...props }: OptionDropdownProps) {

  const ref = React.createRef<HTMLDivElement>();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const f = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        close();
      }
    }
    document.addEventListener('click', f);
    return () => {
      document.removeEventListener('click', f);
    }
  }, [ref])

  function close() {
    setOpen(false);
  }

  function toggleDropdown() {
    setOpen(!open);
  }

  function clickWrapper(callback: () => void) {
    callback();
    close();
  }

  return (
    <div className="option-dropdown" ref={ref} {...props}>
      <img src={dots} onClick={toggleDropdown} alt="dots" className="progress-bar__dots" />
      {open && (
        <div className={`option-dropdown__menu ${open && 'open' || ''}`}>
          {options.map((option, i) => (
            <button key={i} onClick={() => clickWrapper(option.onClick)} className="option-dropdown__item">{option.value}</button>
          ))}
          {options.length === 0 && <div className="option-dropdown__item">No options available</div>}
        </div>
      )}
    </div>
  )
}
