import express from 'express';
import Evento from '../models/evento.js';

const router = express.Router();

// GET /eventos - Obtener todos los eventos con recinto poblado
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find().populate('recinto');
    if (!eventos || eventos.length === 0) {
      return res.status(500).json({ ok: false, error: 'No se han encontrado eventos' });
    }
    return res.status(200).json({ ok: true, resultado: eventos });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'No se han encontrado eventos' });
  }
});

// GET /eventos/localidad/:nombre - Obtener eventos por localidad de recinto y fecha futura/presente
router.get('/localidad/:nombre', async (req, res) => {
  try {
    const eventos = await Evento.find({ fecha: { $gte: new Date() } }).populate('recinto');
    const filtrados = eventos.filter(
      e => e.recinto && (
        e.recinto.localidad === req.params.nombre ||
        e.recinto.localidad.toLowerCase() === req.params.nombre.toLowerCase()
      )
    );
    if (!filtrados || filtrados.length === 0) {
      return res.status(404).json({ ok: false, error: 'No se han encontrado eventos' });
    }
    return res.status(200).json({ ok: true, resultado: filtrados });
  } catch (error) {
    return res.status(404).json({ ok: false, error: 'No se han encontrado eventos' });
  }
});

// GET /eventos/entradas/:idEvento/:tipoEntrada - Obtener precio y disponibles de un tipo de entrada
router.get('/entradas/:idEvento/:tipoEntrada', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.idEvento);
    if (!evento) {
      return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
    }
    const entrada = evento.entradas.find(
      e => e.tipo === req.params.tipoEntrada || e.tipo.toLowerCase() === req.params.tipoEntrada.toLowerCase()
    );
    if (!entrada) {
      return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
    }
    return res.status(200).json({
      ok: true,
      resultado: {
        precio: entrada.precio,
        disponibles: entrada.disponibles
      }
    });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
  }
});

// PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad - Restar cantidad a disponibles de un tipo de entrada
router.put('/entradas/:idEvento/:tipoEntrada/:cantidad', async (req, res) => {
  try {
    const cantidad = Number(req.params.cantidad);
    if (isNaN(cantidad) || cantidad < 0) {
      return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
    }

    const evento = await Evento.findById(req.params.idEvento);
    if (!evento) {
      return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
    }

    const entrada = evento.entradas.find(
      e => e.tipo === req.params.tipoEntrada || e.tipo.toLowerCase() === req.params.tipoEntrada.toLowerCase()
    );
    if (!entrada || entrada.disponibles < cantidad) {
      return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
    }

    entrada.disponibles -= cantidad;
    const eventoActualizado = await evento.save();
    return res.status(200).json({ ok: true, resultado: eventoActualizado });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
  }
});

// GET /eventos/:id - Obtener evento por ID con recinto poblado
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id).populate('recinto');
    if (!evento) {
      return res.status(404).json({ ok: false, error: `Evento ${req.params.id} no encontrado` });
    }
    return res.status(200).json({ ok: true, resultado: evento });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Evento ${req.params.id} no encontrado` });
  }
});

// POST /eventos - Crear nuevo evento
router.post('/', async (req, res) => {
  try {
    const nuevoEvento = new Evento(req.body);
    const guardado = await nuevoEvento.save();
    return res.status(201).json({ ok: true, resultado: guardado });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Error añadiendo evento' });
  }
});

// PUT /eventos/:id - Actualizar evento por ID
router.put('/:id', async (req, res) => {
  try {
    const eventoActualizado = await Evento.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!eventoActualizado) {
      return res.status(404).json({ ok: false, error: `Error actualizando evento ${req.params.id}` });
    }
    return res.status(200).json({ ok: true, resultado: eventoActualizado });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error actualizando evento ${req.params.id}` });
  }
});

// DELETE /eventos/:id - Eliminar evento por ID
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Evento.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ ok: false, error: `Error eliminando evento ${req.params.id}` });
    }
    return res.status(200).json({ ok: true, resultado: eliminado });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error eliminando evento ${req.params.id}` });
  }
});

export default router;
