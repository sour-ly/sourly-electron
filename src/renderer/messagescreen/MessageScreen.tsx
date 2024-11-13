import { ReactNode, useState } from 'react';
import { environment } from '..';
import './styles/messagescreen.scss';
import Exit from '../../../assets/ui/exit.svg';
import Next from '../../../assets/ui/next.svg';


export type MSCompatiableScreen = {
  header: { text: string, color: 'red' | 'blue' | 'purple' | '' }[];
  body: ReactNode;
}

export type MSContext = {
  flags: number;
  pages: MSCompatiableScreen[];
  onClose: () => void;
}

//this component is the main entry point for the messagescreen component, in this component various flags would be sent to a switch statement that would display the user with information.
//Such an example of this is a new version of the application, or a new feature that has been added to the application.
export function MessageScreen({ flags, pages, onClose }: MSContext) {

  const [current_page, setCurrentPage] = useState<number>(0);

  if (!pages || pages.length === 0) {
    return (<></>);
  }

  function nextPage() {
    if (current_page + 1 < pages.length) {
      setCurrentPage(current_page + 1);
    }
  }

  function prevPage() {
    if (current_page - 1 >= 0) {
      setCurrentPage(current_page - 1);
    }
  }


  return (
    <div className="messagescreen">
      <div className="messagescreen__content">
        <div className="messagescreen__close" onClick={onClose}>
          <img src={Exit} alt="Close" draggable={false} />
        </div>
        <div className="messagescreen__navigation messagescreen__navigation__left">
          {current_page > 0 &&
            <img src={Next} onClick={prevPage} />
          }
        </div>
        <div className="messagescreen__navigation messagescreen__navigation__right">
          {current_page < pages.length - 1 &&
            <img src={Next} onClick={nextPage} />
          }
        </div>
        <div className="messagescreen__content__main lexend">
          <div className="messagescreen__content__main__header">
            <p>
              {pages[current_page].header.map((header, index) => {
                return (
                  <span key={index} className={`${header.color}`}>{header.text}</span>
                )
              })}
            </p>
          </div>
          <div className="messagescreen__content__main__body">
            {pages[current_page].body}
          </div>
        </div>
      </div>
    </div>
  )
}
