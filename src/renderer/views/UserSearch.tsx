import { Link } from 'react-router-dom';
import { Authentication } from '../../api/auth';
import Input from '../components/Input';
import './styles/usersearch.scss';
import SearchResult from '../components/search/SearchResult';


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
    <main className="search">
      <h1 style={{ marginBottom: '1rem' }}>UserSearch</h1>
      <div className="search__container">
        <Input label=" " placeholder="Search for a user" />
        <div className="search__results">
          <SearchResult name={"Fofx."} username="kevin" id={'3'} />
        </div>
      </div>
    </main>
  )

}

export default UserSearch;
