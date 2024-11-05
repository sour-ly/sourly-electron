import './styles/navigation.scss';

function Navigator() {
  return (
    <nav className="navigation">
      <div className="navigation__row">
        <div className="netscape-box">
          <span>Home</span>
        </div>
        <div className="netscape-box disabled">
          <span>N/A</span>
        </div>
        <div className="netscape-box disabled">
          <span>N/A</span>
        </div>
        <div className="netscape-box disabled">
          <span>Profile</span>
        </div>
        <div className="netscape-box disabled">
          <span>Settings</span>
        </div>
      </div>
    </nav>
  )
}

export default Navigator;
