import { apiClient } from '../../../shared/configs/axiosConfig';
import { ADMIN_ENDPOINTS } from './adminEndpoints';
import type {
  GetAdministratorDto,
  CreateAdministratorDto,
  GetUserDto,
  SessionInfoDto,
  InformationPageDto,
  CreateInformationPageDto,
  InformationTagDto,
  CreateInformationTagDto,
  NavigationMenuDto,
  CreateNavigationMenuDto,
  ConfigurationDto,
  CreateConfigurationDto,
  QuizzDto,
  CreateQuizzDto,
  AdminLogDto,
} from './adminTypes';

export const adminApi = {
  administrators: {
    getAll: () => apiClient.get<GetAdministratorDto[]>(ADMIN_ENDPOINTS.administrators),
    getById: (id: string) => apiClient.get<GetAdministratorDto>(`${ADMIN_ENDPOINTS.administrators}/${id}`),
    create: (dto: CreateAdministratorDto) => apiClient.post(ADMIN_ENDPOINTS.administrators, dto),
    update: (id: string, dto: Partial<CreateAdministratorDto>) =>
      apiClient.put(`${ADMIN_ENDPOINTS.administrators}/${id}`, dto),
    delete: (id: string) => apiClient.delete(`${ADMIN_ENDPOINTS.administrators}/${id}`),
  },

  users: {
    getAll: () => apiClient.get<GetUserDto[]>(`${ADMIN_ENDPOINTS.users}`),
    getById: (id: string) => apiClient.get<GetUserDto>(`${ADMIN_ENDPOINTS.users}/${id}`),
    updateStatus: (userId: string, active: boolean) =>
      apiClient.patch(`${ADMIN_ENDPOINTS.users}/${userId}/status`, { active }),
    getSessions: (userId: string) =>
      apiClient.get<SessionInfoDto[]>(`${ADMIN_ENDPOINTS.users}/${userId}/sessions`),
    revokeSession: (userId: string, sessionId: string) =>
      apiClient.delete(`${ADMIN_ENDPOINTS.users}/${userId}/sessions/${sessionId}`),
    revokeAllSessions: (userId: string) =>
      apiClient.delete(`${ADMIN_ENDPOINTS.users}/${userId}/sessions`),
  },

  pages: {
    getAll: () => apiClient.get<InformationPageDto[]>(ADMIN_ENDPOINTS.pages),
    getById: (id: string) => apiClient.get<InformationPageDto>(`${ADMIN_ENDPOINTS.pages}/${id}`),
    create: (dto: CreateInformationPageDto) => apiClient.post(ADMIN_ENDPOINTS.pages, dto),
    update: (id: string, dto: Partial<CreateInformationPageDto>) =>
      apiClient.put(`${ADMIN_ENDPOINTS.pages}/${id}`, dto),
    delete: (id: string) => apiClient.delete(`${ADMIN_ENDPOINTS.pages}/${id}`),
  },

  tags: {
    getAll: () => apiClient.get<InformationTagDto[]>(ADMIN_ENDPOINTS.tags),
    getById: (id: string) => apiClient.get<InformationTagDto>(`${ADMIN_ENDPOINTS.tags}/${id}`),
    create: (dto: CreateInformationTagDto) => apiClient.post(ADMIN_ENDPOINTS.tags, dto),
    update: (id: string, dto: Partial<CreateInformationTagDto>) =>
      apiClient.put(`${ADMIN_ENDPOINTS.tags}/${id}`, dto),
    delete: (id: string) => apiClient.delete(`${ADMIN_ENDPOINTS.tags}/${id}`),
  },

  menus: {
    getAll: () => apiClient.get<NavigationMenuDto[]>(ADMIN_ENDPOINTS.menus),
    getById: (id: string) => apiClient.get<NavigationMenuDto>(`${ADMIN_ENDPOINTS.menus}/${id}`),
    create: (dto: CreateNavigationMenuDto) => apiClient.post(ADMIN_ENDPOINTS.menus, dto),
    update: (id: string, dto: Partial<CreateNavigationMenuDto>) =>
      apiClient.put(`${ADMIN_ENDPOINTS.menus}/${id}`, dto),
    delete: (id: string) => apiClient.delete(`${ADMIN_ENDPOINTS.menus}/${id}`),
    updatePositions: (menus: NavigationMenuDto[]) =>
      apiClient.put(`${ADMIN_ENDPOINTS.menus}/positions`, menus),
  },

  configurations: {
    getAll: () => apiClient.get<ConfigurationDto[]>(ADMIN_ENDPOINTS.configurations),
    getById: (id: string) => apiClient.get<ConfigurationDto>(`${ADMIN_ENDPOINTS.configurations}/${id}`),
    create: (dto: CreateConfigurationDto) => apiClient.post(ADMIN_ENDPOINTS.configurations, dto),
    update: (id: string, dto: Partial<CreateConfigurationDto>) =>
      apiClient.put(`${ADMIN_ENDPOINTS.configurations}/${id}`, dto),
    delete: (id: string) => apiClient.delete(`${ADMIN_ENDPOINTS.configurations}/${id}`),
  },

  quizzes: {
    getAll: () => apiClient.get<QuizzDto[]>(ADMIN_ENDPOINTS.quizzes),
    getById: (id: string) => apiClient.get<QuizzDto>(`${ADMIN_ENDPOINTS.quizzes}/${id}`),
    create: (dto: CreateQuizzDto) => apiClient.post(ADMIN_ENDPOINTS.quizzes, dto),
    update: (id: string, dto: Partial<CreateQuizzDto>) =>
      apiClient.put(`${ADMIN_ENDPOINTS.quizzes}/${id}`, dto),
    delete: (id: string) => apiClient.delete(`${ADMIN_ENDPOINTS.quizzes}/${id}`),
  },

  logs: {
    getAll: (filters?: Record<string, string>) =>
      apiClient.get<AdminLogDto[]>(ADMIN_ENDPOINTS.logs, { params: filters }),
    getByAdmin: (adminId: string) =>
      apiClient.get<AdminLogDto[]>(`${ADMIN_ENDPOINTS.logs}/administrator/${adminId}`),
    getByEntity: (entityType: string, entityId: string) =>
      apiClient.get<AdminLogDto[]>(`${ADMIN_ENDPOINTS.logs}/entity/${entityType}/${entityId}`),
  },

  sessions: {
    getAll: () => apiClient.get<SessionInfoDto[]>(ADMIN_ENDPOINTS.sessions),
    revoke: (sessionId: string) => apiClient.delete(`${ADMIN_ENDPOINTS.sessions}/${sessionId}`),
    revokeAll: () => apiClient.delete(ADMIN_ENDPOINTS.sessions),
  },
};
