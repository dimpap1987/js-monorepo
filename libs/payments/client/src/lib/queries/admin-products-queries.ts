'use client'

import { PaginationType } from '@js-monorepo/types/pagination'
import { handleQueryResponse } from '@js-monorepo/utils/http/queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AdminProduct,
  AdminProductFilters,
  AdminProductStats,
  CreatePriceRequest,
  CreateProductRequest,
  UpdatePriceRequest,
  UpdateProductRequest,
} from '../types'
import {
  apiCreatePrice,
  apiCreateProduct,
  apiDeletePrice,
  apiDeleteProduct,
  apiGetAdminProduct,
  apiGetAdminProductStats,
  apiGetAdminProducts,
  apiGetAdminPrices,
  apiSyncPriceToStripe,
  apiSyncProductToStripe,
  apiTogglePriceActive,
  apiToggleProductActive,
  apiUpdatePrice,
  apiUpdateProduct,
} from '../utils/admin-api'

// ============= Query Keys =============

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  list: (page: number, pageSize: number, filters?: AdminProductFilters) =>
    [...adminProductKeys.all, 'list', { page, pageSize, filters }] as const,
  detail: (id: number) => [...adminProductKeys.all, 'detail', id] as const,
  stats: () => [...adminProductKeys.all, 'stats'] as const,
  prices: {
    all: ['admin', 'prices'] as const,
    list: (productId?: number) => [...adminProductKeys.prices.all, 'list', productId] as const,
    detail: (id: number) => [...adminProductKeys.prices.all, 'detail', id] as const,
  },
}

// ============= Product Queries =============

export function useAdminProducts(page = 1, pageSize = 10, filters?: AdminProductFilters) {
  return useQuery({
    queryKey: adminProductKeys.list(page, pageSize, filters),
    queryFn: async (): Promise<PaginationType<AdminProduct>> => {
      const response = await apiGetAdminProducts(page, pageSize, filters)
      return handleQueryResponse(response)
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useAdminProduct(id: number | undefined) {
  return useQuery({
    queryKey: adminProductKeys.detail(id || 0),
    queryFn: async (): Promise<AdminProduct> => {
      const response = await apiGetAdminProduct(id as number)
      return handleQueryResponse(response)
    },
    enabled: !!id,
  })
}

export function useAdminProductStats() {
  return useQuery({
    queryKey: adminProductKeys.stats(),
    queryFn: async (): Promise<AdminProductStats> => {
      const response = await apiGetAdminProductStats()
      return handleQueryResponse(response)
    },
  })
}

// ============= Product Mutations =============

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await apiCreateProduct(data)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProductRequest }) => {
      const response = await apiUpdateProduct(id, data)
      return handleQueryResponse(response)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.id) })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiDeleteProduct(id)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
  })
}

export function useToggleProductActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await apiToggleProductActive(id, active)
      return handleQueryResponse(response)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.id) })
    },
  })
}

export function useSyncProductToStripe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiSyncProductToStripe(id)
      return handleQueryResponse(response)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(id) })
    },
  })
}

// ============= Price Queries =============

export function useAdminPrices(productId?: number) {
  return useQuery({
    queryKey: adminProductKeys.prices.list(productId),
    queryFn: async () => {
      const response = await apiGetAdminPrices(productId)
      return handleQueryResponse(response)
    },
  })
}

// ============= Price Mutations =============

export function useCreatePrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePriceRequest) => {
      const response = await apiCreatePrice(data)
      return handleQueryResponse(response)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.prices.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
    },
  })
}

export function useUpdatePrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePriceRequest }) => {
      const response = await apiUpdatePrice(id, data)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.prices.all })
    },
  })
}

export function useDeletePrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiDeletePrice(id)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.prices.all })
    },
  })
}

export function useTogglePriceActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await apiTogglePriceActive(id, active)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.prices.all })
    },
  })
}

export function useSyncPriceToStripe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiSyncPriceToStripe(id)
      return handleQueryResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.prices.all })
    },
  })
}
