// User type for user directory and authentication
export interface User {
  shortcode: string;
  id: string;
  name: string;
  role: 'Operator' | 'Technician' | 'Employee' | 'Sub Admin' | string;
  status: 'Active' | 'Inactive' | string;
  accessAreas: string[];
  email?: string;
}
