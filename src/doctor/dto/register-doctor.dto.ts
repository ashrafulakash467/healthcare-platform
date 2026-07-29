export class RegisterDoctorDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  specialty?: string;
  qualifications?: string[] | string;
  experienceYears?: number | string;
  licenseNumber?: string;
  licenseIssuedBy?: string;
  profileSummary?: string;
  location?: string;
  gender?: string;
  imageUrl?: string;
}
