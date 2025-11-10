export interface LoginCodeRequestResponse {
  success: boolean;
  errors: string[];
  data: object;
  message: string;
}

export interface PostLoginCodeRequestResponse {
  uuid: string;
  email: string;
  full_name: string;
  api_key: string;
}
