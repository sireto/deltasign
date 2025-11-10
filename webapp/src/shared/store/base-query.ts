import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const appBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  mode: "cors",
  prepareHeaders(headers) {
    headers.set("x-client-type", "web");
    return headers;
  },
  credentials: "include",
});
