import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "@/shared/store/base-query";
import { Document } from "../types/document";

export const documentsAPI = createApi({
  reducerPath: "documentsAPI",
  tagTypes: ["Document"],
  baseQuery: appBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    // ✅ GET all documents
    getDocuments: builder.query<Document[], void>({
      query: () => ({
        url: "/documents",
        method: "GET",
        credentials: "include"
      }),
      providesTags: ["Document"],
    }),

    // ✅ GET one document
    getDocumentByUUID: builder.query<Document, { uuid: string }>({
      query: ({ uuid }) => ({
        url: `/documents/${uuid}`,
        method: "GET",
        credentials: "include"
      }),
      providesTags: ["Document"],
    }),

    // ✅ POST (upload) a new document
    postDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: "/documents",
        method: "POST",
        body: formData,
        credentials : "include"
      }),
    }),

    // ✅ DELETE
    deleteDocumentById: builder.mutation<Document, { uuid: string }>({
      query: ({ uuid }) => ({
        url: `/documents/${uuid}`,
        method: "DELETE",
        credentials : "include"
      }),
      invalidatesTags: ["Document"],
    }),

    // ✅ PATCH (update)
    patchDocumentById: builder.mutation<Document, { uuid: string; file: File }>(
      {
        query: ({ uuid, file }) => {
          const formData = new FormData();
          formData.append("file", file);
          return {
            url: `/documents/${uuid}`,
            method: "PATCH",
            body: formData,
            credentials: "include"
          };
        },
        invalidatesTags: ["Document"],
      },
    ),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentByUUIDQuery,
  usePostDocumentMutation,
  useDeleteDocumentByIdMutation,
  usePatchDocumentByIdMutation,
} = documentsAPI;
