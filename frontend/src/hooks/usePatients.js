// Ultra-Advanced Patients Hook using React Query
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import * as patientsApi from '../api/patients';

/**
 * Ultra-Advanced Patients Hook
 * Features:
 * - Automatic caching with React Query
 * - Optimistic updates
 * - Infinite scroll support
 * - Auto-refetching on focus/reconnect
 * - Prefetching for better UX
 * - Error handling with toasts
 */

// Query keys factory for better organization
export const patientKeys = {
  all: ['patients'],
  lists: () => [...patientKeys.all, 'list'],
  list: (filters) => [...patientKeys.lists(), { filters }],
  details: () => [...patientKeys.all, 'detail'],
  detail: (id) => [...patientKeys.details(), id],
  stats: (id) => [...patientKeys.detail(id), 'stats'],
  history: (id) => [...patientKeys.detail(id), 'history'],
  diagnoses: (id) => [...patientKeys.detail(id), 'diagnoses'],
  timeline: (id) => [...patientKeys.detail(id), 'timeline'],
  notes: (id) => [...patientKeys.detail(id), 'notes'],
  documents: (id) => [...patientKeys.detail(id), 'documents'],
  analytics: () => [...patientKeys.all, 'analytics'],
};

// Get all patients with advanced options
export function usePatients(params = {}, options = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientsApi.getPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Keep old data while fetching new
    ...options,
  });

  // Prefetch next page for better UX
  const prefetchNextPage = useCallback(() => {
    if (query.data?.pagination?.page < query.data?.pagination?.pages) {
      queryClient.prefetchQuery({
        queryKey: patientKeys.list({ ...params, page: params.page + 1 }),
        queryFn: () => patientsApi.getPatients({ ...params, page: params.page + 1 }),
      });
    }
  }, [query.data, params, queryClient]);

  return {
    ...query,
    patients: query.data?.data || [],
    pagination: query.data?.pagination,
    prefetchNextPage,
  };
}

// Get single patient with stats
export function usePatient(id, options = {}) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientsApi.getPatient(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    ...options,
  });
}

// Get patient stats
export function usePatientStats(id, options = {}) {
  return useQuery({
    queryKey: patientKeys.stats(id),
    queryFn: () => patientsApi.getPatientStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Get patient history
export function usePatientHistory(id, params = {}, options = {}) {
  return useQuery({
    queryKey: patientKeys.history(id),
    queryFn: () => patientsApi.getPatientHistory(id, params),
    enabled: !!id,
    ...options,
  });
}

// Get patient diagnoses
export function usePatientDiagnoses(id, params = {}, options = {}) {
  return useQuery({
    queryKey: patientKeys.diagnoses(id),
    queryFn: () => patientsApi.getPatientDiagnoses(id, params),
    enabled: !!id,
    ...options,
  });
}

// Get patient timeline
export function usePatientTimeline(id, params = {}, options = {}) {
  return useQuery({
    queryKey: patientKeys.timeline(id),
    queryFn: () => patientsApi.getPatientTimeline(id, params),
    enabled: !!id,
    ...options,
  });
}

// Get patient notes
export function usePatientNotes(id, params = {}, options = {}) {
  return useQuery({
    queryKey: patientKeys.notes(id),
    queryFn: () => patientsApi.getPatientNotes(id, params),
    enabled: !!id,
    ...options,
  });
}

// Get patient analytics
export function usePatientAnalytics(params = {}, options = {}) {
  return useQuery({
    queryKey: patientKeys.analytics(),
    queryFn: () => patientsApi.getPatientAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Infinite scroll for patients
export function useInfinitePatients(params = {}, options = {}) {
  return useInfiniteQuery({
    queryKey: patientKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      patientsApi.getPatients({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Create patient mutation with optimistic updates
export function useCreatePatient(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientsApi.createPatient,
    onMutate: async (newPatient) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: patientKeys.lists() });

      // Snapshot previous value
      const previousPatients = queryClient.getQueryData(patientKeys.lists());

      // Optimistically update
      queryClient.setQueryData(patientKeys.lists(), (old) => {
        if (!old) return old;
        return {
          ...old,
          data: [{ ...newPatient, id: 'temp-' + Date.now() }, ...old.data],
        };
      });

      return { previousPatients };
    },
    onError: (err, newPatient, context) => {
      // Rollback on error
      queryClient.setQueryData(patientKeys.lists(), context.previousPatients);
      toast.error(`Failed to create patient: ${err.message}`);
    },
    onSuccess: (data) => {
      toast.success('Patient created successfully!');
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.analytics() });
    },
    ...options,
  });
}

// Update patient mutation with optimistic updates
export function useUpdatePatient(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => patientsApi.updatePatient(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: patientKeys.detail(id) });

      const previousPatient = queryClient.getQueryData(patientKeys.detail(id));

      queryClient.setQueryData(patientKeys.detail(id), (old) => ({
        ...old,
        data: { ...old?.data, ...data },
      }));

      return { previousPatient, id };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        patientKeys.detail(context.id),
        context.previousPatient
      );
      toast.error(`Failed to update patient: ${err.message}`);
    },
    onSuccess: (data, variables) => {
      toast.success('Patient updated successfully!');
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    ...options,
  });
}

// Delete patient mutation
export function useDeletePatient(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientsApi.deletePatient,
    onSuccess: (data, id) => {
      toast.success('Patient deleted successfully!');
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
    },
    onError: (err) => {
      toast.error(`Failed to delete patient: ${err.message}`);
    },
    ...options,
  });
}

// Add patient note mutation
export function useAddPatientNote(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }) => patientsApi.addPatientNote(id, note),
    onSuccess: (data, variables) => {
      toast.success('Note added successfully!');
      queryClient.invalidateQueries({ queryKey: patientKeys.notes(variables.id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.timeline(variables.id) });
    },
    onError: (err) => {
      toast.error(`Failed to add note: ${err.message}`);
    },
    ...options,
  });
}

// Upload patient document mutation
export function useUploadPatientDocument(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file, metadata }) =>
      patientsApi.uploadPatientDocument(id, file, metadata),
    onSuccess: (data, variables) => {
      toast.success('Document uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: patientKeys.documents(variables.id) });
    },
    onError: (err) => {
      toast.error(`Failed to upload document: ${err.message}`);
    },
    ...options,
  });
}

// Batch delete patients
export function useBatchDeletePatients(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientsApi.batchDeletePatients,
    onSuccess: () => {
      toast.success('Patients deleted successfully!');
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (err) => {
      toast.error(`Failed to delete patients: ${err.message}`);
    },
    ...options,
  });
}

// Export patients
export function useExportPatients(options = {}) {
  return useMutation({
    mutationFn: ({ format, filters }) => patientsApi.exportPatients(format, filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export completed successfully!');
    },
    onError: (err) => {
      toast.error(`Failed to export: ${err.message}`);
    },
    ...options,
  });
}

// Prefetch patient (for hover states, etc.)
export function usePrefetchPatient() {
  const queryClient = useQueryClient();

  return useCallback(
    (id) => {
      queryClient.prefetchQuery({
        queryKey: patientKeys.detail(id),
        queryFn: () => patientsApi.getPatient(id),
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

export default {
  usePatients,
  usePatient,
  usePatientStats,
  usePatientHistory,
  usePatientDiagnoses,
  usePatientTimeline,
  usePatientNotes,
  usePatientAnalytics,
  useInfinitePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  useAddPatientNote,
  useUploadPatientDocument,
  useBatchDeletePatients,
  useExportPatients,
  usePrefetchPatient,
};
