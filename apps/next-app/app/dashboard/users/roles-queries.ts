import { useQuery } from '@tanstack/react-query'
import { AuthRoleDTO } from '@js-monorepo/types/auth'
import { apiClient } from '@js-monorepo/utils/http'
import { handleQueryResponse, queryKeys } from '@js-monorepo/utils/http/queries'

const getRoles = async (): Promise<AuthRoleDTO[]> => {
  const response = await apiClient.get<AuthRoleDTO[]>(`/admin/roles`)
  return handleQueryResponse(response)
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.admin.roles(),
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
  })
}
