
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oynlxcazufkhlleyploy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bmx4Y2F6dWZraGxsZXlwbG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NTI5MjEsImV4cCI6MjA1NjIyODkyMX0.oXItduarHPDKLtI4H1o41oJcyEYrdm0y2bQ0pj5GQh8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Car = {
  id: string;
  name: string;
  brand: string;
  year: number;
  pricePerDay: number;
  imageUrl?: string;
  transmission?: string;
  capacity?: number;
  category?: string;
  description?: string;
  features?: string[];
};
