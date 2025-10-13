import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../../src/shared/store/base-query';
import { Contract, PostContractRequest } from '../types/contract';

export const contractsAPI = createApi({
  reducerPath: 'contractsAPI',
  tagTypes: ['Contract'],
  baseQuery: customBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getContracts: builder.query<Contract[], { apikey: string }>({
      query: ({ apikey }) => ({
        url: '/contracts',
        method: 'GET',
        headers: {
          'api-key': apikey,
        },
      }),
    }),
    getContractById: builder.query<Contract, { uuid: string; apikey: string }>({
      query: ({ uuid, apikey }) => ({
        url: `/contracts/${uuid}`,
        method: 'GET',
        headers: {
          'api-key': apikey,
        },
      }),
    }),
    deleteContractById: builder.query<
      Contract,
      { uuid: string; apikey: string }
    >({
      query: ({ uuid, apikey }) => ({
        url: `/contracts/${uuid}`,
        method: 'DELETE',
        headers: {
          'api-key': apikey,
        },
      }),
    }),
    postContract: builder.query<
      Contract,
      { postContractRequest: PostContractRequest; apikey: string }
    >({
      query: ({ postContractRequest, apikey }) => ({
        url: '/contracts',
        method: 'POST',
        headers: {
          'api-key': apikey,
        },
        body: postContractRequest,
      }),
    }),
  }),
});
