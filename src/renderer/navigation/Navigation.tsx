import { useLocation, useNavigate } from 'react-router-dom';
import './styles/navigation.scss';
import React, { ReactNode, useEffect, useState } from 'react';
import { Authentication } from '../../api/auth';

function Link(props: { href: string, children: ReactNode }) {

  const router = useNavigate();

  function navigate(path: string) {
    router(path);
  }

  return (
    <div onClick={() => navigate(props.href)}>
      {props.children}
    </div>
  );
}

function Navigator() {

  const location = useLocation();
  const [current, setCurrent] = useState<string>('');
  const ref = React.createRef<HTMLDivElement>();
  const hover = React.createRef<HTMLDivElement>();

  function handleHover(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (hover.current) {
      hover.current.style.setProperty('--opacity', '1');
      hover.current.style.setProperty('--spot', `${parseInt((e.target as HTMLElement).getAttribute('datatype-order') || '0')}`);
    }
  }

  function handleExit(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (hover.current) {
      hover.current.style.setProperty('--opacity', '0');
      hover.current.style.setProperty('--spot', `${parseInt((e.target as HTMLElement).getAttribute('datatype-order') || '0')}`);
    }
  }

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    //code to update the current spot based on location
    if (ref.current) {
      let spot = 0;
      switch (current) {
        case '/login':
        case '/':
          spot = 0;
          break;
        case '/signup':
          spot = 1;
          break;
        case '/profile':
          spot = 3;
          break;
        case '/settings':
          spot = 4;
          break;
        default:
          spot = 0;
          break;
      }
      ref.current.style.setProperty('--spot', `${spot}`);
    }
  }, [current]);


  if (Authentication.getLoggedIn()) {

    return (
      <nav className="navigation">
        <div className="navigation__row">
          <div className="netscape-box effect" ref={ref} />
          <div className="netscape-box effect-2" ref={hover} />
          <Link href={'/'}>
            <div className={`netscape-box`}
              datatype-order={0}
              onMouseEnter={handleHover}
              onMouseLeave={handleExit}
            >
              <span>Home</span>
            </div>
          </Link>
          <div className="netscape-box disabled" datatype-order={1}>
            <span>N/A</span>
          </div>
          <div className="netscape-box disabled" datatype-order={2}>
            <span>N/A</span>
          </div>
          <Link href={'/profile'}>
            <div className="netscape-box " datatype-order={3}
              onMouseEnter={handleHover}
              onMouseLeave={handleExit}
            >
              <span>Profile</span>
            </div>
          </Link>
          <Link href={'/settings'}>
            <div className="netscape-box " datatype-order={4}
              onMouseEnter={handleHover}
              onMouseLeave={handleExit}
            >
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </nav>
    )
  } else {
    return (
      <nav className="navigation">
        <div className="navigation__row">
          <div className="netscape-box effect" ref={ref} />
          <div className="netscape-box effect-2" ref={hover} />
          <Link href={'/login'}>
            <div className={`netscape-box`}
              datatype-order={0}
              onMouseEnter={handleHover}
              onMouseLeave={handleExit}
            >
              <span>Login</span>
            </div>
          </Link>
          <Link href={'/signup'}>
            <div className={`netscape-box`}
              datatype-order={1}
              onMouseEnter={handleHover}
              onMouseLeave={handleExit}
            >
              <span>Sign-Up</span>
            </div>
          </Link>
        </div>
      </nav>
    )

  }
}

export default Navigator;
