export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;   // ISO string
  gender: 'male' | 'female';
}