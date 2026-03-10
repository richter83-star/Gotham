import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import type {
  Case, CaseCreate, CaseUpdate,
  Entity, PaginatedResponse,
  SearchResult,
} from "@casegraph/shared-types";

// ── Cases ────────────────────────────────────────────────────────────────────

export function useCases(params: Record<string, string | number | null> = {}) {
  return useQuery({
    queryKey: ["cases", params],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Case>>("/cases", { params }).then((r) => r.data),
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ["cases", id],
    queryFn: () => apiClient.get<Case>(`/cases/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CaseCreate) =>
      apiClient.post<Case>("/cases", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cases"] }),
  });
}

export function useUpdateCase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CaseUpdate) =>
      apiClient.patch<Case>(`/cases/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases", id] });
      qc.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

export function useAddCaseNote(caseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      apiClient.post(`/cases/${caseId}/notes`, { body }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cases", caseId] }),
  });
}

// ── Entities ─────────────────────────────────────────────────────────────────

export function useEntities(params: Record<string, string | number | null> = {}) {
  return useQuery({
    queryKey: ["entities", params],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Entity>>("/entities", { params }).then((r) => r.data),
  });
}

export function useEntity(id: string) {
  return useQuery({
    queryKey: ["entities", id],
    queryFn: () => apiClient.get<Entity>(`/entities/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useEntityNeighbors(id: string) {
  return useQuery({
    queryKey: ["entities", id, "neighbors"],
    queryFn: () => apiClient.get(`/entities/${id}/neighbors`).then((r) => r.data),
    enabled: !!id,
  });
}

// ── Search ────────────────────────────────────────────────────────────────────

export function useSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: () =>
      apiClient.get<SearchResult[]>("/search", { params: { q } }).then((r) => r.data),
    enabled: q.length >= 2,
  });
}
