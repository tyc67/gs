import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import { type SearchInput } from '../hooks/useSearchGitHub';

interface SearcBarProps {
  searchInput: SearchInput;
  handleOnChage: (e: any) => void;
  handleSubmit: (e: any) => void;
  handleCancel: () => void;
}

export default function SearchBar({ searchInput, handleOnChage, handleSubmit, handleCancel }: SearcBarProps) {
  return (
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
          onChange={handleOnChage}
          pattern="\S+"
          required
          className="w-full mr-2 focus:outline-none"
          autoComplete="off"
        ></input>
        {searchInput.text === '' ? null : <CloseCircleFilled onClick={handleCancel} />}
      </form>
    </div>
  );
}
