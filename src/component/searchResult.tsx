import { useEffect, useState, useMemo } from 'react';
import { StarFilled, TagFilled } from '@ant-design/icons';
import { useElementInview, type Option } from '../hooks/useElementInView';
import { useSearchGitHub, type resData, type SearchInput } from '../hooks/useSearchGitHub';

const options: Option = {
  root: null,
  rootMargin: '0px',
  threshold: 1,
};

interface Props {
  data: resData[] | null;
  nextRequest: { text: string; page: string | undefined };
}

export const SearchResult = (props: Props) => {
  // console.log('props:', props);
  const [viewData, setViewData] = useState<typeof props.data>(props.data);
  const [request, setRequest] = useState<SearchInput>(props.nextRequest);
  const { containerRef, inView } = useElementInview(options);
  const { data: nextData, error, resHeader, search } = useSearchGitHub();

  console.log({ viewData }, { nextData }, { resHeader }, { request }, { error });

  useEffect(() => {
    const fetchNext = async () => {
      console.log({ inView });
      console.log('%cfetch next', 'color: red; font-weight: bold;');
      await search(request);
    };
    if (inView && props.nextRequest.page !== undefined) {
      fetchNext();
    }
  }, [inView]);

  useEffect(() => {
    if (nextData !== null && viewData !== null) {
      setRequest({ text: request.text, page: resHeader?.nextPageNumber });
      setViewData([...viewData, ...nextData]);
    }
  }, [nextData]);

  useEffect(() => {
    if (props.data !== viewData) {
      setViewData(props.data);
      setRequest(props.nextRequest);
    }
  }, [props.data]);

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

  return (
    <>
      <div className="w-full h-screen-10rem bg-white rounded-lg overflow-auto p-2 scroll-p-2">
        {viewData?.map((item) => (
          <div key={item.id} className="p-1 border-b border-gray-300">
            <div className="hover:bg-gray-100 px-1">
              <a href={item.svn_url}>
                <h2 className="text-lg font-semibold">{item.name}</h2>
              </a>
              <p className="text-sm font-light">{item.description}</p>
              <span className="flex text-[11px] font-medium gap-2 ">
                <span className="flex items-center">
                  <StarFilled />
                  <span>{item.stargazers_count}</span>
                </span>
                <span className="flex items-center">
                  <TagFilled />
                  <span>{item.language}</span>
                </span>
                <span className="flex items-center">
                  <span>{item.license?.name}</span>
                </span>
                <span className="flex items-center">
                  <img src={item.owner.avatar_url} className="w-4 h-4 rounded-full"></img>
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
