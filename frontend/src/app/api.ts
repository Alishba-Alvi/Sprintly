import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'
import { setCredentials, logout } from '../features/auth/authSlice'

interface AuthResponse {
  accessToken: string
}

interface User {
  id: string
  name: string
  email: string
  systemRole: string
  isVerified: boolean
}

interface MeResponse {
  userId: string
  email: string
  role: string
  name: string
}

interface Project {
  id: string
  key: string
  name: string
  description: string | null
  isArchived: boolean
  createdAt: string
}

interface ProjectMember {
  id: string
  projectId: string
  userId: string
  projectRole: 'lead' | 'member' | 'viewer'
  user: {
    name: string
    email: string
  }
}

export interface Label {
  id: string
  projectId: string
  name: string
  createdAt: string
}

export interface Issue {
  id: string
  projectId: string
  number: number
  key: string
  title: string
  description: string | null
  type: 'task' | 'bug' | 'story' | 'epic'
  status: 'to_do' | 'in_progress' | 'in_review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporterId: string | null
  assigneeId: string | null
  epicId: string | null
  labels?: Label[]
  createdAt: string
  updatedAt: string
}

interface IssueListResponse {
  data: Issue[]
  total: number
  page: number
  limit: number
}

interface ListIssuesParams {
  projectId: string
  status?: string
  type?: string
  priority?: string
  search?: string
  assigneeId?: string
  epicId?: string
  labelId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

interface CreateIssueBody {
  title: string
  description?: string
  type: string
  priority: string
  epicId?: string
  labelIds?: string[]
}

interface UpdateIssueBody {
  title?: string
  description?: string
  type?: string
  priority?: string
  assigneeId?: string | null
  epicId?: string | null
  labelIds?: string[]
}

// ============ Phase 5 — Comments & Activity ============

export interface Comment {
  id: string
  issueId: string
  authorId: string | null
  body: string
  createdAt: string
  updatedAt: string
}

interface CommentListResponse {
  data: Comment[]
  total: number
  page: number
  limit: number
}

interface ListCommentsParams {
  projectId: string
  issueId: string
  page?: number
  limit?: number
}

export type ActivityAction = 'created' | 'status_changed' | 'assigned'

export interface ActivityLogEntry {
  id: string
  issueId: string
  actorId: string | null
  action: ActivityAction
  fromValue: string | null
  toValue: string | null
  createdAt: string
}

interface ActivityListResponse {
  data: ActivityLogEntry[]
  total: number
  page: number
  limit: number
}

interface ListActivityParams {
  projectId: string
  issueId: string
  page?: number
  limit?: number
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

let refreshPromise: ReturnType<typeof rawBaseQuery> | null = null

const isRefreshRequest = (args: string | FetchArgs): boolean => {
  const url = typeof args === 'string' ? args : args.url
  return url.includes('auth/refresh')
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, queryApi, extraOptions) => {
  let result = await rawBaseQuery(args, queryApi, extraOptions)

  if (result.error?.status !== 401 || isRefreshRequest(args)) {
    return result
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await rawBaseQuery(
          { url: 'auth/refresh', method: 'POST' },
          queryApi,
          extraOptions,
        )
      } finally {
        refreshPromise = null
      }
    })()
  }

  const refreshResult = await refreshPromise

  if (refreshResult?.data) {
    const { accessToken } = refreshResult.data as { accessToken: string }
    queryApi.dispatch(setCredentials({ accessToken }))

    const meResult = await queryApi.dispatch(api.endpoints.getMe.initiate())
    if ('data' in meResult && meResult.data) {
      queryApi.dispatch(
        setCredentials({
          accessToken,
          user: {
            id: meResult.data.userId,
            email: meResult.data.email,
            systemRole: meResult.data.role,
            name: meResult.data.name,
          },
        }),
      )
    }

    result = await rawBaseQuery(args, queryApi, extraOptions)
  } else {
    queryApi.dispatch(logout())
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  tagTypes: ['Project', 'ProjectMember', 'Issue', 'Label', 'Comment', 'Activity'],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getHealth: builder.query<{ status: string }, void>({
      query: () => 'health',
    }),
    register: builder.mutation<
      User,
      { name: string; email: string; password: string }
    >({
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
        const { data: tokens } = await queryFulfilled

        dispatch(setCredentials({ accessToken: tokens.accessToken }))

        const meResult = await dispatch(api.endpoints.getMe.initiate())
        if ('data' in meResult && meResult.data) {
          dispatch(
            setCredentials({
              accessToken: tokens.accessToken,
              user: {
                id: meResult.data.userId,
                email: meResult.data.email,
                systemRole: meResult.data.role,
                name: meResult.data.name,
              },
            }),
          )
        }
      },
    }),
    verifyEmail: builder.mutation<{ verified: boolean }, string>({
      query: (token) => ({
        url: 'auth/verify-email',
        method: 'POST',
        body: { token },
      }),
    }),
    resendVerification: builder.mutation<{ sent: boolean }, string>({
      query: (email) => ({
        url: 'auth/resend-verification',
        method: 'POST',
        body: { email },
      }),
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
        await queryFulfilled
        dispatch(logout())
      },
    }),
    getMyProjects: builder.query<Project[], void>({
      query: () => 'projects',
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<
      Project,
      { key: string; name: string; description: string }
    >({
      query: (body) => ({
        url: 'projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<
      Project,
      { projectId: string; name?: string; description?: string }
    >({
      query: ({ projectId, ...body }) => ({
        url: `projects/${projectId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjectMembers: builder.query<ProjectMember[], string>({
      query: (projectId) => `projects/${projectId}/members`,
      providesTags: ['ProjectMember'],
    }),
    addProjectMember: builder.mutation<
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
    removeProjectMember: builder.mutation<
      void,
      { projectId: string; userId: string }
    >({
      query: ({ projectId, userId }) => ({
        url: `projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectMember'],
    }),
    updateMemberRole: builder.mutation<
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

    listIssues: builder.query<IssueListResponse, ListIssuesParams>({
      query: ({ projectId, ...params }) => {
        const query = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            query.set(key, String(value))
          }
        })
        const qs = query.toString()
        return `projects/${projectId}/issues${qs ? `?${qs}` : ''}`
      },
      providesTags: ['Issue'],
    }),
    getIssue: builder.query<Issue, { projectId: string; issueId: string }>({
      query: ({ projectId, issueId }) =>
        `projects/${projectId}/issues/${issueId}`,
      providesTags: ['Issue'],
    }),
    createIssue: builder.mutation<
      Issue,
      { projectId: string; body: CreateIssueBody }
    >({
      query: ({ projectId, body }) => ({
        url: `projects/${projectId}/issues`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Issue'],
    }),
    updateIssue: builder.mutation<
      Issue,
      { projectId: string; issueId: string; body: UpdateIssueBody }
    >({
      query: ({ projectId, issueId, body }) => ({
        url: `projects/${projectId}/issues/${issueId}`,
        method: 'PATCH',
        body,
      }),
      // Assignee changes (and any other field edit) can produce a new
      // ActivityLog row on the backend (e.g. 'assigned'), so the feed
      // needs to refetch alongside the issue itself.
      invalidatesTags: ['Issue', 'Activity'],
    }),
    transitionIssue: builder.mutation<
      Issue,
      { projectId: string; issueId: string; status: Issue['status'] }
    >({
      query: ({ projectId, issueId, status }) => ({
        url: `projects/${projectId}/issues/${issueId}/transition`,
        method: 'PATCH',
        body: { status },
      }),
      // Every transition writes a 'status_changed' ActivityLog row.
      invalidatesTags: ['Issue', 'Activity'],
    }),
    deleteIssue: builder.mutation<void, { projectId: string; issueId: string }>(
      {
        query: ({ projectId, issueId }) => ({
          url: `projects/${projectId}/issues/${issueId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Issue'],
      },
    ),

    getLabels: builder.query<Label[], string>({
      query: (projectId) => `projects/${projectId}/labels`,
      providesTags: ['Label'],
    }),
    createLabel: builder.mutation<Label, { projectId: string; name: string }>({
      query: ({ projectId, name }) => ({
        url: `projects/${projectId}/labels`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: ['Label'],
    }),
    deleteLabel: builder.mutation<void, { projectId: string; labelId: string }>(
      {
        query: ({ projectId, labelId }) => ({
          url: `projects/${projectId}/labels/${labelId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Label', 'Issue'],
      },
    ),

    // ============ Phase 5 — Comments ============
    // NOTE: route paths below follow the existing nested-resource
    // convention (projects/:projectId/issues/:issueId/...). Adjust the
    // `query` url strings if your actual backend routes differ.
    listComments: builder.query<CommentListResponse, ListCommentsParams>({
      query: ({ projectId, issueId, page, limit }) => {
        const query = new URLSearchParams()
        if (page !== undefined) query.set('page', String(page))
        if (limit !== undefined) query.set('limit', String(limit))
        const qs = query.toString()
        return `projects/${projectId}/issues/${issueId}/comments${qs ? `?${qs}` : ''}`
      },
      providesTags: ['Comment'],
    }),
    createComment: builder.mutation<
      Comment,
      { projectId: string; issueId: string; body: string }
    >({
      query: ({ projectId, issueId, body }) => ({
        url: `projects/${projectId}/issues/${issueId}/comments`,
        method: 'POST',
        body: { body },
      }),
      invalidatesTags: ['Comment'],
    }),
    updateComment: builder.mutation<
      Comment,
      { projectId: string; issueId: string; commentId: string; body: string }
    >({
      query: ({ projectId, issueId, commentId, body }) => ({
        url: `projects/${projectId}/issues/${issueId}/comments/${commentId}`,
        method: 'PATCH',
        body: { body },
      }),
      invalidatesTags: ['Comment'],
    }),
    deleteComment: builder.mutation<
      void,
      { projectId: string; issueId: string; commentId: string }
    >({
      query: ({ projectId, issueId, commentId }) => ({
        url: `projects/${projectId}/issues/${issueId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comment'],
    }),

    // ============ Phase 5 — Activity ============
    listActivity: builder.query<ActivityListResponse, ListActivityParams>({
      query: ({ projectId, issueId, page, limit }) => {
        const query = new URLSearchParams()
        if (page !== undefined) query.set('page', String(page))
        if (limit !== undefined) query.set('limit', String(limit))
        const qs = query.toString()
        return `projects/${projectId}/issues/${issueId}/activity${qs ? `?${qs}` : ''}`
      },
      providesTags: ['Activity'],
    }),
  }),
})

export const {
  useGetHealthQuery,
  useRegisterMutation,
  useLoginMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetMeQuery,
  useRefreshMutation,
  useLogoutUserMutation,
  useGetMyProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useUpdateMemberRoleMutation,
  useLazySearchUserByEmailQuery,
  useListIssuesQuery,
  useGetIssueQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
  useTransitionIssueMutation,
  useDeleteIssueMutation,
  useGetLabelsQuery,
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useListCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useListActivityQuery,
} = api
