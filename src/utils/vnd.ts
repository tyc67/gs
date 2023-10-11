/**
 * A function converts application/vnd.github.text-match+json Headers
 */
export const vndTransform = (res: Response) => {
  const link = res.headers.get('link');
  const linkArr = link?.match(/<([^>]+)>;\s*rel="([^"]+)"/g);
  const nextPageNumber = linkArr?.find((d) => d.includes('rel="next"'))?.match(/page=(\d+)/)?.[1];
  const lastPageNumber = linkArr?.find((d) => d.includes('rel="last"'))?.match(/page=(\d+)/)?.[1];

  const rateLimit = res.headers.get('x-ratelimit-limit');
  const rateLimitRemain = res.headers.get('x-ratelimit-remaining');
  const rateLimitUse = res.headers.get('x-ratelimit-used');
  const rateLimitReset = res.headers.get('x-ratelimit-reset');

  return { link, nextPageNumber, lastPageNumber, rateLimit, rateLimitUse, rateLimitRemain, rateLimitReset };
};

type VndTransfomer = typeof vndTransform;
// type FirstArgument = Parameters<VndTransfomer>;
export type Vnd = ReturnType<VndTransfomer>;

// Type Utilities for function
//  - ReturnType
//  - Parameters
