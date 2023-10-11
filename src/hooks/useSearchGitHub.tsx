import { useState, useCallback } from 'react';
import { vndTransform, type Vnd } from '../utils/vnd';

export interface resData {
  id: string;
  svn_url: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string;
  license: {
    key: string;
    name: string;
    node_id: string;
    spdx_id: string;
    url: string;
  } | null;
  owner: { avatar_url: string; login: string };
}

interface resBody {
  incomplete_results: boolean;
  items: resData[];
  total_count: number;
}

export interface SearchInput {
  text: string;
  page: string | undefined;
}

type error = '403' | '304' | '422' | '503';

export const useSearchGitHub = () => {
  const [data, setData] = useState<resData[] | null>(null);
  const [error, setError] = useState<error | null>(null);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [resHeader, setResHeader] = useState<Partial<Vnd> | null>(null);

  const search = useCallback(async (state: SearchInput) => {
    try {
      setIsloading(true);
      console.log(state);
      const url = () => {
        if (state.page === undefined) {
          return `https://api.github.com/search/repositories?q=${state.text}`;
        } else {
          return `https://api.github.com/search/repositories?q=${state.text}&page=${state.page}`;
        }
      };
      const res = await fetch(url(), {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github.text-match+json',
          Authorization: import.meta.env.VITE_GITHUB_API_TOKEN,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      console.log(...res.headers);
      if (res.ok) {
        const responseHeader = vndTransform(res);
        const responseBody: resBody = await res.json();
        const responseData = responseBody.items;
        setResHeader(responseHeader);
        setData(responseData);
        setError(null);
      } else {
        throw Error(`${res.status}`);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsloading(false);
    }
  }, []);

  return { data, error, isLoading, resHeader, search };
};
