import { useState, useCallback } from 'react';
import { useApiRequest } from './useFetchApi';

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

interface apiStatus {
  nextPageNumber: string;
  rateLimitReset: string;
}

interface GitHubResponse {
  incomplete_results: boolean;
  items: resData[];
  total_count: number;
}

export interface SearchInput {
  text: string;
  page: string | undefined;
}

export type errorCode = 403 | 304 | 422 | 503;

const cache = new Map<string, { status: apiStatus; items: resData[] }>();

export const useSearchGitHub = () => {
  const [data, setData] = useState<resData[] | null>(null);
  const [error, setError] = useState<errorCode | null>(null);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<apiStatus | null>(null);

  const { fetchData } = useApiRequest();

  const search = useCallback(
    async (input: SearchInput) => {
      if (cache.has(`${input.text}-${input.page}`)) {
        setData(cache.get(`${input.text}-${input.page}`)!.items);
        setApiStatus(cache.get(`${input.text}-${input.page}`)!.status);
        return;
      }
      setIsloading(true);

      const apiUrl =
        input.page === undefined
          ? `https://api.github.com/search/repositories?q=${input.text}`
          : `https://api.github.com/search/repositories?q=${input.text}&page=${input.page}`;

      const apiInit = {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github.text-match+json',
          Authorization: import.meta.env.VITE_GITHUB_API_TOKEN,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      };
      const {
        response,
        headers,
        error: apiError,
      }: { response: GitHubResponse; headers: Headers | null; error: errorCode } = await fetchData(apiUrl, apiInit);
      if (apiError) {
        setError(apiError);
        setIsloading(false);
      } else {
        const link = headers?.get('link');
        const linkArr = link?.match(/<([^>]+)>;\s*rel="([^"]+)"/g);
        const nextPageNumber = linkArr?.find((d) => d.includes('rel="next"'))?.match(/page=(\d+)/)?.[1];
        const rateLimitReset = headers?.get('x-ratelimit-reset');

        if (nextPageNumber && rateLimitReset) {
          setApiStatus({ nextPageNumber, rateLimitReset });
          cache.set(`${input.text}-${input.page}`, {
            status: { nextPageNumber, rateLimitReset },
            items: response.items,
          });
        }
        setData(response.items);
        setError(null);
        setIsloading(false);
      }
    },
    [fetchData],
  );

  return { data, error, isLoading, apiStatus, search };
};
