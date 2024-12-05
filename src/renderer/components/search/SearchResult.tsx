import { Link } from 'react-router-dom';
import '../styles/search/searchresult.scss';

type SearchResultProps = {
  name: string;
  username: string;
  id: string;
};

function SearchResult({ name, username, id }: SearchResultProps) {
  return (
    <Link className="search-result card" to={`/profile?uid=${id}`}>
      <div className="search-result__avatar">
        <img src="https://via.placeholder.com/150" alt="User Avatar" />
      </div>
      <div className="search-result__info">
        <h3 className="search-result__name">{name}</h3>
        <p className="search-result__username">
          @{username}
        </p>
      </div>
    </Link>
  );
}

export default SearchResult;
