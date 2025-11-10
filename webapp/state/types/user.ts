interface User {
  uuid: string;
  email: string;
  full_name: string;
}

interface getUsersRequestResponse {
  success: boolean;
  errors: string[];
  data: User[];
  message: string;
}
