import { ref, shallowRef } from 'vue';

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

export interface SearchResultsState {
  query: string;
  results: SearchResultItem[];
  answer: string | null;
  loading: boolean;
  error: string | null;
}

const query = ref('');
const results = ref<SearchResultItem[]>([]);
const answer = shallowRef<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

let searchResultsListenerAttached = false;
function attachSearchResultsListener() {
  if (searchResultsListenerAttached) return;
  searchResultsListenerAttached = true;
  window.addEventListener('kwami:search_results', (e: Event) => {
    const detail = (e as CustomEvent).detail as {
      query: string;
      results: SearchResultItem[];
      answer: string | null;
    };
    query.value = detail.query;
    results.value = detail.results ?? [];
    answer.value = detail.answer ?? null;
    error.value = null;
  });
}

export function useSearchResults() {
  attachSearchResultsListener();

  function setResults(data: {
    query: string;
    results: SearchResultItem[];
    answer?: string | null;
  }) {
    query.value = data.query;
    results.value = data.results;
    answer.value = data.answer ?? null;
    error.value = null;
  }

  function setLoading(loading_: boolean) {
    loading.value = loading_;
    if (loading_) error.value = null;
  }

  function setError(message: string) {
    error.value = message;
    loading.value = false;
  }

  function clear() {
    query.value = '';
    results.value = [];
    answer.value = null;
    loading.value = false;
    error.value = null;
  }

  const hasResults = () => results.value.length > 0 || (answer.value?.length ?? 0) > 0;

  return {
    query,
    results,
    answer,
    loading,
    error,
    setResults,
    setLoading,
    setError,
    clear,
    hasResults,
  };
}
