import { createApi } from '@reduxjs/toolkit/query/react';
import { appBaseQuery } from '@/shared/store/base-query';
import {Document} from "../types/document"

export const documentsAPI = createApi({
  reducerPath: 'documentsAPI',
  tagTypes: ['Document'],
  baseQuery: appBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getDocuments: builder.query<Document[], void>({
      query: () => ({
        url: '/documents',
        method: 'GET',
        includeCredentials: true
      }),
    }),
    getDocumentByUUID: builder.query<
      Document,
      { uuid: string  }
    >({
      query: ({uuid}:{uuid : string}) => ({
        url: `/documents/${uuid}`,
        method: 'GET',
        includeCredentials: true
      }),
    }),
    postDocument: builder.query<Document, { file: File; }>({
      query: ({file} : {file : File }) => ({
        url: '/documents',
        method: 'POST',
        body: file,
        includeCredentials: true
      }),
    }),
    deleteDocumentById: builder.query<
      Document,
      { uuid: string; apikey: string }
    >({
      query: ({ uuid }) => ({
        url: `/documents/${uuid}`,
        method: 'DELETE',
        includeCredentials: true
      }),
    }),
    patchDocumentById: builder.query<
      Document,
      { uuid: string; file: File; apikey: string }
    >({
      query: ({ uuid, file }) => ({
        url: `/documents/${uuid}`,
        method: 'PATCH',
        body: file,
        includeCredentials: true
      }),
    }),
  }),
});


export const {
  useGetDocumentsQuery,
  useGetDocumentByUUIDQuery,
  usePostDocumentQuery,
  useDeleteDocumentByIdQuery,
  usePatchDocumentByIdQuery,
} = documentsAPI;