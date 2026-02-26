import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSearchStore, type SearchResultItem } from '@/stores/search';

let searchResultsListenerAttached = false;

export type { SearchResultItem };

export interface SearchResultsState {
  query: string;
  results: SearchResultItem[];
  answer: string | null;
  loading: boolean;
  error: string | null;
}

export function useSearchResults() {
  const store = useSearchStore();
  const { query, results, answer, error, hasSearchData } = storeToRefs(store);
  const { setResults: storeSetResults, setError: storeSetError, clear: storeClear } = store;

  if (!searchResultsListenerAttached) {
    searchResultsListenerAttached = true;
    window.addEventListener('kwami:search_results', (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        query?: string;
        results?: SearchResultItem[];
        answer?: string | null;
      };
      store.setResults({
        query: detail?.query ?? '',
        results: Array.isArray(detail?.results) ? detail.results : [],
        answer: detail?.answer ?? null,
      });
    });
  }

  function setResults(data: {
    query: string;
    results: SearchResultItem[];
    answer?: string | null;
  }) {
    storeSetResults(data);
  }

  function setLoading(_loading: boolean) {
    if (_loading) storeSetError('');
  }

  function setError(message: string) {
    storeSetError(message);
  }

  function clear() {
    storeClear();
  }

  const hasResults = computed(
    () => results.value.length > 0 || (answer.value?.length ?? 0) > 0,
  );

  return {
    query,
    results,
    answer,
    loading: ref(false),
    error,
    setResults,
    setLoading,
    setError,
    clear,
    hasResults,
    hasSearchData,
  };
}
