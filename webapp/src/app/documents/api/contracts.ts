import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "@/shared/store/base-query";
import {
  Contract,
  CountractsCountResponse,
  PatchContractRequest,
  PostContractRequest,
} from "../types/contract";

export enum ContractStatus {
  DRAFT = "draft",
  FULLY_SIGNED = "fully signed",
  PENDING = "pending",
}

export const contractsAPI = createApi({
  reducerPath: "contractsAPI",
  tagTypes: ["Contract" , "Contract Count"],
  baseQuery: appBaseQuery,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getContracts: builder.query<Contract[], ContractStatus | void>({
      query: (status) => ({
        url: "users/self/contracts",
        method: "GET",
        params: status ? { status } : undefined,
        credentials: "include",
      }),
      providesTags: ["Contract"],
    }),

    getContractById: builder.query<Contract, { uuid: string }>({
      query: ({ uuid }) => ({
        url: `/contracts/${uuid}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Contract"],
    }),

    deleteContractById: builder.mutation<void, { uuid: string }>({
      query: ({ uuid }) => ({
        url: `/contracts/${uuid}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Contract"],
    }),

    postContract: builder.mutation<
      Contract,
      { postContractRequest: PostContractRequest; apikey: string }
    >({
      query: ({ postContractRequest }) => ({
        url: "/contracts",
        method: "POST",
        credentials: "include",
        body: postContractRequest,
      }),
      invalidatesTags: ["Contract"],
    }),
    patchContract: builder.mutation<
      Contract,
      {
        uuid: string;
        patchContractRequest: PatchContractRequest;
        alert_users: boolean;
      }
    >({
      query: ({ uuid, patchContractRequest, alert_users }) => ({
        url: `/contracts/${uuid}`,
        method: "PATCH",
        credentials: "include",
        body: patchContractRequest,
        headers: {
          "alert-users": String(alert_users),
        },
      }),
      invalidatesTags: ["Contract"],
    }),
    signContract: builder.mutation<
      string,
      {
        uuid: string;
        formData: FormData;
      }
    >({
      query: ({ uuid, formData }) => ({
        url: `/contracts/${uuid}/sign`,
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Contract"],
    }),
    getContractsCount : builder.query<CountractsCountResponse , void>({
       query: () => ({
        url: "users/self/contracts/count",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Contract","Contract Count"],
    })
  }),
});

export const {
  useGetContractsQuery,
  useGetContractByIdQuery,
  useDeleteContractByIdMutation,
  usePostContractMutation,
  usePatchContractMutation,
  useSignContractMutation,
  useGetContractsCountQuery
} = contractsAPI;
