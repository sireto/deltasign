import {
  LoginCodeRequestResponse,
  PostLoginCodeRequestResponse,
} from '../../src/app/sign-in/types/user-auth';
import { customBaseQuery } from '../../src/shared/store/base-query';
import { createApi } from '@reduxjs/toolkit/query/react';

export const usersAPI = createApi({
  reducerPath: 'usersAPI',
  tagTypes: ['User'],
  baseQuery: customBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getSelfUser: builder.query<User, { apikey: string }>({
      query: ({ apikey }) => ({
        url: '/users/me',
        method: 'GET',
        headers: {
          api_key: apikey,
        },
      }),
    }),
    getUsers: builder.query<getUsersRequestResponse, void>({
      query: () => ({
        url: '/users',
      }),
    }),
    getUser: builder.query<User, { uuid: string }>({
      query: ({ uuid }) => ({
        url: `/users/${uuid}`,
      }),
    }),
  }),
});

export const { useGetSelfUserQuery } = usersAPI;
