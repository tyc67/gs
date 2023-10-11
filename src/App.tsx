import { useEffect, useState } from 'react';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import { useSearchGitHub, type SearchInput, type resData } from './hooks/useSearchGitHub';
import { SearchResult } from './component/searchResult';

const initialInput = { text: '', page: undefined };

function App() {
  const [searchInput, setSearchInput] = useState<SearchInput>(initialInput);
  const [searchCache, setSearchCache] = useState<SearchInput>(searchInput);
  const [searchResult, setSearchResult] = useState<resData[]>([]);
  const { data, resHeader, search } = useSearchGitHub();

  useEffect(() => {
    if (data) {
      setSearchResult(data);
    }
  }, [data]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (searchInput.text.trim() !== '' && searchInput.text !== searchCache.text) {
      // console.log(`%csearch: ${searchInput.text}`, 'color: red; font-weight: bold;');
      await search(searchInput);
      setSearchCache(searchInput);
    }
  };
  const handleCancel = () => {
    setSearchInput(initialInput);
    setSearchCache(initialInput);
    setSearchResult([]);
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
        <div id="search-result" className="w-full">
          {searchResult.length === 0 ? null : (
            <SearchResult
              data={data}
              nextRequest={{
                text: searchCache.text,
                page: resHeader?.nextPageNumber,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
