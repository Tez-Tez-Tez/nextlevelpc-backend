const CitaServicioService = require('../services/CitaServicioService');
const citaServicioService = require('../services/CitaServicioService');

class CitaServicioController {
    static async create(req, res) {
        try {
            const cita = await citaServicioService.createCita(req.body);
            res.status(201).json({
                success: true,
                message: 'Cita creada exitosamente.',
                data: cita
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear la cita.',
                error: error.message
            });
        }
    }

   static async getAll(req, res) {
        try {
            const citas = await citaServicioService.getAllCitas();
            res.status(200).json({
                success: true,
                data: citas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener las citas.',
                error: error.message
            });
        }
    }

   static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const citaActualizada = await citaServicioService.updateCitaStatus(id, estado);
            res.status(200).json({
                success: true,
                message: 'Estado de la cita actualizado correctamente.',
                data: citaActualizada
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado de la cita.',
                error: error.message
            });
        }
    }

    static async actualizar(req,res){
        try{
        const {id} = req.params;
        await CitaServicioService.actualizar(req.body,id);
        res.status(200).json({message:'Cita actualizada exitosamente'})
        }catch(error){
            console.error('Ocurrio un error al actualizar: ',error.message)
            res.status(500).json({message:'No se pudo actualizar la cita'})
        }
    }

    static async deleteCita(id){
        try{
        const {id} =req.params;
        const cita = await citaServicioService.deleteCita(id);

        res.status(201).json({message:'Cita eliminada exitosamente'})
        }catch(error){
        console.error('Error al eliminar cita: ',error.message)
        res.status(500).json({message:'Ha ocurrido un error al intentar eliminar la cita'})
        }

    }
}

module.exports = CitaServicioController;
