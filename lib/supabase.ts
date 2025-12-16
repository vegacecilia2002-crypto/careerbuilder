import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sktqhevacrjvxdwdevyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdHFoZXZhY3Jqdnhkd2Rldnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjMzMDksImV4cCI6MjA4MTQzOTMwOX0.nrZwbp70DfMc9SESGhYOdgG-17smV5p8ChU0GdFD46I';

export const supabase = createClient(supabaseUrl, supabaseKey);