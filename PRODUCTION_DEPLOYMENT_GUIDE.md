# 🚀 **GUÍA COMPLETA DE DESPLIEGUE EN PRODUCCIÓN**

## 📋 **Información del Proyecto**
- **Proyecto**: PI-MP-2-BACK (Movie Platform Backend)
- **Tecnologías**: Node.js, TypeScript, Express, MongoDB Atlas
- **Plataforma de Deploy**: Render
- **Fecha de configuración**: Octubre 16, 2025

---

## 🔧 **CONFIGURACIÓN DE VARIABLES DE ENTORNO PARA RENDER**

### **Variables Críticas (OBLIGATORIAS)**

```bash
# ===== SISTEMA =====
NODE_ENV=production
PORT=10000

# ===== BASE DE DATOS =====
MONGODB_URI=mongodb+srv://movieapp_prod:6N9PVBwqoUir6kE@cluster0.spyxknx.mongodb.net/movieapp_prod?retryWrites=true&w=majority&appName=Cluster0

# ===== SEGURIDAD =====
JWT_SECRET=2e1516e2bfef7da1228a779f17f20dbebcda267d57c911217270c5772188b4aa
JWT_EXPIRES_IN=7d

# ===== FRONTEND =====
CLIENT_URL=https://pi-mp-2-back-prod.onrender.com

# ===== EMAIL (CONFIGURACIÓN MEJORADA PARA RENDER) =====
EMAIL_SERVICE=gmail
EMAIL_USER=giraldobenabidezjuan@gmail.com
EMAIL_PASS=rayb lrsa cmvk onid

# ===== OPTIMIZACIONES =====
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### **Variables Opcionales (Funcionalidades Avanzadas)**

```bash
# ===== APIS EXTERNAS (DESHABILITADAS TEMPORALMENTE) =====
PEXELS_API_KEY=disabled
CLOUDINARY_CLOUD_NAME=disabled
CLOUDINARY_API_KEY=disabled
CLOUDINARY_API_SECRET=disabled
```

---

## 🔑 **GENERACIÓN DE CLAVES SEGURAS**

### **JWT_SECRET**
Para generar una nueva clave JWT segura:

```bash
# En terminal (Node.js):
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Resultado ejemplo:
# JWT_SECRET=2e1516e2bfef7da1228a779f17f20dbebcda267d57c911217270c5772188b4aa
```

**⚠️ IMPORTANTE**: Nunca reutilices JWT_SECRET entre entornos (desarrollo/producción).

---

## 🗄️ **CONFIGURACIÓN DE MONGODB ATLAS**

### **Datos de Conexión de Producción**
- **Cluster**: cluster0.spyxknx.mongodb.net
- **Usuario**: movieapp_prod
- **Password**: 6N9PVBwqoUir6kE
- **Database**: movieapp_prod
- **IP Access**: 0.0.0.0/0 (Render requiere acceso global)

### **Connection String Completa**
```
mongodb+srv://movieapp_prod:6N9PVBwqoUir6kE@cluster0.spyxknx.mongodb.net/movieapp_prod?retryWrites=true&w=majority&appName=Cluster0
```

### **Verificación en MongoDB Atlas**
1. **Database Access** → Verificar usuario `movieapp_prod`
2. **Network Access** → Confirmar `0.0.0.0/0` activo
3. **Browse Collections** → Crear database `movieapp_prod` si no existe

---

## ☁️ **SERVICIOS EXTERNOS**

### **1. Cloudinary (Subida de Imágenes)**

**¿Para qué se usa?**
- Subida y almacenamiento de pósters de películas
- Redimensionamiento automático de imágenes
- CDN para entrega rápida de contenido

**Configuración:**

**Opción A - Deshabilitar temporalmente:**
```bash
CLOUDINARY_CLOUD_NAME=disabled
CLOUDINARY_API_KEY=disabled
CLOUDINARY_API_SECRET=disabled
```

**Opción B - Configurar servicio real:**
1. Ir a: https://cloudinary.com/users/register/free
2. Registrarse (gratis hasta 25GB)
3. Dashboard → Copiar credenciales:
   ```bash
   CLOUDINARY_CLOUD_NAME=tu-cloud-name-real
   CLOUDINARY_API_KEY=1234567890123456
   CLOUDINARY_API_SECRET=tu-api-secret-real
   ```

### **2. Pexels API (Imágenes de Respaldo)**

**¿Para qué se usa?**
- Obtener imágenes automáticamente cuando no hay póster
- Banco de imágenes gratuito de alta calidad
- Fallback para contenido visual

**Configuración:**

**Opción A - Deshabilitar temporalmente:**
```bash
PEXELS_API_KEY=disabled
```

**Opción B - Configurar servicio real:**
1. Ir a: https://www.pexels.com/api/
2. Sign up gratuito
3. Crear API key:
   ```bash
   PEXELS_API_KEY=tu-pexels-api-key-real
   ```

---

## 📧 **CONFIGURACIÓN DE EMAIL**

### **Gmail App Password (YA CONFIGURADO)**
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=giraldobenabidezjuan@gmail.com
EMAIL_PASS=rayb lrsa cmvk onid
```

**¿Para qué se usa?**
- Envío de emails de recuperación de contraseña
- Notificaciones del sistema
- Comunicación con usuarios

**⚠️ NOTA**: `rayb lrsa cmvk onid` es un App Password de Gmail (no la contraseña normal).

---

## 🚀 **CONFIGURACIÓN DE RENDER**

### **Configuraciones del Servicio**
```bash
✅ Name: PI-MP-2-BACK-PROD
✅ Environment: production
✅ Language: Node
✅ Branch: main
✅ Region: Oregon (US West)
✅ Build Command: npm ci && npm run build
✅ Start Command: npm run start
```

### **Variables a ELIMINAR (Si existen)**
```bash
❌ DEBUG=True                    # Esto es de Django
❌ SECRET_KEY=django-insecure-... # Esto también es de Django
```

### **Health Check**
- **Path**: `/health`
- **Timeout**: 30 segundos

---

## 📦 **DEPENDENCIAS CRÍTICAS**

### **Movidas a `dependencies` (Render las necesita para compilar)**
```json
{
  "dependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.15",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.7",
    "@types/node": "^20.8.0",
    "typescript": "^5.2.2"
  }
}
```

### **Mantenidas en `devDependencies`**
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.6",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "eslint": "^8.52.0"
  }
}
```

---

## 🔍 **RESOLUCIÓN DE PROBLEMAS COMUNES**

### **1. Error: "bad auth : authentication failed"**
**Causa**: Credenciales incorrectas de MongoDB
**Solución**: Verificar MONGODB_URI, usuario y password

### **2. Error: "Could not find declaration file for module"**
**Causa**: Tipos TypeScript en devDependencies
**Solución**: Mover @types/* a dependencies

### **3. Error: "Cannot read property of undefined"**
**Causa**: Variables de entorno faltantes
**Solución**: Verificar todas las variables requeridas

### **4. Error: "Port already in use"**
**Causa**: Puerto hardcodeado incorrectamente
**Solución**: Usar `process.env.PORT || 5000`

### **5. Error: "Email Connection timeout (ETIMEDOUT)"**
**Causa**: Render puede bloquear ciertos puertos SMTP o Gmail
**Solución**: 
1. Verificar configuración de email mejorada
2. Considerar usar SendGrid para producción
3. El sistema tiene fallback - password reset aún funciona

---

## ✅ **CHECKLIST DE DEPLOYMENT**

### **Pre-Deployment**
- [ ] Todas las variables de entorno configuradas
- [ ] MongoDB Atlas accesible desde 0.0.0.0/0
- [ ] JWT_SECRET único para producción
- [ ] Dependencies correctas en package.json
- [ ] Build local exitoso (`npm run build`)

### **Post-Deployment**
- [ ] Servicio corriendo sin errores
- [ ] Health check respondiendo: `/health`
- [ ] Conexión a MongoDB establecida
- [ ] APIs funcionando correctamente
- [ ] Logs sin errores críticos

---

## 🌐 **URLs IMPORTANTES**

### **Producción**
- **API Base**: https://pi-mp-2-back-prod.onrender.com
- **Health Check**: https://pi-mp-2-back-prod.onrender.com/health
- **API Docs**: https://pi-mp-2-back-prod.onrender.com/

### **Servicios Externos**
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Render Dashboard**: https://dashboard.render.com
- **Cloudinary**: https://cloudinary.com/console
- **Pexels API**: https://www.pexels.com/api/

---

## 🔄 **COMANDOS ÚTILES**

### **Generar Nueva JWT Secret**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Test de Conexión MongoDB Local**
```bash
# Temporalmente en .env local:
MONGODB_URI=mongodb+srv://movieapp_prod:6N9PVBwqoUir6kE@cluster0.spyxknx.mongodb.net/movieapp_prod?retryWrites=true&w=majority&appName=Cluster0
npm run dev
```

### **Verificar Build Local**
```bash
npm run clean
npm run build
npm start
```

---

## 📝 **NOTAS ADICIONALES**

### **Entornos Separados**
- **Desarrollo**: `.env` local con `movie-streaming-db`
- **Testing**: MongoDB Memory Server (automático)
- **Producción**: Render variables con `movieapp_prod` database

### **Seguridad**
- JWT_SECRET diferente por entorno
- Passwords únicos para cada base de datos
- HTTPS automático en Render
- Rate limiting configurado (100 req/15min)

### **Escalabilidad**
- Connection pooling configurado (10 conexiones en prod)
- Timeouts optimizados para producción
- Retry logic para conexiones de DB
- Graceful shutdown implementado

---

## 🆘 **CONTACTO Y SOPORTE**

Si hay problemas con el deployment:

1. **Verificar logs en Render Dashboard**
2. **Revisar variables de entorno**
3. **Confirmar estado de MongoDB Atlas**
4. **Verificar health check endpoint**

**Última actualización**: Octubre 16, 2025