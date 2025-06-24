

interface UserTypes {
  id: string;
  name: string;
  role: 'admin' | 'user'; // Explicitly define the enum values
  email: string; // Added from your Sequelize model
  last_name?: string;
  employee_id?: string;
  department?: string;
  position?: string;
  profile_pic?: string;
  gender?: 'male' | 'female' | 'others';
  is_active?: boolean;
  password?: string;
  confirm_password?: string;
  location?: string;
}




export type {UserTypes };
