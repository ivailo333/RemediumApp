import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hmmeqodrkycmlgdfmdrn.supabase.co';
const supabaseKey = 'sb_publishable_E6w1_bDKnXJ73EfH3Yu2cg_Nt95XdGB';

export const supabase = createClient(supabaseUrl, supabaseKey);
