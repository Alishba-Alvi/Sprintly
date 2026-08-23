import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { setCredentials, logout } from '../features/auth/authSlice';

interface AuthResponse {
  accessToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  systemRole: string;
}

interface MeResponse {
  userId: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
}

interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  projectRole: 'lead' | 'member' | 'viewer';
}

export const api = createApi({
  reducerPath: 'api',
  tagTypes: ['Project', 'ProjectMember'],
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getHealth: builder.query<{ status: string }, void>({
      query: () => 'health',
    }),
    register: builder.mutation<User, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: 'auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data: tokens } = await queryFulfilled;

        dispatch(setCredentials({ accessToken: tokens.accessToken }));

        const meResult = await dispatch(api.endpoints.getMe.initiate());
        if ('data' in meResult && meResult.data) {
          dispatch(
            setCredentials({
              accessToken: tokens.accessToken,
              user: {
                id: meResult.data.userId,
                email: meResult.data.email,
                systemRole: meResult.data.role,
                name: '',
              },
            }),
          );
        }
      },
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => 'auth/me',
    }),
    refresh: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: 'auth/refresh',
        method: 'POST',
      }),
    }),
    logoutUser: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(logout());
      },
    }),
    getMyProjects: builder.query<Project[], void>({
      query: () => 'projects',
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<Project, { key: string; name: string; description: string }>({
      query: (body) => ({
        url: 'projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjectMembers: builder.query<ProjectMember[], string>({
      query: (projectId) => `projects/${projectId}/members`,
      providesTags: ['ProjectMember'],
    }),
    addProjectMember: builder.mutation <
      ProjectMember,
      { projectId: string; userId: string; projectRole: string }
    >({
      query: ({ projectId, ...body }) => ({
        url: `projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProjectMember'],
    }),
    removeProjectMember: builder.mutation<void, { projectId: string; userId: string }>({
      query: ({ projectId, userId }) => ({
        url: `projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectMember'],
    }),
    updateMemberRole: builder.mutation <
      ProjectMember,
      { projectId: string; userId: string; projectRole: string }
    >({
      query: ({ projectId, userId, ...body }) => ({
        url: `projects/${projectId}/members/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ProjectMember'],
    }),
    searchUserByEmail: builder.query<User, string>({
      query: (email) => `users/search?email=${encodeURIComponent(email)}`,
    }),
  }),
});

export const {
  useGetHealthQuery,
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useRefreshMutation,
  useLogoutUserMutation,
  useGetMyProjectsQuery,
  useCreateProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useUpdateMemberRoleMutation,
  useLazySearchUserByEmailQuery,
} = api;