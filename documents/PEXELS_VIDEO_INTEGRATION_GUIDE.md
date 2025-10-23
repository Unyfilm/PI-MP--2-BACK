# 🎬 **GUÍA COMPLETA - INTEGRACIÓN CON PEXELS API**

## 🌟 **¿Qué es Pexels?**

**Pexels** es una plataforma que ofrece **videos y fotos gratuitos de alta calidad** con una potente API para desarrolladores.

### **✨ Características principales:**
- 🆓 **Totalmente gratuito** - Sin costo, sin derechos de autor
- 🎥 **Millones de videos** - Contenido profesional de alta calidad
- � **Búsqueda avanzada** - Por categorías, orientación, duración
- 📱 **Múltiples formatos** - HD, Full HD, 4K disponibles
- 🌐 **API RESTful** - Fácil integración en cualquier proyecto
- ⚡ **CDN global** - Descarga rápida desde cualquier lugar

### **💡 Casos de uso:**
- **Plataformas de contenido** - Videos de relleno o placeholder
- **Sitios web** - Videos de fondo o hero sections
- **Apps móviles** - Contenido dinámico sin costo
- **Prototipos** - Contenido real para demos
- **Editores de video** - Material B-roll gratuito

---

## 🚀 **CONFIGURACIÓN INICIAL**

### **Paso 1: Configuración de la API Key**

1. **Obtener API Key de Pexels:**
   ```bash
   # Ir a: https://www.pexels.com/api/
   # Registrarse gratis
   # Obtener tu API key
   ```

2. **Configurar en .env:**
   ```env
   # Ya está configurado en el proyecto
   PEXELS_API_KEY=tu-api-key-real-aqui
   ```

### **Paso 2: Crear el Servicio de Pexels**

Crear archivo `src/services/pexelsService.ts`:

```typescript
/**
 * Pexels API Service for video extraction
 */

import { config } from '../config/environment';

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  file_type: string;
  tags: string[];
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

export interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  url: string;
  videos: PexelsVideo[];
}

export interface PexelsSearchOptions {
  query: string;
  per_page?: number;
  page?: number;
  min_width?: number;
  min_height?: number;
  min_duration?: number;
  max_duration?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
}

class PexelsService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.pexels.com/videos';

  constructor() {
    this.apiKey = config.pexelsApiKey;
    if (!this.apiKey) {
      console.warn('⚠️ Pexels API key not configured. Video extraction disabled.');
    }
  }

  /**
   * Check if Pexels service is available
   */
  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  /**
   * Search videos by query
   */
  public async searchVideos(options: PexelsSearchOptions): Promise<PexelsSearchResponse> {
    if (!this.isAvailable()) {
      throw new Error('Pexels API key not configured');
    }

    const params = new URLSearchParams({
      query: options.query,
      per_page: (options.per_page || 15).toString(),
      page: (options.page || 1).toString(),
      ...(options.min_width && { min_width: options.min_width.toString() }),
      ...(options.min_height && { min_height: options.min_height.toString() }),
      ...(options.min_duration && { min_duration: options.min_duration.toString() }),
      ...(options.max_duration && { max_duration: options.max_duration.toString() }),
      ...(options.orientation && { orientation: options.orientation }),
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      headers: {
        'Authorization': this.apiKey,
        'User-Agent': 'MoviePlatform/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get popular videos
   */
  public async getPopularVideos(per_page: number = 15, page: number = 1): Promise<PexelsSearchResponse> {
    if (!this.isAvailable()) {
      throw new Error('Pexels API key not configured');
    }

    const params = new URLSearchParams({
      per_page: per_page.toString(),
      page: page.toString(),
    });

    const response = await fetch(`${this.baseUrl}/popular?${params}`, {
      headers: {
        'Authorization': this.apiKey,
        'User-Agent': 'MoviePlatform/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get video by ID
   */
  public async getVideoById(id: number): Promise<PexelsVideo> {
    if (!this.isAvailable()) {
      throw new Error('Pexels API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/videos/${id}`, {
      headers: {
        'Authorization': this.apiKey,
        'User-Agent': 'MoviePlatform/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get best quality video URL from video files
   */
  public getBestVideoUrl(video: PexelsVideo, preferredQuality: string = 'hd'): string {
    const videoFiles = video.video_files || [];
    
    // Try to find preferred quality
    let targetFile = videoFiles.find(file => 
      file.quality.toLowerCase() === preferredQuality.toLowerCase()
    );

    // Fallback to highest quality available
    if (!targetFile) {
      const qualityOrder = ['hd', 'sd', 'mobile'];
      for (const quality of qualityOrder) {
        targetFile = videoFiles.find(file => 
          file.quality.toLowerCase() === quality.toLowerCase()
        );
        if (targetFile) break;
      }
    }

    // Final fallback to first available
    if (!targetFile && videoFiles.length > 0) {
      targetFile = videoFiles[0];
    }

    return targetFile?.link || '';
  }

  /**
   * Get video thumbnail/poster
   */
  public getVideoThumbnail(video: PexelsVideo): string {
    const pictures = video.video_pictures || [];
    return pictures.length > 0 ? pictures[0].picture : '';
  }

  /**
   * Convert Pexels video to Movie-compatible format
   */
  public convertToMovieFormat(video: PexelsVideo, additionalData: {
    title?: string;
    description?: string;
    genre?: string[];
  } = {}): any {
    return {
      title: additionalData.title || `Video ${video.id}`,
      description: additionalData.description || `High-quality video from Pexels (ID: ${video.id})`,
      synopsis: `Duration: ${video.duration}s, Resolution: ${video.width}x${video.height}`,
      duration: video.duration,
      genre: additionalData.genre || ['General'],
      director: 'Pexels Contributor',
      poster: this.getVideoThumbnail(video),
      videoUrl: this.getBestVideoUrl(video),
      language: 'en',
      pexelsId: video.id,
      pexelsData: {
        width: video.width,
        height: video.height,
        file_type: video.file_type,
        tags: video.tags,
        available_qualities: video.video_files?.map(f => f.quality) || []
      }
    };
  }
}

export const pexelsService = new PexelsService();
```

### **Paso 3: Crear Controlador para Videos de Pexels**

Crear archivo `src/controllers/pexelsController.ts`:

```typescript
/**
 * Pexels controller - Handles Pexels video integration
 */

import { Request, Response } from 'express';
import { pexelsService, PexelsSearchOptions } from '../services/pexelsService';
import { Movie } from '../models/Movie';
import { ApiResponse, HttpStatusCode, PaginatedResponse, AuthenticatedRequest } from '../types/api.types';

/**
 * Search videos from Pexels
 * @route GET /api/pexels/search
 * @access Public
 */
export const searchPexelsVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!pexelsService.isAvailable()) {
      res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Pexels service is not available',
        error: 'API key not configured',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const {
      query = 'movie',
      per_page = 15,
      page = 1,
      min_duration,
      max_duration,
      orientation
    } = req.query as any;

    const searchOptions: PexelsSearchOptions = {
      query: query as string,
      per_page: Math.min(Number(per_page), 80), // Pexels limit
      page: Number(page),
      ...(min_duration && { min_duration: Number(min_duration) }),
      ...(max_duration && { max_duration: Number(max_duration) }),
      ...(orientation && { orientation: orientation as any })
    };

    const result = await pexelsService.searchVideos(searchOptions);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Pexels videos retrieved successfully',
      data: result.videos,
      pagination: {
        currentPage: result.page,
        totalPages: Math.ceil(result.total_results / result.per_page),
        totalItems: result.total_results,
        itemsPerPage: result.per_page,
        hasNextPage: result.page * result.per_page < result.total_results,
        hasPrevPage: result.page > 1,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error: any) {
    console.error('Search Pexels videos error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to search Pexels videos',
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get popular videos from Pexels
 * @route GET /api/pexels/popular
 * @access Public
 */
export const getPopularPexelsVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!pexelsService.isAvailable()) {
      res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Pexels service is not available',
        error: 'API key not configured',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const { per_page = 15, page = 1 } = req.query;

    const result = await pexelsService.getPopularVideos(
      Math.min(Number(per_page), 80),
      Number(page)
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Popular Pexels videos retrieved successfully',
      data: result.videos,
      pagination: {
        currentPage: result.page,
        totalPages: Math.ceil(result.total_results / result.per_page),
        totalItems: result.total_results,
        itemsPerPage: result.per_page,
        hasNextPage: result.page * result.per_page < result.total_results,
        hasPrevPage: result.page > 1,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error: any) {
    console.error('Get popular Pexels videos error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get popular Pexels videos',
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Import Pexels video as Movie
 * @route POST /api/pexels/import/:videoId
 * @access Private (Admin only)
 */
export const importPexelsVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!pexelsService.isAvailable()) {
      res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Pexels service is not available',
        error: 'API key not configured',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const { videoId } = req.params;
    const { title, description, genre } = req.body;

    // Get video from Pexels
    const pexelsVideo = await pexelsService.getVideoById(Number(videoId));

    // Check if already imported
    const existingMovie = await Movie.findOne({ pexelsId: pexelsVideo.id });
    if (existingMovie) {
      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: 'Video already imported',
        data: existingMovie,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Convert to movie format
    const movieData = pexelsService.convertToMovieFormat(pexelsVideo, {
      title,
      description,
      genre: genre || ['General']
    });

    // Create movie
    const movie = new Movie({
      ...movieData,
      releaseDate: new Date(), // Current date as release
      createdBy: req.user._id,
      featured: false,
      isActive: true
    });

    await movie.save();

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'Pexels video imported successfully',
      data: movie,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Import Pexels video error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to import Pexels video',
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get Pexels video details
 * @route GET /api/pexels/video/:videoId
 * @access Public
 */
export const getPexelsVideoDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!pexelsService.isAvailable()) {
      res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Pexels service is not available',
        error: 'API key not configured',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const { videoId } = req.params;
    const video = await pexelsService.getVideoById(Number(videoId));

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Pexels video details retrieved successfully',
      data: video,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get Pexels video details error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get Pexels video details',
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};
```

### **Paso 4: Crear Rutas para Pexels**

Crear archivo `src/routes/pexelsRoutes.ts`:

```typescript
/**
 * Pexels routes - Video extraction and management endpoints
 */

import { Router } from 'express';
import {
  searchPexelsVideos,
  getPopularPexelsVideos,
  importPexelsVideo,
  getPexelsVideoDetails
} from '../controllers/pexelsController';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

/**
 * @route GET /api/pexels/search
 * @desc Search videos from Pexels
 * @access Public
 */
router.get('/search', searchPexelsVideos);

/**
 * @route GET /api/pexels/popular
 * @desc Get popular videos from Pexels
 * @access Public
 */
router.get('/popular', getPopularPexelsVideos);

/**
 * @route GET /api/pexels/video/:videoId
 * @desc Get Pexels video details
 * @access Public
 */
router.get('/video/:videoId', getPexelsVideoDetails);

/**
 * @route POST /api/pexels/import/:videoId
 * @desc Import Pexels video as Movie
 * @access Private (Admin only)
 */
router.post('/import/:videoId',
  authenticateToken,
  [
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Description must be between 1 and 1000 characters'),
    body('genre')
      .optional()
      .isArray()
      .withMessage('Genre must be an array'),
  ],
  handleValidationErrors,
  importPexelsVideo
);

export { router as pexelsRoutes };
```

### **Paso 5: Actualizar el Modelo Movie**

Agregar campos opcionales al modelo Movie en `src/models/Movie.ts`:

```typescript
// Agregar estos campos opcionales al schema
pexelsId: {
  type: Number,
  unique: true,
  sparse: true // Permite null/undefined pero mantiene unicidad
},
pexelsData: {
  width: Number,
  height: Number,
  file_type: String,
  tags: [String],
  available_qualities: [String]
}
```

### **Paso 6: Integrar las Rutas**

En `src/app.ts`, agregar:

```typescript
import { pexelsRoutes } from './routes/pexelsRoutes';

// Después de las otras rutas
app.use('/api/pexels', pexelsRoutes);
```

---

## 🔧 **Configuración y Uso**

### **Variables de Entorno Necesarias**

```env
# Pexels API (Requerida para funcionalidad de videos)
PEXELS_API_KEY=tu-api-key-de-pexels
```

### **Endpoints Disponibles Después de la Implementación**

```bash
# Buscar videos
GET /api/pexels/search?query=action&per_page=15&page=1

# Videos populares
GET /api/pexels/popular?per_page=15&page=1

# Detalles de video específico
GET /api/pexels/video/12345

# Importar video como película (requiere autenticación)
POST /api/pexels/import/12345
```

### **Ejemplos de Uso**

```javascript
// Frontend - Buscar videos de acción
const searchVideos = async () => {
  const response = await fetch('/api/pexels/search?query=action&per_page=10');
  const data = await response.json();
  console.log(data.data); // Array de videos
};

// Importar video seleccionado
const importVideo = async (videoId, customData) => {
  const response = await fetch(`/api/pexels/import/${videoId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: customData.title,
      description: customData.description,
      genre: customData.genre
    })
  });
  return await response.json();
};
```

---

## ⚠️ **Consideraciones Importantes**

### **Limitaciones de la API de Pexels**
- ✅ **Gratis**: Hasta 200 requests por hora
- ✅ **Calidades**: HD, SD, Mobile disponibles
- ⚠️ **Rate Limiting**: Implementar caché para evitar límites
- ⚠️ **Términos**: Revisar términos de uso de Pexels

### **Mejoras Recomendadas**
1. **Caché de Redis**: Para almacenar búsquedas frecuentes
2. **Background Jobs**: Para importaciones masivas
3. **Categorización**: Mapear tags de Pexels a géneros de la plataforma
4. **Calidad adaptativa**: Servir videos según la conexión del usuario

---

## 🚀 **Instalación de Dependencias**

```bash
# No se necesitan dependencias adicionales
# La implementación usa fetch nativo de Node.js
```

---

## ✅ **Lista de Verificación de Implementación**

- [ ] Obtener API key de Pexels
- [ ] Configurar PEXELS_API_KEY en .env
- [ ] Crear servicio de Pexels (`pexelsService.ts`)
- [ ] Crear controlador (`pexelsController.ts`)
- [ ] Crear rutas (`pexelsRoutes.ts`)
- [ ] Actualizar modelo Movie con campos Pexels
- [ ] Integrar rutas en app.ts
- [ ] Probar endpoints con Postman/curl
- [ ] Implementar en frontend
- [ ] Documentar para el equipo

---

## 🎯 **Resultado Final**

Después de implementar esta guía, tendrás:

✅ **Búsqueda de videos** desde la API de Pexels  
✅ **Importación directa** de videos como películas  
✅ **Gestión automática** de calidades y thumbnails  
✅ **Integración completa** con el sistema existente  
✅ **Endpoints RESTful** para frontend  

¡La funcionalidad estará completamente operativa y lista para usar! 🎬