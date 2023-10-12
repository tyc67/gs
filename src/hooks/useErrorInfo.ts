import { useMemo } from 'react';
import { errorCode } from './useSearchGitHub';

export const useErrorInfo = () => {
  const getErrorInformation = useMemo(() => {
    const handleErrorCode = (rateLimitReset: string, error: errorCode) => {
      const errorHandlers = {
        '403': () => {
          const resetTimestamp = Number(rateLimitReset) * 1000;
          const duration = Math.floor((resetTimestamp - Date.now()) / 1000);
          return `API rate limit exceeded, please retry after ${duration} seconds`;
        },
        '304': () => 'Not modified',
        '422': () => 'Validation failed, or the endpoint has been spammed.',
        '503': () => 'Service unavailable',
      };
      return errorHandlers[error] || 'Unknown error';
    };

    return handleErrorCode;
  }, []);

  return getErrorInformation;
};
