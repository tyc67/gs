import { useState, useEffect } from 'react';

export const useApiData = (apiUrl: string, apiInit?: RequestInit) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);
        const response = await fetch(apiUrl, apiInit);
        if (response.ok) {
          const responseData = await response.json();
          setData(responseData);
          setError(null);
        } else {
          throw Error(`${response.status}`);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsloading(false);
      }
    };
    fetchData();
  }, [apiInit, apiUrl]);

  return { data, isLoading, error };
};

interface FetchState {
  error: any;
  response: any;
  headers: Headers | null;
}

export const useApiRequest = () => {
  const fetchData = async (apiUrl: string, apiInit?: RequestInit) => {
    const state: FetchState = {
      error: null,
      response: null,
      headers: null,
    };

    try {
      const response = await fetch(apiUrl, apiInit);
      state.headers = response.headers;

      if (response.ok) {
        state.response = await response.json();
      } else {
        state.error = response.status;
      }
    } catch (error: any) {
      state.error = error.message;
    }
    return state;
  };

  return { fetchData };
};
