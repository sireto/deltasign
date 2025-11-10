import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "./base-query";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: appBaseQuery,
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getDemoApi: builder.query<string, { name: string }>({
      query: ({ name }) => ({
        url: `/hello/${name}`,
      }),
    }),
  }),
});

export const { useGetDemoApiQuery } = apiSlice;
