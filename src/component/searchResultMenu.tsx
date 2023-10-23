import { SearchResult } from './SearchResult';
import { type resData } from '../hooks/useSearchGitHub';

interface SearchResultMenuProps {
  searchResult: resData[];
  isLoading: boolean;
  handleInViewChange: (inView: boolean) => void;
}

export default function SearchResultMenu({ searchResult, isLoading, handleInViewChange }: SearchResultMenuProps) {
  return (
    <div id="search-result" className="w-full">
      {searchResult.length === 0 ? null : (
        <SearchResult data={searchResult} onInViewChange={handleInViewChange} isLoading={isLoading} />
      )}
    </div>
  );
}
