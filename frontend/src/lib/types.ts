import { RequestCategory, RequestStatus } from "./admin-requests";

export interface RequestDetail {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  message: string;
  status: RequestStatus;
  ai_category: RequestCategory | null;
  ai_confidence: number | null;
  classifier_source: string | null;
  final_category: RequestCategory | null;
  human_corrected_flag: boolean;
}
