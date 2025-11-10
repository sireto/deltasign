import {
  LoginCodeRequestResponse,
  PostLoginCodeRequestResponse,
} from "../../../app/sign-in/types/user-auth";
import { appBaseQuery } from "@/shared/store/base-query";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authAPI = createApi({
  reducerPath: "authAPI",
  tagTypes: ["authenticatedUser"],
  baseQuery: appBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    requestLoginCode: builder.mutation<
      LoginCodeRequestResponse,
      { email: string }
    >({
      query: ({ email }) => ({
        url: `/users/login`,
        method: "GET",
        params: {
          email: email,
        },
      }),
    }),

    postLoginCode: builder.mutation<
      PostLoginCodeRequestResponse,
      { email: string; code: string }
    >({
      query: ({ email, code }) => ({
        url: "/users/login",
        method: "POST",
        params: {
          email,
          login_code: code,
        },
        headers: {
          "x-client-type": "web",
        },
        includeCredentials: true,
      }),
    }),
    logoutUser: builder.mutation<void,null>({
      query: () => ({
        url: "/users/logout",
        method: "POST",
        credentials: "include",
        headers: {
          "x-client-type": "web",
        },
        includeCredentials: true,
      }),
    }),
    getSelfUser: builder.query<User, { apikey: string }>({
      query: ({ apikey }) => ({
        url: "/users/me",
        method: "GET",
        headers: {
          api_key: apikey,
        },
      }),
    }),
  }),
});

// Export hooks
export const {
  useRequestLoginCodeMutation,
  usePostLoginCodeMutation,
  useLogoutUserMutation,
  useGetSelfUserQuery,
} = authAPI;
