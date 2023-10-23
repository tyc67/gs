import { useEffect, useState } from 'react';
import { useSearchGitHub, type SearchInput, type resData } from './hooks/useSearchGitHub';
import SearchResultMenu from './component/SearchResultMenu';
import SearchBar from './component/SearchBar';
import ErrorInfo from './component/ErrorInfo';

function App() {
  const initialInput = { text: '', page: undefined };
  const [searchInput, setSearchInput] = useState<SearchInput>(initialInput);
  const [searchCache, setSearchCache] = useState<SearchInput>(initialInput);
  const [searchResult, setSearchResult] = useState<resData[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);
  const { data, apiStatus, isLoading, error, search } = useSearchGitHub();

  const resetTimestamp = Number(apiStatus?.rateLimitReset ?? 0) * 1000;

  useEffect(() => {
    if (data) {
      setSearchResult([...searchResult, ...data]);
    }
  }, [data]);

  useEffect(() => {
    if (error !== 403) return;
    const intervalId = setInterval(() => {
      const remainingTime = resetTimestamp - Date.now();
      if (remainingTime <= 0) {
        setTimeUntilReset(null);
        clearInterval(intervalId);
      } else {
        setTimeUntilReset(remainingTime);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [error, resetTimestamp]);

  let isReachRateLimit = false;
  let errorMessage = '';
  if (error && timeUntilReset) {
    switch (error) {
      case 403:
        isReachRateLimit = true;
        errorMessage = `API rate limit exceeded, please retry after ${Math.floor(timeUntilReset / 1000)} seconds`;
        break;
      case 304:
        errorMessage = 'Not modified';
        break;
      case 422:
        errorMessage = 'Validation failed, or the endpoint has been spammed.';
        break;
      case 503:
        errorMessage = 'Service unavailable';
        break;
      default:
        errorMessage = 'Uknown error';
    }
  }

  const handleInViewChange = async (inView: boolean) => {
    if (inView && !isReachRateLimit && !isLoading) {
      await search({
        text: searchCache.text,
        page: apiStatus?.nextPageNumber,
      });
    }
  };

  const handleOnChage = (e: any) => {
    setSearchInput({ text: e.target.value, page: undefined });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (searchInput.text.trim() !== '' && searchInput.text !== searchCache.text && !isReachRateLimit) {
      setSearchResult([]);
      await search(searchInput);
      setSearchCache(searchInput);
    }
  };
  const handleCancel = () => {
    setSearchInput(initialInput);
    setSearchCache(initialInput);
    setSearchResult([]);
  };

  if (searchInput.text === '' && searchResult.length > 0) {
    handleCancel();
  }

  return (
    <div className="flex bg-gray-100 justify-center">
      <div
        id="search-container"
        className="flex flex-col max-w-2xl  h-[100vh] gap-2 p-2 w-full items-center text-slate-600"
      >
        <h1 className="text-2xl font-semibold">GitHub Search</h1>
        <SearchBar
          searchInput={searchInput}
          handleOnChage={handleOnChage}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />
        <ErrorInfo errorMessage={errorMessage} />
        <SearchResultMenu isLoading={isLoading} searchResult={searchResult} handleInViewChange={handleInViewChange} />
      </div>
    </div>
  );
}

export default App;
