import { useEffect, useRef } from "react";

/**
 * Fires `onLoadMore` when the sentinel intersects the scroll container (not the viewport).
 */
export function useInfiniteScrollSentinel(
  scrollRootRef: React.RefObject<HTMLElement | null>,
  onLoadMore: () => void,
  enabled: boolean,
  hasMore: boolean,
  loading: boolean
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled || !hasMore || loading) return;
    const root = scrollRootRef.current;
    const sentinel = sentinelRef.current;
    if (!sentinel || !root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { root, rootMargin: "100px", threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [enabled, hasMore, loading, scrollRootRef]);

  return sentinelRef;
}
