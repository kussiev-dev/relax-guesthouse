import { ref, computed } from 'vue'

const pending = ref(0)

export const isLoading = computed(() => pending.value > 0)

export function startLoading() { pending.value++ }
export function stopLoading() { if (pending.value > 0) pending.value-- }
