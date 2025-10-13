import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../../src/shared/store/base-query';
import { Document } from '../types/document';

export const documentsAPI = createApi({
  reducerPath: 'documentsAPI',
  tagTypes: ['Document'],
  baseQuery: customBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getDocuments: builder.query<Document[], { apikey: string }>({
      query: ({ apikey }) => ({
        url: '/documents',
        method: 'GET',
        headers: {
          'api-key': apikey,
        },
      }),
    }),
    getDocumentByUUID: builder.query<
      Document,
      { uuid: string; apikey: string }
    >({
      query: ({ uuid, apikey }) => ({
        url: `/documents/${uuid}`,
        method: 'GET',
        headers: {
          'api-key': apikey,
        },
      }),
    }),
    postDocument: builder.query<Document, { file: File; apikey: string }>({
      query: ({ file, apikey }) => ({
        url: '/documents',
        method: 'POST',
        headers: {
          'api-key': apikey,
        },
        body: file,
      }),
    }),
    deleteDocumentById: builder.query<
      Document,
      { uuid: string; apikey: string }
    >({
      query: ({ uuid, apikey }) => ({
        url: `/documents/${uuid}`,
        method: 'DELETE',
        headers: {
          'api-key': apikey,
        },
      }),
    }),
    patchDocumentById: builder.query<
      Document,
      { uuid: string; file: File; apikey: string }
    >({
      query: ({ uuid, file, apikey }) => ({
        url: `/documents/${uuid}`,
        method: 'PATCH',
        headers: {
          'api-key': apikey,
        },
        body: file,
      }),
    }),
  }),
});
