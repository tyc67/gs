import { useEffect } from 'react';
import { StarFilled, TagFilled } from '@ant-design/icons';
import { useElementInview, type Option } from '../hooks/useElementInView';
import { type resData } from '../hooks/useSearchGitHub';

const options: Option = {
  root: null,
  rootMargin: '0px',
  threshold: 1,
};

interface Props {
  data: resData[] | null;
  onInViewChange: (inView: boolean) => void;
}

export const SearchResult = ({ data: viewData, onInViewChange }: Props) => {
  const { containerRef, inView } = useElementInview(options);

  useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  /*
  const getErrorInformation = useMemo(() => {
    const errorHandlers = {
      '403': () => {
        const resetTimestamp = Number(resHeader?.rateLimitReset) * 1000;
        const now = Date.now();
        const duration = Math.floor((resetTimestamp - now) / 1000);
        console.log(duration);
        console.log(`API rate limit exceeded, try request after ${duration}sec`);
        // there is a counting latency problem....
      },
      '304': () => {
        console.log('not modified');
      },
      '422': () => {
        console.log('Validation failed, or the endpoint has been spammed.');
      },
      '503': () => {
        console.log('Service unavailable');
      },
    };
    if (error) {
      const isMatchErrorCode = errorHandlers[error];
      if (isMatchErrorCode) {
        isMatchErrorCode();
      }
    }
  }, [error]);
*/
  return (
    <>
      <div className="w-full h-screen-10rem bg-white rounded-lg overflow-auto p-2 scroll-p-2">
        {viewData?.map((item) => (
          <div key={item.id} className="p-1 border-b border-gray-300">
            <div className="hover:bg-gray-100 px-1">
              <a href={item.svn_url}>
                <h2 className="text-lg font-semibold">{item.name}</h2>
              </a>
              <p className="text-[12px] font-light">{item.description}</p>
              <span className="flex text-[10px] text-slate-500 font-medium gap-2 ">
                <span className="flex items-center">
                  <StarFilled className="mr-1" />
                  <span>{item.stargazers_count}</span>
                </span>
                <span className="flex items-center">
                  <TagFilled className="mr-1" />
                  <span>{item.language}</span>
                </span>
                <span className="flex items-center">
                  <span>{item.license?.name}</span>
                </span>
                <span className="flex items-center">
                  <img src={item.owner.avatar_url} className="w-4 h-4 mr-1 rounded-full"></img>
                  <span>{item.owner.login}</span>
                </span>
              </span>
            </div>
          </div>
        ))}
        <div id="end-of-page" ref={containerRef} className="w-1px h-1px invisible" />
      </div>
    </>
  );
};
