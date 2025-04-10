import { createClient } from '@supabase/supabase-js'

// Supabase URL and API Key
const supabaseUrl = 'https://icwdsquxuctpzbalebsj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljd2RzcXV4dWN0cHpiYWxlYnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MTk4NDksImV4cCI6MjA1OTI5NTg0OX0.dgJVvqSfCjhV466Dl4qLZrnLK557_e5aVwuxPsjYawc'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)