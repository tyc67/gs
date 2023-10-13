import { useEffect, useState } from 'react';
import { useSearchGitHub, type SearchInput, type resData } from './hooks/useSearchGitHub';
import SearchResultMenu from './component/searchResultMenu';
import SearchBar from './component/searchBar';
import ErrorInfo from './component/errorInfo';

function App() {
  const initialInput = { text: '', page: undefined };
  const [searchInput, setSearchInput] = useState<SearchInput>(initialInput);
  const [searchCache, setSearchCache] = useState<SearchInput>(initialInput);
  const [searchResult, setSearchResult] = useState<resData[]>([]);
  const [nextRequest, setNextRequest] = useState<SearchInput>(initialInput);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetTimestamp, setResetTimestamp] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);
  const [isReachRateLimit, setIsReachRateLimit] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(false);
  const { data, resHeader, isLoading, error, search } = useSearchGitHub();

  useEffect(() => {
    if (data) {
      setSearchResult([...searchResult, ...data]);
      setNextRequest({
        text: searchCache.text,
        page: resHeader?.nextPageNumber,
      });
      setResetTimestamp(Number(resHeader?.rateLimitReset) * 1000);
    }
  }, [data]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (resetTimestamp) {
        const remainingTime = resetTimestamp - Date.now();
        if (remainingTime <= 0) {
          setTimeUntilReset(null);
          clearInterval(intervalId);
        } else {
          setTimeUntilReset(remainingTime);
        }
      }
      return () => clearInterval(intervalId);
    }, 1000);
  }, [resetTimestamp]);

  useEffect(() => {
    const fetchNext = async () => {
      if (!isReachRateLimit) {
        await search(nextRequest);
      }
    };
    if (inView) {
      fetchNext();
    }
  }, [inView]);

  useEffect(() => {
    if (error && timeUntilReset) {
      const errorMessages = {
        '403': () => {
          setIsReachRateLimit(true);
          return `API rate limit exceeded, please retry after ${Math.floor(timeUntilReset / 1000)} seconds`;
        },
        '304': 'Not modified',
        '422': 'Validation failed, or the endpoint has been spammed.',
        '503': 'Service unavailable',
      };
      setErrorMessage(errorMessages[error] || 'Uknown error');
    } else {
      setErrorMessage(null);
      setIsReachRateLimit(false);
    }
  }, [error, timeUntilReset]);

  const handleInViewChange = (inView: boolean) => {
    setInView(inView);
  };

  const handleOnChage = (e: any) => {
    setSearchInput({ text: e.target.value, page: undefined });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (searchInput.text.trim() !== '' && searchInput.text !== searchCache.text && !isReachRateLimit) {
      // console.log(`%csearch: ${searchInput.text}`, 'color: red; font-weight: bold;');
      setSearchResult([]);
      await search(searchInput);
      setSearchCache(searchInput);
    }
  };
  const handleCancel = () => {
    setSearchInput(initialInput);
    setSearchCache(initialInput);
    setNextRequest(initialInput);
    setSearchResult([]);
    setErrorMessage(null);
  };

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
