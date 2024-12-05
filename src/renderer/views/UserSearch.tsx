import { Link } from 'react-router-dom';
import { Authentication } from '../../api/auth';
import Input from '../components/Input';
import './styles/usersearch.scss';


function UserSearch() {

  const offline = Authentication.getOfflineMode();
  if (offline) {
    return (
      <main>
        <h1 style={{ marginBottom: '1rem' }}>UserSearch</h1>
        <div className="search-container">
          <h2>Offline Mode</h2>
          <p>Offline mode is enabled. You can't search for users while offline.</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1 style={{ marginBottom: '1rem' }}>UserSearch</h1>
      <div className="search-container">
        <h2>Search for a user</h2>
        <Input label=" " placeholder="Search for a user" />
        <Link to="/profile?uid=2">Sex</Link>
      </div>
    </main>
  )

}

export default UserSearch;
