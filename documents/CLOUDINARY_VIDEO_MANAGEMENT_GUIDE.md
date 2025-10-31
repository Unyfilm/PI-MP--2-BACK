# 🎬 **GUÍA COMPLETA - GESTIÓN DE VIDEOS CON CLOUDINARY**

## ✅ **ESTADO ACTUAL: TOTALMENTE IMPLEMENTADO**

El backend ya tiene un sistema completo de gestión de videos usando **Cloudinary** con todas las funcionalidades operativas.

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **📁 Estructura de Archivos**
```
src/
├── services/
│   └── cloudinaryService.ts     # Servicio principal de Cloudinary
├── controllers/
│   └── movieController.ts       # Controladores con endpoints de video
├── routes/
│   └── movieRoutes.ts          # Rutas de video configuradas
├── models/
│   └── Movie.ts                # Modelo con campos de video
└── types/
    └── movie.types.ts          # Tipos TypeScript para videos
```

### **🔧 Configuración Actual**
En tu `.env` ya tienes configurado:
```env
CLOUDINARY_CLOUD_NAME=dlyqtvvxv
CLOUDINARY_API_KEY=199242961977945  
CLOUDINARY_API_SECRET=bMVfNQCjBvXCsaB_-7w9x8EgMA8
```

---

## 🚀 **FUNCIONALIDADES IMPLEMENTADAS**

### **1. Servicio de Cloudinary** (`cloudinaryService.ts`)

**Métodos disponibles:**
- ✅ `generateSignedVideoUrl()` - URLs temporales seguras
- ✅ `uploadVideo()` - Subida de videos
- ✅ `deleteVideo()` - Eliminación de videos  
- ✅ `getVideoInfo()` - Información del video

**Ejemplo de uso:**
```typescript
import { cloudinaryService } from '../services/cloudinaryService';

// Generar URL firmada de 1 hora
const videoUrl = cloudinaryService.generateSignedVideoUrl('movies/matrix-full', {
  duration: 3600,
  transformation: {
    quality: 'auto',
    width: 1920,
    height: 1080
  }
});
```

### **2. Endpoints de Video Implementados**

#### **🎥 GET /api/movies/:id/video**
**Función:** Obtener URL firmada temporal del video  
**Parámetros query:**
- `duration` - Duración de la URL en segundos (default: 3600)
- `width` - Ancho del video
- `height` - Alto del video  
- `quality` - Calidad (auto, best, good, etc.)

**Ejemplo de request:**
```bash
GET /api/movies/67123abc456def789/video?duration=7200&quality=auto&width=1920
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Video URL generated successfully",
  "data": {
    "videoUrl": "https://res.cloudinary.com/dlyqtvvxv/video/upload/c_scale,q_auto,w_1920/v1234567890/movies/matrix-full.mp4?signature=...",
    "expiresIn": 7200,
    "movieId": "67123abc456def789",
    "title": "The Matrix",
    "duration": 136
  }
}
```

#### **📊 GET /api/movies/:id/video/info**
**Función:** Obtener información técnica del video  

**Ejemplo de request:**
```bash
GET /api/movies/67123abc456def789/video/info
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Video info retrieved successfully", 
  "data": {
    "movieId": "67123abc456def789",
    "title": "The Matrix",
    "cloudinaryVideoId": "movies/videos/matrix-full",
    "duration": 8160,
    "width": 1920,
    "height": 1080,
    "format": "mp4",
    "created_at": "2024-10-17T10:30:00Z"
  }
}
```

### **3. Modelo Movie con Soporte de Video**

**Campos relacionados con video:**
```typescript
interface IMovie {
  videoUrl: string;              // URL pública del video
  cloudinaryVideoId: string;     // ID del video en Cloudinary
  duration: number;              // Duración en minutos
  // ... otros campos
}
```

---

## 🎯 **CÓMO USAR EL SISTEMA**

### **PASO 1: Subir Videos a Cloudinary**

**Opción A - Dashboard de Cloudinary:**
1. Ir a: https://console.cloudinary.com/console
2. Subir videos a la carpeta `movies/videos/`
3. Copiar el Public ID (ej: `movies/videos/matrix-full`)

**Opción B - Programáticamente:**
```typescript
import { cloudinaryService } from '../services/cloudinaryService';

const result = await cloudinaryService.uploadVideo('/path/to/video.mp4', {
  folder: 'movies/videos',
  public_id: 'matrix-full'
});

console.log('Video subido:', result.public_id);
```

### **PASO 2: Crear Película con Video**

```typescript
// POST /api/movies
const movieData = {
  title: "The Matrix",
  description: "Una película épica de ciencia ficción",
  synopsis: "Neo descubre la verdad sobre la realidad...",
  releaseDate: "1999-03-31",
  duration: 136,
  genre: ["Sci-Fi", "Action"],
  director: "Lana Wachowski, Lilly Wachowski", 
  poster: "https://example.com/matrix-poster.jpg",
  videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/movies/videos/matrix-full.mp4",
  cloudinaryVideoId: "movies/videos/matrix-full", // ¡IMPORTANTE!
  language: "en"
};
```

### **PASO 3: Reproducir Video en Frontend**

#### **Flujo completo:**

```javascript
// 1. Obtener datos de la película
const getMovieDetails = async (movieId) => {
  const response = await fetch(`/api/movies/${movieId}`);
  const data = await response.json();
  return data.data; // Datos de la película
};

// 2. Obtener URL temporal del video
const getVideoUrl = async (movieId, options = {}) => {
  const params = new URLSearchParams({
    duration: options.duration || 3600,
    quality: options.quality || 'auto',
    ...(options.width && { width: options.width }),
    ...(options.height && { height: options.height })
  });
  
  const response = await fetch(`/api/movies/${movieId}/video?${params}`);
  const data = await response.json();
  return data.data.videoUrl;
};

// 3. Configurar reproductor
const setupVideoPlayer = async (movieId) => {
  try {
    const videoUrl = await getVideoUrl(movieId, {
      duration: 7200, // 2 horas
      quality: 'auto',
      width: 1920
    });
    
    const videoElement = document.getElementById('videoPlayer');
    videoElement.src = videoUrl;
    
    // Manejar evento de error
    videoElement.onerror = async () => {
      console.log('URL expirada, renovando...');
      const newUrl = await getVideoUrl(movieId);
      videoElement.src = newUrl;
    };
    
  } catch (error) {
    console.error('Error configurando video:', error);
  }
};
```

#### **Componente React ejemplo:**
```jsx
import React, { useState, useEffect } from 'react';

const VideoPlayer = ({ movieId }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVideo();
  }, [movieId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/movies/${movieId}/video?duration=7200`);
      const data = await response.json();
      
      if (data.success) {
        setVideoUrl(data.data.videoUrl);
      } else {
        setError('No se pudo cargar el video');
      }
    } catch (err) {
      setError('Error cargando video');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoError = () => {
    console.log('Error en video, recargando URL...');
    loadVideo(); // Recargar URL si expira
  };

  if (loading) return <div>Cargando video...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <video 
      src={videoUrl}
      controls
      width="100%"
      height="auto"
      onError={handleVideoError}
      poster="/default-poster.jpg"
    >
      Tu navegador no soporta videos HTML5.
    </video>
  );
};

export default VideoPlayer;
```

---

## 🔒 **SEGURIDAD IMPLEMENTADA**

### **URLs Firmadas Temporales**
- ✅ **Expiración**: URLs válidas por tiempo limitado (default 1 hora)
- ✅ **Firma criptográfica**: Imposibles de falsificar
- ✅ **Renovación automática**: Frontend puede renovar URLs expiradas

### **Control de Acceso**
- ✅ **Públicos**: Endpoints de video accesibles sin autenticación
- ✅ **Transformaciones**: Control de calidad y resolución en servidor
- ✅ **Rate limiting**: Protección contra abuso (configurado en app)

### **Gestión de Recursos**
- ✅ **Optimización**: Cloudinary optimiza automáticamente
- ✅ **CDN global**: Entrega rápida mundial
- ✅ **Formatos adaptativos**: Conversión automática según dispositivo

---

## 🛠️ **HERRAMIENTAS Y COMANDOS ÚTILES**

### **Testing con cURL**

```bash
# Obtener URL de video
curl "http://localhost:5000/api/movies/MOVIE_ID/video?duration=3600&quality=auto"

# Obtener información del video  
curl "http://localhost:5000/api/movies/MOVIE_ID/video/info"

# Listar todas las películas
curl "http://localhost:5000/api/movies"
```

### **Scripts útiles para gestión**

```bash
# Ver logs de Cloudinary
npm run dev | grep -i cloudinary

# Verificar configuración
npm run test:config

# Seed de películas de ejemplo (si existe)
npm run seed:movies
```

---

## 📊 **MONITOREO Y ANALYTICS**

### **Métricas disponibles en Cloudinary:**
- ✅ **Bandwidth usage**: Ancho de banda consumido
- ✅ **Transformations**: Número de transformaciones
- ✅ **Storage**: Almacenamiento usado
- ✅ **Requests**: Peticiones por día/mes

### **Dashboard de Cloudinary:**
- URL: https://console.cloudinary.com/console/lui/media_library
- Ver: Uso, transformaciones, analytics

---

## ⚙️ **CONFIGURACIÓN AVANZADA**

### **Optimizaciones de Performance**

```typescript
// En el servicio de Cloudinary
const signedUrl = cloudinary.url(videoId, {
  resource_type: 'video',
  expires_at: Math.floor(Date.now() / 1000) + duration,
  sign_url: true,
  transformation: {
    quality: 'auto:best',     // Calidad adaptativa
    format: 'auto',           // Formato óptimo
    fetch_format: 'auto',     // Formato del navegador
    flags: 'progressive',     // Carga progresiva
    streaming_profile: 'hd',  // Perfil de streaming
    ...transformation
  }
});
```

### **Variables de entorno adicionales (opcionales)**

```env
# Configuraciones avanzadas de Cloudinary
CLOUDINARY_SECURE=true
CLOUDINARY_FOLDER=movies/videos
CLOUDINARY_DEFAULT_QUALITY=auto:best
CLOUDINARY_URL_EXPIRATION=7200
```

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comunes**

**1. "Video not available for this movie"**
- ✅ Verificar que `cloudinaryVideoId` existe en la BD
- ✅ Confirmar que el video existe en Cloudinary

**2. "Failed to generate signed video URL"**
- ✅ Verificar credenciales de Cloudinary en `.env`
- ✅ Comprobar conectividad a internet

**3. "Video URL expired"**
- ✅ Normal después de 1 hora, el frontend debe renovar
- ✅ Implementar renovación automática en cliente

### **Logs útiles**
```bash
# Ver logs de errores de video
grep -i "video error" logs/app.log

# Monitorear requests de video
grep "GET.*video" logs/access.log
```

---

## 🎉 **RESUMEN DEL SISTEMA**

### **✅ Lo que YA tienes funcionando:**

1. **Servicio completo de Cloudinary** - Subida, descarga, gestión
2. **Endpoints de video** - URLs firmadas e información  
3. **Modelo de datos** - Campos de video en Movie
4. **Seguridad** - URLs temporales y firmadas
5. **Optimización** - Transformaciones automáticas
6. **Escalabilidad** - CDN global de Cloudinary

### **🎯 Para usar AHORA:**

1. **Subir videos** a Cloudinary (carpeta `movies/videos/`)
2. **Crear películas** con el campo `cloudinaryVideoId`
3. **Obtener URLs** con `GET /api/movies/:id/video`
4. **Reproducir** en frontend con HTML5 video
5. **Renovar URLs** cuando expiren

### **🚀 Sistema listo para producción:**

- ✅ **Rendimiento**: CDN global, optimización automática
- ✅ **Seguridad**: URLs firmadas, control de acceso
- ✅ **Escalabilidad**: Cloudinary maneja el volumen
- ✅ **Mantenimiento**: Mínimo, Cloudinary se encarga de la infraestructura

¡Tu sistema de videos con Cloudinary está **completamente operativo** y listo para usar en producción! 🎬🚀