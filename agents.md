# Reglas de arquitectura y estilo para la API REST de Eventos y Recintos

## 1. Descripción del proyecto

API RESTful construida con Node.js, Express y Mongoose para gestionar eventos, sus tipos de entradas disponibles y los recintos donde se celebran. Preparada para despliegue en Render conectada a MongoDB Atlas.

## 2. Estructura de carpetas obligatoria

Todo el código fuente debe seguir estrictamente esta estructura (ESTÁ PROHIBIDO crear carpetas adicionales como `controllers/` o `services/`):

- `models/`
  - `recinto.js` (Esquema y modelo de Recintos)
  - `evento.js` (Esquema de subdocumento Entradas, esquema y modelo de Eventos)
- `routes/`
  - `recintos.js` (Enrutador y lógica de endpoints de recintos)
  - `eventos.js` (Enrutador y lógica de endpoints de eventos y entradas)
- `index.js` (Punto de entrada de la aplicación: conexión a BD, middlewares, montaje de rutas y arranque del servidor)

## 3. Modelos de datos (Mongoose)

Respetar estrictamente el nombre de cada campo (mayúsculas y minúsculas).

### 3.1. Modelo Recinto (`models/recinto.js`)
Modelo exportado para la colección `recintos`:
- **nombre**: `String`, obligatorio (`required`), longitud mínima `5` (`minlength: 5`).
- **direccion**: `String`, obligatorio (`required`), longitud mínima `10` (`minlength: 10`).
- **localidad**: `String`, obligatorio (`required`), longitud mínima `3` (`minlength: 3`).
- **aforoMaximo**: `Number`, opcional.

### 3.2. Modelo Evento y Subdocumento Entrada (`models/evento.js`)
Definir primero el subesquema `entradaSchema`:
- **tipo**: `String`, obligatorio (`required`), longitud mínima `3` (`minlength: 3`).
- **precio**: `Number`, obligatorio (`required`), valor mínimo `0` (`min: 0`).
- **disponibles**: `Number`, entero y positivo (valor mínimo `0`, `min: 0`), obligatorio (`required`).

Definir el esquema principal y exportar el modelo para la colección `eventos`:
- **nombre**: `String`, obligatorio (`required`), longitud mínima `5` (`minlength: 5`).
- **fecha**: `Date`, obligatorio (`required`).
- **recinto**: `mongoose.Schema.Types.ObjectId`, referencia al modelo `'recintos'` (`ref: 'recintos'`), obligatorio (`required`).
- **entradas**: Array de subdocumentos `[entradaSchema]`.

## 4. Estilo de código y convenciones estrictas

- **Módulos**: Utilizar exclusivamente **ES Modules** (`import` / `export`) en todo el proyecto (incluir `.js` en las importaciones de archivos propios y `"type": "module"` en `package.json`). Prohibido usar `require()`.
- **Asincronía**: Utilizar exclusivamente `async / await` con bloques `try / catch` en todos los endpoints para mantener el código homogéneo.
- **Formato de respuesta JSON obligatorio**:
  - **Todas** las respuestas deben incluir la propiedad booleana `ok` (`true` si es éxito 200/201, `false` si es error 400/404/500).
  - En caso de éxito: `{ ok: true, resultado: <datos> }`.
  - En caso de error: `{ ok: false, error: "<mensaje exacto especificado>" }`.
- **Servidor principal (`index.js`)**: Conectar a MongoDB (usando variable de entorno o URI), configurar `express.json()`, montar `/recintos` y `/eventos`, y escuchar en `process.env.PORT || 3000`.

## 5. Endpoints requeridos y respuestas exactas

*(Nota: Las rutas específicas como `/localidad/:nombre` o `/entradas/...` deben declararse ANTES de `/:id` para evitar conflictos de enrutamiento en Express).*

### 5.1. Rutas de Recintos (`routes/recintos.js`)
- **`GET /recintos`**:
  - Éxito (si hay al menos 1): `200` -> `{ ok: true, resultado: [...] }`
  - Vacío (0 elementos) o error: `500` -> `{ ok: false, error: "No se han encontrado recintos" }`
- **`GET /recintos/localidad/:nombre`**:
  - Éxito (si hay al menos 1 en esa localidad): `200` -> `{ ok: true, resultado: [...] }`
  - Vacío o error: `404` -> `{ ok: false, error: "No se han encontrado recintos de la localidad indicada" }`
- **`GET /recintos/:id`**:
  - Éxito: `200` -> `{ ok: true, resultado: { ... } }`
  - No encontrado (`null`) o error de formato ID: `404` -> `{ ok: false, error: "Recinto <id> no encontrado" }`
- **`POST /recintos`**:
  - Éxito: `201` -> `{ ok: true, resultado: { ... } }`
  - Error: `500` -> `{ ok: false, error: "Error añadiendo recinto" }`
- **`DELETE /recintos/:id`**:
  - Éxito: `200` -> `{ ok: true, resultado: { ... } }`
  - No encontrado (`null`) o error: `404` -> `{ ok: false, error: "Error eliminando recinto <id>" }`

### 5.2. Rutas de Eventos y Entradas (`routes/eventos.js`)
- **`GET /eventos`**:
  - Usar `.populate('recinto')`.
  - Éxito (si hay al menos 1): `200` -> `{ ok: true, resultado: [...] }`
  - Vacío o error: `500` -> `{ ok: false, error: "No se han encontrado eventos" }`
- **`GET /eventos/localidad/:nombre`**:
  - Filtra eventos cuya localidad del recinto coincida con `:nombre` Y cuya `fecha` sea posterior/igual a la fecha actual (`fecha >= new Date()`). Usar `.populate('recinto')`.
  - Éxito (si hay al menos 1): `200` -> `{ ok: true, resultado: [...] }`
  - Vacío o error: `404` -> `{ ok: false, error: "No se han encontrado eventos" }`
- **`GET /eventos/entradas/:idEvento/:tipoEntrada`**:
  - Busca el evento y localiza el subdocumento que coincida con `tipoEntrada`.
  - Éxito: `200` -> `{ ok: true, resultado: { precio: <num>, disponibles: <num> } }`
  - No encontrado o error: `404` -> `{ ok: false, error: "Error obteniendo datos de entrada para evento <idEvento>" }`
- **`PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad`**:
  - Resta `:cantidad` (convertido a número) a `disponibles` de ese `tipoEntrada` solo si `disponibles >= cantidad` y guarda el evento.
  - Éxito: `200` -> `{ ok: true, resultado: { ...eventoActualizado } }`
  - Sin stock suficiente, no encontrado o error: `404` -> `{ ok: false, error: "Error actualizando entradas del evento <idEvento>" }`
- **`GET /eventos/:id`**:
  - Usar `.populate('recinto')`.
  - Éxito: `200` -> `{ ok: true, resultado: { ... } }`
  - No encontrado (`null`) o error: `404` -> `{ ok: false, error: "Evento <id> no encontrado" }`
- **`POST /eventos`**:
  - Éxito: `201` -> `{ ok: true, resultado: { ... } }`
  - Error: `500` -> `{ ok: false, error: "Error añadiendo evento" }`
- **`PUT /eventos/:id`**:
  - Éxito: `200` -> `{ ok: true, resultado: { ...eventoActualizado } }`
  - No encontrado (`null`) o error: `404` -> `{ ok: false, error: "Error actualizando evento <id>" }`
- **`DELETE /eventos/:id`**:
  - Éxito: `200` -> `{ ok: true, resultado: { ... } }`
  - No encontrado (`null`) o error: `404` -> `{ ok: false, error: "Error eliminando evento <id>" }`