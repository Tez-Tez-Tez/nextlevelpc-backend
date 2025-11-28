// Para compatibilidad, importar desde supabase.js
// Se mantiene este archivo pero ahora redirige a supabase.js
const {
    supabase,
    supabaseAdmin,
    testConnection,
    executeQuery,
    executeSQL,
    getConnection,
    db
} = require('./supabase');

// Exportar también como query para compatibilidad
module.exports = {
    supabase,
    supabaseAdmin,
    db,
    testConnection,
    executeQuery,
    executeSQL,
    getConnection,
    query: executeQuery
};