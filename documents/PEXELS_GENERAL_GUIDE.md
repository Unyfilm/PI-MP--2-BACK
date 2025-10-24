# 🎬 **GUÍA COMPLETA - INTEGRACIÓN CON PEXELS API**

## 🌟 **¿Qué es Pexels?**

**Pexels** es una plataforma que ofrece **videos y fotos gratuitos de alta calidad** con una potente API para desarrolladores.

### **✨ Características principales:**
- 🆓 **Totalmente gratuito** - Sin costo, sin derechos de autor
- 🎥 **Millones de videos** - Contenido profesional de alta calidad
- 🔍 **Búsqueda avanzada** - Por categorías, orientación, duración
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

### **PASO 1: Obtener API Key**

1. **Registro en Pexels:**
   - Ir a: **https://www.pexels.com/api/**
   - Hacer clic en **"Get Started for Free"**
   - Registrarse con email o redes sociales

2. **Generar API Key:**
   - Una vez registrado, ir al dashboard
   - Copiar tu **API Key** única
   - Ejemplo: `563492ad6f91700001000001a1b2c3d4e5f6789012345678`

3. **Límites gratuitos:**
   - ✅ **200 requests por hora**
   - ✅ **20,000 requests por mes**
   - ✅ **Sin límite de descargas**
   - ✅ **Uso comercial permitido**

### **PASO 2: Configuración en tu Proyecto**

#### **Variables de Entorno**
```env
# .env
PEXELS_API_KEY=tu-api-key-aqui
PEXELS_BASE_URL=https://api.pexels.com/videos
```

#### **Dependencias (Opcional)**
```bash
# Solo si quieres usar una librería específica
npm install axios        # Para requests HTTP
npm install dotenv       # Para variables de entorno
```

---

## 🛠️ **IMPLEMENTACIÓN GENERAL (Cualquier Lenguaje)**

### **📡 Endpoints Principales de Pexels**

```
BASE_URL: https://api.pexels.com/videos

🔍 Buscar videos:
GET /search?query={query}&per_page={per_page}&page={page}

🔥 Videos populares:
GET /popular?per_page={per_page}&page={page}

📄 Video específico:
GET /videos/{id}
```

### **🔑 Headers Requeridos**
```http
Authorization: TU_API_KEY_AQUI
User-Agent: TuApp/1.0 (opcional pero recomendado)
```

---

## 💻 **EJEMPLOS DE IMPLEMENTACIÓN**

### **🟨 JavaScript/Node.js**

#### **Servicio Básico:**
```javascript
class PexelsService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.pexels.com/videos';
  }

  async searchVideos(query, options = {}) {
    const {
      per_page = 15,
      page = 1,
      orientation = null,
      size = null,
      min_width = null,
      min_height = null,
      min_duration = null,
      max_duration = null
    } = options;

    const params = new URLSearchParams({
      query,
      per_page: per_page.toString(),
      page: page.toString(),
      ...(orientation && { orientation }),
      ...(size && { size }),
      ...(min_width && { min_width: min_width.toString() }),
      ...(min_height && { min_height: min_height.toString() }),
      ...(min_duration && { min_duration: min_duration.toString() }),
      ...(max_duration && { max_duration: max_duration.toString() })
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      headers: {
        'Authorization': this.apiKey,
        'User-Agent': 'MyApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    return await response.json();
  }

  async getPopularVideos(per_page = 15, page = 1) {
    const params = new URLSearchParams({
      per_page: per_page.toString(),
      page: page.toString()
    });

    const response = await fetch(`${this.baseUrl}/popular?${params}`, {
      headers: {
        'Authorization': this.apiKey,
        'User-Agent': 'MyApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    return await response.json();
  }

  async getVideoById(id) {
    const response = await fetch(`${this.baseUrl}/videos/${id}`, {
      headers: {
        'Authorization': this.apiKey,
        'User-Agent': 'MyApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    return await response.json();
  }

  // Utilidad: Obtener la mejor calidad disponible
  getBestVideoUrl(video, preferredQuality = 'hd') {
    const videoFiles = video.video_files || [];
    
    // Buscar calidad preferida
    let targetFile = videoFiles.find(file => 
      file.quality.toLowerCase() === preferredQuality.toLowerCase()
    );

    // Fallback a orden de preferencia
    if (!targetFile) {
      const qualityOrder = ['hd', 'sd', 'mobile'];
      for (const quality of qualityOrder) {
        targetFile = videoFiles.find(file => 
          file.quality.toLowerCase() === quality.toLowerCase()
        );
        if (targetFile) break;
      }
    }

    return targetFile?.link || '';
  }

  // Utilidad: Obtener thumbnail del video
  getVideoThumbnail(video) {
    const pictures = video.video_pictures || [];
    return pictures.length > 0 ? pictures[0].picture : '';
  }
}

// Uso
const pexels = new PexelsService(process.env.PEXELS_API_KEY);

// Buscar videos de naturaleza
const results = await pexels.searchVideos('nature', {
  per_page: 10,
  orientation: 'landscape',
  min_duration: 5,
  max_duration: 30
});

console.log(`Encontrados ${results.total_results} videos`);
results.videos.forEach(video => {
  console.log(`- ${video.id}: ${video.width}x${video.height}, ${video.duration}s`);
});
```

#### **Implementación con Express.js:**
```javascript
const express = require('express');
const app = express();

// Controlador para buscar videos
app.get('/api/videos/search', async (req, res) => {
  try {
    const { query, page = 1, per_page = 15 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    const pexels = new PexelsService(process.env.PEXELS_API_KEY);
    const results = await pexels.searchVideos(query, { page, per_page });

    res.json({
      success: true,
      data: results.videos,
      pagination: {
        page: results.page,
        per_page: results.per_page,
        total_results: results.total_results,
        has_next: results.page * results.per_page < results.total_results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Controlador para videos populares
app.get('/api/videos/popular', async (req, res) => {
  try {
    const { page = 1, per_page = 15 } = req.query;
    
    const pexels = new PexelsService(process.env.PEXELS_API_KEY);
    const results = await pexels.getPopularVideos(per_page, page);

    res.json({
      success: true,
      data: results.videos,
      pagination: {
        page: results.page,
        per_page: results.per_page,
        total_results: results.total_results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### **🐍 Python**

```python
import requests
import os
from typing import Dict, List, Optional

class PexelsService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.pexels.com/videos"
        self.headers = {
            'Authorization': api_key,
            'User-Agent': 'MyApp/1.0'
        }

    def search_videos(self, query: str, **kwargs) -> Dict:
        """Buscar videos por query"""
        params = {
            'query': query,
            'per_page': kwargs.get('per_page', 15),
            'page': kwargs.get('page', 1)
        }
        
        # Filtros opcionales
        optional_params = [
            'orientation', 'size', 'min_width', 'min_height',
            'min_duration', 'max_duration'
        ]
        for param in optional_params:
            if param in kwargs:
                params[param] = kwargs[param]

        response = requests.get(
            f"{self.base_url}/search",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_popular_videos(self, per_page: int = 15, page: int = 1) -> Dict:
        """Obtener videos populares"""
        params = {
            'per_page': per_page,
            'page': page
        }
        
        response = requests.get(
            f"{self.base_url}/popular",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_video_by_id(self, video_id: int) -> Dict:
        """Obtener video específico por ID"""
        response = requests.get(
            f"{self.base_url}/videos/{video_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_best_video_url(self, video: Dict, preferred_quality: str = 'hd') -> str:
        """Obtener la mejor URL de video disponible"""
        video_files = video.get('video_files', [])
        
        # Buscar calidad preferida
        for file in video_files:
            if file.get('quality', '').lower() == preferred_quality.lower():
                return file.get('link', '')
        
        # Fallback por orden de preferencia
        quality_order = ['hd', 'sd', 'mobile']
        for quality in quality_order:
            for file in video_files:
                if file.get('quality', '').lower() == quality:
                    return file.get('link', '')
        
        return ''

# Uso
pexels = PexelsService(os.getenv('PEXELS_API_KEY'))

# Buscar videos
results = pexels.search_videos('ocean', per_page=5, orientation='landscape')
print(f"Encontrados {results['total_results']} videos")

for video in results['videos']:
    best_url = pexels.get_best_video_url(video)
    print(f"Video {video['id']}: {video['width']}x{video['height']}")
    print(f"URL: {best_url}")
```

### **⚛️ React/Frontend**

```javascript
// Hook personalizado para Pexels
import { useState, useEffect } from 'react';

const usePexelsVideos = (query, options = {}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchVideos = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query,
        per_page: options.per_page || 15,
        page: options.page || 1,
        ...options
      });

      const response = await fetch(`/api/videos/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setVideos(data.data);
      } else {
        setError('Error buscando videos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchVideos();
  }, [query, options.page]);

  return { videos, loading, error, refetch: searchVideos };
};

// Componente de galería de videos
const VideoGallery = () => {
  const [searchQuery, setSearchQuery] = useState('nature');
  const { videos, loading, error } = usePexelsVideos(searchQuery);

  if (loading) return <div>Cargando videos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar videos..."
      />
      
      <div className="video-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <video
              src={video.video_files.find(f => f.quality === 'hd')?.link}
              poster={video.video_pictures[0]?.picture}
              controls
              width="300"
              height="200"
            />
            <p>Duración: {video.duration}s</p>
            <p>Resolución: {video.width}x{video.height}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **🔥 PHP**

```php
<?php
class PexelsService {
    private $apiKey;
    private $baseUrl = 'https://api.pexels.com/videos';

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function searchVideos($query, $options = []) {
        $params = array_merge([
            'query' => $query,
            'per_page' => 15,
            'page' => 1
        ], $options);

        $url = $this->baseUrl . '/search?' . http_build_query($params);
        
        return $this->makeRequest($url);
    }

    public function getPopularVideos($perPage = 15, $page = 1) {
        $params = [
            'per_page' => $perPage,
            'page' => $page
        ];

        $url = $this->baseUrl . '/popular?' . http_build_query($params);
        
        return $this->makeRequest($url);
    }

    public function getVideoById($id) {
        $url = $this->baseUrl . '/videos/' . $id;
        
        return $this->makeRequest($url);
    }

    private function makeRequest($url) {
        $headers = [
            'Authorization: ' . $this->apiKey,
            'User-Agent: MyApp/1.0'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("Pexels API Error: " . $httpCode);
        }

        return json_decode($response, true);
    }

    public function getBestVideoUrl($video, $preferredQuality = 'hd') {
        $videoFiles = $video['video_files'] ?? [];
        
        // Buscar calidad preferida
        foreach ($videoFiles as $file) {
            if (strtolower($file['quality']) === strtolower($preferredQuality)) {
                return $file['link'];
            }
        }

        // Fallback
        $qualityOrder = ['hd', 'sd', 'mobile'];
        foreach ($qualityOrder as $quality) {
            foreach ($videoFiles as $file) {
                if (strtolower($file['quality']) === $quality) {
                    return $file['link'];
                }
            }
        }

        return '';
    }
}

// Uso
$pexels = new PexelsService($_ENV['PEXELS_API_KEY']);

// Buscar videos
$results = $pexels->searchVideos('beach', [
    'per_page' => 10,
    'orientation' => 'landscape'
]);

echo "Encontrados {$results['total_results']} videos\n";

foreach ($results['videos'] as $video) {
    $bestUrl = $pexels->getBestVideoUrl($video);
    echo "Video {$video['id']}: {$video['width']}x{$video['height']}\n";
    echo "URL: $bestUrl\n";
}
?>
```

---

## 📱 **RESPUESTA TÍPICA DE LA API**

```json
{
  "page": 1,
  "per_page": 15,
  "total_results": 1000,
  "url": "https://api.pexels.com/videos/search?query=nature&per_page=15&page=1",
  "videos": [
    {
      "id": 1851190,
      "width": 1920,
      "height": 1080,
      "duration": 15,
      "file_type": "video/mp4",
      "tags": ["nature", "forest", "green"],
      "video_files": [
        {
          "id": 102049,
          "quality": "hd",
          "file_type": "video/mp4",
          "width": 1920,
          "height": 1080,
          "link": "https://player.vimeo.com/external/234567890.hd.mp4"
        },
        {
          "id": 102050,
          "quality": "sd",
          "file_type": "video/mp4",
          "width": 640,
          "height": 360,
          "link": "https://player.vimeo.com/external/234567890.sd.mp4"
        }
      ],
      "video_pictures": [
        {
          "id": 123456,
          "picture": "https://images.pexels.com/videos/1851190/pictures/preview-0.jpg",
          "nr": 0
        }
      ]
    }
  ]
}
```

---

## ⚙️ **PARÁMETROS DE BÚSQUEDA AVANZADA**

### **🔍 Parámetros disponibles:**

| Parámetro | Tipo | Descripción | Valores |
|-----------|------|-------------|---------|
| `query` | string | **Requerido** - Término de búsqueda | "ocean", "city", "people" |
| `orientation` | string | Orientación del video | `landscape`, `portrait`, `square` |
| `size` | string | Tamaño del video | `large`, `medium`, `small` |
| `min_width` | integer | Ancho mínimo en píxeles | `1920`, `1280`, `640` |
| `min_height` | integer | Alto mínimo en píxeles | `1080`, `720`, `360` |
| `min_duration` | integer | Duración mínima en segundos | `5`, `10`, `30` |
| `max_duration` | integer | Duración máxima en segundos | `60`, `120`, `300` |
| `per_page` | integer | Videos por página (máx 80) | `15`, `40`, `80` |
| `page` | integer | Número de página | `1`, `2`, `3` |

### **🎯 Ejemplos de búsquedas específicas:**

```javascript
// Videos de paisajes en HD de más de 10 segundos
await pexels.searchVideos('landscape', {
  orientation: 'landscape',
  min_width: 1920,
  min_duration: 10,
  per_page: 20
});

// Videos cortos verticales para móvil
await pexels.searchVideos('people', {
  orientation: 'portrait',
  max_duration: 15,
  size: 'small'
});

// Videos largos para documentales
await pexels.searchVideos('documentary', {
  min_duration: 60,
  max_duration: 300,
  min_width: 1280
});
```

---

## 🎨 **CASOS DE USO PRÁCTICOS**

### **1. 📱 App de Redes Sociales**
```javascript
// Feed con videos cortos y verticales
const feedVideos = await pexels.searchVideos('lifestyle', {
  orientation: 'portrait',
  max_duration: 30,
  per_page: 50
});
```

### **2. 🏢 Sitio Web Corporativo**
```javascript
// Videos de fondo profesionales
const heroVideos = await pexels.searchVideos('business', {
  orientation: 'landscape',
  min_width: 1920,
  min_duration: 15,
  max_duration: 45
});
```

### **3. 🎓 Plataforma Educativa**
```javascript
// Videos educativos de ciencia
const educationalVideos = await pexels.searchVideos('science', {
  min_duration: 30,
  orientation: 'landscape',
  size: 'large'
});
```

### **4. 🛍️ E-commerce**
```javascript
// Videos de productos/lifestyle
const productVideos = await pexels.searchVideos('shopping', {
  orientation: 'square',
  max_duration: 20,
  per_page: 30
});
```

---

## 💡 **MEJORES PRÁCTICAS**

### **🚀 Performance:**
- ✅ **Caché**: Almacena resultados por 1-2 horas
- ✅ **Paginación**: No cargues más de 40 videos por request
- ✅ **Lazy Loading**: Carga videos bajo demanda
- ✅ **Compresión**: Usa calidad 'sd' para previews

### **🔒 Seguridad:**
- ✅ **Ocultar API Key**: Solo en servidor, nunca en frontend
- ✅ **Rate Limiting**: Implementa límites en tu API
- ✅ **Validation**: Valida parámetros de entrada
- ✅ **CORS**: Configura correctamente para frontend

### **📊 Optimización:**
```javascript
// Implementar caché simple
const cache = new Map();

async function getCachedVideos(query, options) {
  const cacheKey = JSON.stringify({ query, options });
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3600000) { // 1 hora
      return cached.data;
    }
  }
  
  const data = await pexels.searchVideos(query, options);
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

### **🎯 UX/UI:**
- ✅ **Loading states**: Muestra skeletons mientras cargas
- ✅ **Error handling**: Maneja errores de red gracefully
- ✅ **Infinite scroll**: Para mejor experiencia
- ✅ **Video previews**: Thumbnails antes de cargar video completo

---

## 🚨 **LIMITACIONES Y CONSIDERACIONES**

### **📊 Límites de la API:**
- **Gratuito**: 200 requests/hora, 20K/mes
- **Rate limiting**: Implementar retry con exponential backoff
- **Tamaño de respuesta**: Máximo 80 videos por request

### **⚖️ Términos de Uso:**
- ✅ **Uso comercial permitido**
- ✅ **No requiere atribución** (pero es apreciada)
- ❌ **No revender los videos directamente**
- ❌ **No usar para contenido ilegal/dañino**

### **🔧 Implementación de Rate Limiting:**
```javascript
class RateLimitedPexelsService {
  constructor(apiKey) {
    this.pexels = new PexelsService(apiKey);
    this.requestCount = 0;
    this.resetTime = Date.now() + 3600000; // 1 hora
  }

  async makeRequest(method, ...args) {
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 3600000;
    }

    if (this.requestCount >= 200) {
      throw new Error('Rate limit exceeded. Try again later.');
    }

    this.requestCount++;
    return await this.pexels[method](...args);
  }

  async searchVideos(...args) {
    return this.makeRequest('searchVideos', ...args);
  }
}
```

---

## 🛠️ **HERRAMIENTAS Y TESTING**

### **🧪 Testing con cURL:**
```bash
# Buscar videos
curl -H "Authorization: TU_API_KEY" \
  "https://api.pexels.com/videos/search?query=ocean&per_page=5"

# Videos populares
curl -H "Authorization: TU_API_KEY" \
  "https://api.pexels.com/videos/popular?per_page=5"

# Video específico
curl -H "Authorization: TU_API_KEY" \
  "https://api.pexels.com/videos/videos/1851190"
```

### **📱 Herramientas recomendadas:**
- **Postman**: Para testing de API
- **Insomnia**: Alternativa a Postman
- **Pexels SDK**: Librerías oficiales disponibles
- **Video.js**: Player de video robusto para web

---

## 📚 **RECURSOS ADICIONALES**

### **🔗 Enlaces útiles:**
- **Documentación oficial**: https://www.pexels.com/api/documentation/
- **Dashboard de API**: https://www.pexels.com/api/dashboard/
- **Términos de uso**: https://www.pexels.com/api/terms/
- **Ejemplos de código**: https://github.com/pexels/pexels-api

### **📖 Librerías oficiales:**
- **JavaScript**: `pexels`
- **Python**: `PyPexels`
- **PHP**: `pexels-php`
- **Ruby**: `pexels-ruby`

### **🎯 Palabras clave populares:**
```
Generales: nature, city, people, business, technology
Emociones: happy, calm, exciting, dramatic, peaceful
Actividades: working, walking, running, cooking, traveling
Conceptos: abstract, minimalist, colorful, black-and-white
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **📋 Configuración:**
- [ ] Registrarse en Pexels y obtener API key
- [ ] Configurar variables de entorno
- [ ] Instalar dependencias necesarias
- [ ] Crear servicio/clase para Pexels

### **💻 Desarrollo:**
- [ ] Implementar búsqueda de videos
- [ ] Agregar filtros avanzados
- [ ] Manejar paginación
- [ ] Implementar cache para performance
- [ ] Agregar manejo de errores

### **🔒 Seguridad:**
- [ ] Ocultar API key del frontend
- [ ] Implementar rate limiting
- [ ] Validar parámetros de entrada
- [ ] Configurar CORS apropiadamente

### **🎨 UX/UI:**
- [ ] Crear interfaz de búsqueda
- [ ] Implementar grid de videos
- [ ] Agregar loading states
- [ ] Manejar estados de error
- [ ] Optimizar para móvil

### **🧪 Testing:**
- [ ] Probar endpoints con cURL/Postman
- [ ] Verificar límites de rate limiting
- [ ] Testear diferentes filtros
- [ ] Validar performance con cache

---

## 🎉 **¡LISTO PARA USAR!**

Con esta guía tienes todo lo necesario para integrar Pexels en cualquier proyecto:

✅ **Configuración completa** - Desde registro hasta implementación  
✅ **Múltiples lenguajes** - JavaScript, Python, PHP y más  
✅ **Ejemplos prácticos** - Casos de uso reales  
✅ **Mejores prácticas** - Performance, seguridad, UX  
✅ **Herramientas** - Testing, debugging, monitoreo  

¡Pexels te dará acceso a millones de videos profesionales gratuitos para enriquecer cualquier aplicación! 🎬✨