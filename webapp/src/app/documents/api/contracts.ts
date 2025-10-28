import { createApi } from '@reduxjs/toolkit/query/react';
import { appBaseQuery } from '@/shared/store/base-query';
import { Contract, PostContractRequest } from '../types/contract';

export enum ContractStatus {
  DRAFT = "draft",
  FULLY_SIGNED = "fully signed",
  PENDING = "pending"
}

export const contractsAPI = createApi({
  reducerPath: 'contractsAPI',
  tagTypes: ['Contract'],
  baseQuery: appBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getContracts: builder.query<Contract[] , ContractStatus | void>({
      query: (status) => ({
        url: 'users/self/contracts',
        method: 'GET',
        params: status ? { status } : undefined,
        includeCredentials: true
      }),
    }),
    getContractById: builder.query<Contract, { uuid : string}>({
      query: ({ uuid }) => ({
        url: `/contracts/${uuid}`,
        method: 'GET',
        includeCredentials: true
      }),
    }),
    deleteContractById: builder.query<
      Contract,
      { uuid: string }
    >({
      query: ({ uuid}) => ({
        url: `/contracts/${uuid}`,
        method: 'DELETE',
        includeCredentials: true
      }),
    }),
    postContract: builder.query<
      Contract,
      { postContractRequest: PostContractRequest; apikey: string }
    >({
      query: ({ postContractRequest }) => ({
        url: '/contracts',
        method: 'POST',
        includeCredentials: true,
        body: postContractRequest,
      }),
    }),
  }),
});

export const {
  useGetContractsQuery,
  useGetContractByIdQuery,
  useDeleteContractByIdQuery,
  usePostContractQuery,
} = contractsAPI;