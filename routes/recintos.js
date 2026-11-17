import express from 'express';
import Recinto from '../models/recinto.js';

const router = express.Router();

// GET /recintos - Obtener todos los recintos
router.get('/', async (req, res) => {
  try {
    const recintos = await Recinto.find();
    if (!recintos || recintos.length === 0) {
      return res.status(500).json({ ok: false, error: 'No se han encontrado recintos' });
    }
    return res.status(200).json({ ok: true, resultado: recintos });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'No se han encontrado recintos' });
  }
});

// GET /recintos/localidad/:nombre - Obtener recintos por localidad
router.get('/localidad/:nombre', async (req, res) => {
  try {
    let recintos = await Recinto.find({ localidad: req.params.nombre });
    if (!recintos || recintos.length === 0) {
      recintos = await Recinto.find({
        localidad: new RegExp(`^${req.params.nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
    }
    if (!recintos || recintos.length === 0) {
      return res.status(404).json({ ok: false, error: 'No se han encontrado recintos de la localidad indicada' });
    }
    return res.status(200).json({ ok: true, resultado: recintos });
  } catch (error) {
    return res.status(404).json({ ok: false, error: 'No se han encontrado recintos de la localidad indicada' });
  }
});

// GET /recintos/:id - Obtener recinto por ID
router.get('/:id', async (req, res) => {
  try {
    const recinto = await Recinto.findById(req.params.id);
    if (!recinto) {
      return res.status(404).json({ ok: false, error: `Recinto ${req.params.id} no encontrado` });
    }
    return res.status(200).json({ ok: true, resultado: recinto });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Recinto ${req.params.id} no encontrado` });
  }
});

// POST /recintos - Crear nuevo recinto
router.post('/', async (req, res) => {
  try {
    const nuevoRecinto = new Recinto(req.body);
    const guardado = await nuevoRecinto.save();
    return res.status(201).json({ ok: true, resultado: guardado });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Error añadiendo recinto' });
  }
});

// DELETE /recintos/:id - Eliminar recinto por ID
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Recinto.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ ok: false, error: `Error eliminando recinto ${req.params.id}` });
    }
    return res.status(200).json({ ok: true, resultado: eliminado });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error eliminando recinto ${req.params.id}` });
  }
});

export default router;
