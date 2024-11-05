import { useNavigate } from 'react-router-dom';
import './styles/navigation.scss';
import { ReactNode } from 'react';

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


  return (
    <nav className="navigation">
      <div className="navigation__row">
        <Link href={'/'}>
          <div className="netscape-box">
            <span>Home</span>
          </div>
        </Link>
        <div className="netscape-box disabled">
          <span>N/A</span>
        </div>
        <div className="netscape-box disabled">
          <span>N/A</span>
        </div>
        <Link href={'/profile'}>
          <div className="netscape-box ">
            <span>Profile</span>
          </div>
        </Link>
        <Link href={'/settings'}>
          <div className="netscape-box ">
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </nav>
  )
}

export default Navigator;
