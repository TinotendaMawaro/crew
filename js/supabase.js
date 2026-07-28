/* =====================================================================
   supabase.js - Backend data layer (Supabase)
   Initializes the client and exposes async CRUD helpers for the
   crew registry. Falls back gracefully when the client can't load.
   ===================================================================== */

let supabaseClient = null;
let supabaseReady = false;

function initSupabase() {
    try {
        if (typeof supabase === 'undefined' || !supabase.createClient) {
            console.warn('Supabase client library not available.');
            return false;
        }
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        supabaseReady = true;
        return true;
    } catch (err) {
        console.error('Failed to initialize Supabase:', err);
        supabaseReady = false;
        return false;
    }
}

/* Load all crew records, sorted newest first */
async function fetchCrew() {
    if (!supabaseReady) return [];
    const { data, error } = await supabaseClient
        .from(CREW_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('fetchCrew error:', error);
        renderToast('Could not load crew data.', 'warning');
        return [];
    }
    return data || [];
}

/* Insert a new registration. `record` matches the table columns. */
async function insertCrew(record) {
    if (!supabaseReady) {
        // Offline fallback: keep in local cache only
        registeredCrew.unshift(record);
        return record;
    }
    const { data, error } = await supabaseClient
        .from(CREW_TABLE)
        .insert(record)
        .select()
        .single();

    if (error) {
        console.error('insertCrew error:', error);
        renderToast('Registration failed to save. Please retry.', 'warning');
        throw error;
    }
    return data;
}

/* Check whether an email already exists in the crew registry. */
async function isEmailRegistered(email) {
    if (!supabaseReady) return false;
    const { data, error } = await supabaseClient
        .from(CREW_TABLE)
        .select('id')
        .eq('email', email)
        .limit(1);

    if (error) {
        console.error('isEmailRegistered error:', error);
        return false;
    }
    return (data && data.length > 0) ? true : false;
}

/* Upload a file to the receipts storage bucket and return its public URL. */
async function uploadRegaliaReceipt(file) {
    if (!supabaseReady || !file) return null;
    const ext = file.name.split('.').pop();
    const path = `regalia/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { data, error } = await supabaseClient
        .storage
        .from('receipts')
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('uploadRegaliaReceipt error:', error);
        renderToast('Receipt upload failed. You can still register without it.', 'warning');
        return null;
    }

    const { data: publicData } = supabaseClient
        .storage
        .from('receipts')
        .getPublicUrl(path);

    return publicData ? publicData.publicUrl : null;
}

/* Update a single field on a record by id */
async function updateCrewField(id, field, value) {
    if (!supabaseReady) {
        const row = registeredCrew.find(c => c.id === id);
        if (row) row[field] = value;
        return;
    }
    const patch = {};
    patch[field] = value;
    const { error } = await supabaseClient
        .from(CREW_TABLE)
        .update(patch)
        .eq('id', id);

    if (error) {
        console.error('updateCrewField error:', error);
        renderToast('Update failed to sync.', 'warning');
        throw error;
    }
}

/* Reassign a member's area + section by id */
async function reassignCrew(id, area, section) {
    if (!supabaseReady) {
        const row = registeredCrew.find(c => c.id === id);
        if (row) { row.area = area; row.section = section; }
        return;
    }
    const { error } = await supabaseClient
        .from(CREW_TABLE)
        .update({ area, section })
        .eq('id', id);

    if (error) {
        console.error('reassignCrew error:', error);
        renderToast('Reassignment failed to sync.', 'warning');
        throw error;
    }
}

/* Delete a record by id */
async function deleteCrew(id) {
    if (!supabaseReady) {
        registeredCrew = registeredCrew.filter(c => c.id !== id);
        return;
    }
    const { error } = await supabaseClient
        .from(CREW_TABLE)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteCrew error:', error);
        renderToast('Could not dismiss record.', 'warning');
        throw error;
    }
}
