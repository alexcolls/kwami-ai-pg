import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
  /** Image URL (e.g. og:image from result page) */
  image?: string;
  /** Extracted features (e.g. "2 bedrooms", "€2000/mo") */
  features?: string[];
}

export const useSearchStore = defineStore('search', () => {
  const query = ref('');
  const results = ref<SearchResultItem[]>([]);
  const resultsBatchId = ref(0); // Bump when results change so card entrance re-runs
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
    resultsBatchId.value += 1;
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
    resultsBatchId,
    answer,
    error,
    hasSearchData,
    setResults,
    setError,
    clear,
  };
});
