import { useEffect, useState } from 'react';
import { SearchOutlined, CloseCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSearchGitHub, type SearchInput, type resData } from './hooks/useSearchGitHub';
import { SearchResult } from './component/searchResult';

function App() {
  const initialInput = { text: '', page: undefined };
  const [searchInput, setSearchInput] = useState<SearchInput>(initialInput);
  const [searchCache, setSearchCache] = useState<SearchInput>(initialInput);
  const [searchResult, setSearchResult] = useState<resData[]>([]);
  const [nextRequest, setNextRequest] = useState<SearchInput>(initialInput);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetTimestamp, setResetTimestamp] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);
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
      await search(nextRequest);
    };
    if (inView) {
      fetchNext();
    }
  }, [inView]);

  useEffect(() => {
    if (error && timeUntilReset) {
      // what if error !==null but timeUntilReset is null?
      const errorMessages = {
        '403': `API rate limit exceeded, please retry after ${Math.floor(timeUntilReset / 1000)} seconds`,
        '304': 'Not modified',
        '422': 'Validation failed, or the endpoint has been spammed.',
        '503': 'Service unavailable',
      };
      setErrorMessage(errorMessages[error] || 'Uknown error');
    } else {
      setErrorMessage(null);
    }
  }, [error, timeUntilReset]);

  const handleInViewChange = (inView: boolean) => {
    setInView(inView);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (searchInput.text.trim() !== '' && searchInput.text !== searchCache.text) {
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
        <h1>GitHub Search</h1>
        <div
          id="search-bar"
          className="w-full h-10 p-2 rounded-md bg-white focus-within:ring-1 ring-inset ring-blue-500 focus-within:border-blue-500  border border-gray-300"
        >
          <form onSubmit={handleSubmit} className="flex items-center">
            <SearchOutlined className="mr-2" />
            <input
              id="search-input"
              type="text"
              value={searchInput.text}
              placeholder="search github repo ..."
              onChange={(e) => {
                setSearchInput({ text: e.target.value, page: undefined });
              }}
              pattern="\S+"
              required
              className="w-full mr-2 focus:outline-none"
              autoComplete="off"
            ></input>
            {searchInput.text === '' ? null : <CloseCircleFilled onClick={() => handleCancel()} />}
          </form>
        </div>
        <div id="err" className="w-full flex justify-center">
          {/* {<p>{timeUntilReset}</p>} */}
          {errorMessage ? (
            <div className="text-red-600 flex items-center">
              <ExclamationCircleOutlined className="mr-1 text-[14px]" />
              <p className="text-xs">{errorMessage}</p>
            </div>
          ) : null}
        </div>
        <div id="search-result" className="w-full">
          {searchResult.length === 0 ? null : (
            <SearchResult data={searchResult} onInViewChange={handleInViewChange} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
