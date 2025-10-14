export interface Document {
  uuid: string;
  filename: string;
  file_hash: string;
  s3_url: string;
  properties: string;
  created_date: string;
  updated_date: string;
  owner_uuid: string;
}
