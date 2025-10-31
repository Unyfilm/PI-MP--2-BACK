# 🎬 Configuración de Videos con Cloudinary

## ✅ Implementación Completada

He implementado todo el sistema para reproducir videos desde Cloudinary de forma segura. Aquí está lo que se ha creado:

### 🔧 **Servicios Implementados**

1. **Servicio de Cloudinary** (`src/services/cloudinaryService.ts`)
   - Generación de URLs firmadas (temporales)
   - Subida de videos
   - Eliminación de videos
   - Obtención de información de videos

2. **Modelo Movie Actualizado**
   - Nuevo campo `cloudinaryVideoId` para el ID del video en Cloudinary
   - Tipos actualizados en `src/types/movie.types.ts`

3. **Nuevos Endpoints**
   - `GET /api/movies/:id/video` - Obtener URL firmada del video
   - `GET /api/movies/:id/video/info` - Obtener información del video

4. **Script de Prueba**
   - `src/scripts/seedMovies.ts` - Agregar películas de ejemplo
   - Comando: `npm run seed:movies`

## 🚀 **Cómo Usar**

### **Paso 1: Configurar Variables de Entorno**

Agrega estas variables a tu archivo `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dlyqtvvxv
CLOUDINARY_API_KEY=199242961977945
CLOUDINARY_API_SECRET=bMVfNQCjBvXCsaB_-7w9x8EgMA8
```

### **Paso 2: Subir Videos a Cloudinary**

1. Ve a tu dashboard de Cloudinary
2. Sube tus videos a la carpeta `movies/videos/`
3. Anota los **Public IDs** de tus videos (ej: `movies/videos/matrix-full`)

### **Paso 3: Ejecutar Script de Prueba**

```bash
npm run seed:movies
```

Esto creará 5 películas de ejemplo con videos de Cloudinary.

### **Paso 4: Probar Endpoints**

#### **Obtener URL de Video:**
```bash
GET /api/movies/{movieId}/video?duration=3600&quality=auto&width=1920&height=1080
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Video URL generated successfully",
  "data": {
    "videoUrl": "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1234567890/...",
    "expiresIn": 3600,
    "movieId": "...",
    "title": "The Matrix",
    "duration": 136
  }
}
```

#### **Obtener Información del Video:**
```bash
GET /api/movies/{movieId}/video/info
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Video info retrieved successfully",
  "data": {
    "movieId": "...",
    "title": "The Matrix",
    "cloudinaryVideoId": "movies/videos/matrix-full",
    "duration": 8160,
    "width": 1920,
    "height": 1080,
    "format": "mp4"
  }
}
```

## 🎯 **Para el Frontend**

### **Flujo de Reproducción:**

1. **Obtener datos de la película:**
   ```javascript
   const movie = await fetch('/api/movies/123').then(r => r.json());
   ```

2. **Obtener URL del video:**
   ```javascript
   const videoData = await fetch('/api/movies/123/video?duration=3600').then(r => r.json());
   const videoUrl = videoData.data.videoUrl;
   ```

3. **Reproducir video:**
   ```html
   <video controls>
     <source src={videoUrl} type="video/mp4" />
   </video>
   ```

### **Controles de Video (HTML5):**

```javascript
// Pausar/Reproducir
videoElement.pause();
videoElement.play();

// Obtener duración
const duration = videoElement.duration;

// Control de tiempo
videoElement.currentTime = 120; // Ir a 2 minutos
```

## 🔒 **Seguridad**

- **URLs firmadas**: Expiran en 1 hora por defecto
- **Control de acceso**: Solo usuarios autenticados pueden obtener URLs
- **Transformaciones**: Redimensionar y comprimir videos automáticamente

## 📝 **Notas Importantes**

1. **IDs de Cloudinary**: Debes actualizar los `cloudinaryVideoId` en el script con tus videos reales
2. **URLs de prueba**: Las URLs en el script son ejemplos, reemplázalas con tus videos reales
3. **Duración**: Las URLs firmadas expiran, el frontend debe renovarlas si es necesario

## 🧪 **Testing**

```bash
# Probar endpoint de video
curl "http://localhost:5000/api/movies/{movieId}/video?duration=3600"

# Probar información del video
curl "http://localhost:5000/api/movies/{movieId}/video/info"
```

¡Todo listo para que el frontend reproduzca videos de forma segura! 🎉
