
const servicioService = require('../services/servicioService');

class ServicioController {

   static async getAllServicios(req, res) {
        try {
            const servicios = await servicioService.getAllServicios();
            res.json({
                success: true,
                data: servicios,
                count: servicios.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


   static async getServiciosByTipo(req, res) {
        try {
            const { tipo } = req.params;
            const servicios = await servicioService.getServiciosByTipo(tipo);

            res.json({
                success: true,
                data: servicios,
                count: servicios.length
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }


   static async getServicioById(req, res) {
        try {
            const { id } = req.params;
            const servicio = await servicioService.getServicioById(id);

            res.json({
                success: true,
                data: servicio
            });
        } catch (error) {
            if (error.message === 'Servicio no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


  static  async createServicio(req, res) {
        try {
            const servicioData = req.body;


            if (!servicioData.nombre || !servicioData.precio) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y precio son campos requeridos'
                });
            }

            const nuevoServicio = await servicioService.createServicio(servicioData);

            res.status(201).json({
                success: true,
                message: 'Servicio creado correctamente',
                data: nuevoServicio
            });
        } catch (error) {
            if (error.message.includes('Ya existe') || error.message.includes('inválido')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


   static async updateServicio(req, res) {
        try {
            const { id } = req.params;
            const servicioData = req.body;

            const servicioActualizado = await servicioService.updateServicio(id, servicioData);

            res.json({
                success: true,
                message: 'Servicio actualizado correctamente',
                data: servicioActualizado
            });
        } catch (error) {
            if (error.message === 'Servicio no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('Ya existe') || error.message.includes('inválido')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


   static async deleteServicio(req, res) {
        try {
            const { id } = req.params;
            const result = await servicioService.deleteServicio(id);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Servicio no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ServicioController;