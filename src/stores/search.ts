import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

export const useSearchStore = defineStore('search', () => {
  const query = ref('');
  const results = ref<SearchResultItem[]>([]);
  const answer = ref<string | null>(null);
  const error = ref<string | null>(null);

  const hasSearchData = computed(
    () =>
      (query.value?.trim?.()?.length ?? 0) > 0 ||
      results.value.length > 0 ||
      (answer.value?.length ?? 0) > 0,
  );

  function setResults(data: {
    query: string;
    results: SearchResultItem[];
    answer?: string | null;
  }) {
    query.value = data.query ?? '';
    results.value = Array.isArray(data.results) ? data.results : [];
    answer.value = data.answer ?? null;
    error.value = null;
  }

  function setError(msg: string) {
    error.value = msg;
  }

  function clear() {
    query.value = '';
    results.value = [];
    answer.value = null;
    error.value = null;
  }

  return {
    query,
    results,
    answer,
    error,
    hasSearchData,
    setResults,
    setError,
    clear,
  };
});
