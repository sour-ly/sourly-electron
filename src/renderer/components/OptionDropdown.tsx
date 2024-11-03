import './styles/optiondropdown.scss';
import React, { useEffect } from "react";
import dots from '../../../assets/ui/dots.svg';


export type OptionPreferred = {
  key: string;
  element: JSX.Element;
}

export type OptionAlt = {
  key: string;
  value: string;
  onClick: () => void;
}

export type Option = OptionAlt | OptionPreferred;


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
      } else {
        //ignore the click
        e.stopPropagation();
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
    <div ref={ref} {...props} className={"option-dropdown " + props.className} onClick={e => e.stopPropagation()}>
      <img src={dots} onClick={toggleDropdown} alt="dots" className="progress-bar__dots" />
      {open && (
        <div className={`option-dropdown__menu ${open && 'open' || ''}`}>

          {options && options.map((option, i) => (
            (option as OptionAlt).value &&
            (<button key={i} onClick={() => clickWrapper((option as OptionAlt).onClick)} className="option-dropdown__item">{(option as OptionAlt).value}</button>) ||
            React.cloneElement((option as OptionPreferred).element, { key: i, className: "option-dropdown__item", onClick: () => clickWrapper(() => { }) })
          ))}
          {options.length === 0 && <div className="option-dropdown__item">No options available</div>}
        </div>
      )}
    </div>
  )
}
