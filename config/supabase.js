const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Cliente Supabase para operaciones públicas
const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente Supabase para operaciones con permisos de administrador
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Probar conexión
const testConnection = async () => {
    try {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select('count', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        console.log('> Conexión a Supabase PostgreSQL establecida correctamente');
        console.log('> Base de datos:', supabaseUrl);
        return true;
    } catch (error) {
        console.error('> Error conectando a Supabase PostgreSQL:', error.message);
        console.log('- Configuración usada:');
        console.log('   URL:', supabaseUrl);
        console.log('   Verifica que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas en .env');
        return false;
    }
};

// Función para ejecutar SQL directo (con parámetros)
const executeSQL = async (sql, params = []) => {
    try {
        // Reemplazar ? con $1, $2, etc para PostgreSQL
        let query = sql;
        params.forEach((param, index) => {
            query = query.replace('?', `$${index + 1}`);
        });

        const { data, error } = await supabaseAdmin.rpc('exec_sql', {
            query,
            params
        });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error en SQL directo:', error.message);
        throw error;
    }
};

// Función para ejecutar consultas con manejo de errores (API Supabase)
const executeQuery = async (table, operation = 'select', data = null, filters = null) => {
    try {
        let query = supabaseAdmin.from(table);

        switch (operation) {
            case 'select':
                query = query.select(filters?.select || '*');
                if (filters?.eq) {
                    Object.entries(filters.eq).forEach(([key, value]) => {
                        query = query.eq(key, value);
                    });
                }
                if (filters?.limit) {
                    query = query.limit(filters.limit);
                }
                if (filters?.order) {
                    query = query.order(filters.order.column, { ascending: filters.order.ascending !== false });
                }
                break;

            case 'insert':
                query = query.insert(data).select();
                break;

            case 'update':
                query = query.update(data);
                if (filters?.eq) {
                    Object.entries(filters.eq).forEach(([key, value]) => {
                        query = query.eq(key, value);
                    });
                }
                query = query.select();
                break;

            case 'delete':
                if (filters?.eq) {
                    Object.entries(filters.eq).forEach(([key, value]) => {
                        query = query.eq(key, value);
                    });
                }
                query = query.delete();
                break;

            default:
                throw new Error(`Operación no soportada: ${operation}`);
        }

        const { data: result, error } = await query;

        if (error) {
            throw error;
        }

        return result;
    } catch (error) {
        console.error('Error en consulta Supabase:', error.message);
        throw error;
    }
};

// Función para obtener una conexión (compatibilidad con MySQL)
const db = {
    execute: async (sql, params = []) => {
        try {
            // Convertir ? de MySQL a $1, $2, etc de PostgreSQL
            let query = sql;
            params.forEach((param, index) => {
                query = query.replace('?', `$${index + 1}`);
            });

            // Ejecutar con rpc
            const { data, error } = await supabaseAdmin.rpc('exec_sql', {
                query,
                params
            });

            if (error) {
                throw error;
            }

            // Retornar en formato compatible [rows]
            return [Array.isArray(data) ? data : [data]];
        } catch (error) {
            console.error('Error en db.execute:', error.message);
            throw error;
        }
    }
};

const getConnection = async () => {
    return db;
};

module.exports = {
    supabase,
    supabaseAdmin,
    testConnection,
    executeQuery,
    getConnection,
    db,
    query: executeQuery
};
