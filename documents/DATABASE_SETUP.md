# 🗄️ MongoDB Atlas Setup Guide

## Pasos para configurar MongoDB Atlas (Hacer externamente)

### 1. Crear cuenta en MongoDB Atlas
1. Ve a [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Crear un nuevo cluster
1. Haz clic en "Create" → "Cluster"
2. Selecciona la opción **FREE** (M0 Sandbox)
3. Elige el proveedor de nube más cercano (AWS, Google Cloud, o Azure)
4. Selecciona la región más cercana a tu ubicación
5. Nombra tu cluster (ej: `movie-streaming-cluster`)
6. Haz clic en "Create Cluster"
7. Espera 3-5 minutos a que se cree

### 3. Configurar acceso a la base de datos
1. Ve a **Database Access** en el menú lateral
2. Haz clic en "Add New Database User"
3. Configura:
   - **Username**: `movieuser` (o el que prefieras)
   - **Password**: Genera una contraseña segura (guárdala!)
   - **Database User Privileges**: `Read and write to any database`
4. Haz clic en "Add User"

### 4. Configurar acceso de red
1. Ve a **Network Access** en el menú lateral
2. Haz clic en "Add IP Address"
3. Para desarrollo local: 
   - Haz clic en "Add Current IP Address"
   - O usa `0.0.0.0/0` para permitir acceso desde cualquier IP (menos seguro pero útil para desarrollo)
4. Haz clic en "Confirm"

### 5. Obtener string de conexión
1. Ve a **Database** en el menú lateral
2. Haz clic en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Copia el connection string que se ve así:
   ```
   mongodb+srv://movieuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANTE**: Reemplaza `<password>` con la contraseña real del usuario

### 6. Configurar nombre de base de datos
El string final debe verse así:
```
mongodb+srv://movieuser:tu-contraseña@cluster0.xxxxx.mongodb.net/movie-streaming-db?retryWrites=true&w=majority
```

## Configuración local (Ya está hecho)

### 1. Actualizar archivo .env
Copia tu string de conexión al archivo `.env`:

```bash
# Copia .env.example a .env si no existe
cp .env.example .env
```

Luego edita `.env` y pega tu string de conexión:
```env
MONGODB_URI=mongodb+srv://movieuser:tu-contraseña@cluster0.xxxxx.mongodb.net/movie-streaming-db?retryWrites=true&w=majority
JWT_SECRET=tu-jwt-secret-super-seguro-de-al-menos-32-caracteres
```

### 2. Probar conexión
```bash
# Probar la conexión a la base de datos
npm run db:test
```

### 3. Inicializar base de datos con datos de ejemplo
```bash
# Crear usuarios y películas de ejemplo
npm run db:seed
```

### 4. Ejecutar servidor de desarrollo
```bash
# Iniciar el servidor
npm run dev
```

## ✅ Verificar que todo funciona

### 1. Probar endpoints básicos:
```bash
# Health check
GET http://localhost:5000/health

# Información de la API
GET http://localhost:5000/

# Registrar usuario
POST http://localhost:5000/api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "User"
}

# Login
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "Test123!"
}
```

### 2. Usuarios de ejemplo creados:
- **Admin**: `admin@movieplatform.com` / `Admin123!`
- **Usuario**: `user@example.com` / `User123!`

## 🔧 Scripts útiles

```bash
# Probar conexión
npm run db:test

# Poblar base de datos
npm run db:seed

# Resetear y poblar
npm run db:reset

# Desarrollo
npm run dev

# Compilar
npm run build

# Producción
npm start
```

## 🚨 Solución de problemas

### Error: "MongoNetworkError"
- Verifica que tu IP esté en la whitelist
- Revisa que el string de conexión sea correcto
- Asegúrate de que la contraseña no tenga caracteres especiales sin codificar

### Error: "Authentication failed"
- Verifica que el usuario y contraseña sean correctos
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar todas las dependencias

---

## 🎯 Próximos pasos después de configurar la DB

1. ✅ Configurar MongoDB Atlas
2. ✅ Probar conexión local
3. ✅ Poblar con datos iniciales
4. 🔄 Implementar funcionalidades del Sprint 1
5. 🔄 Crear endpoints de favoritos y calificaciones (Sprint 2)
6. ⏳ Implementar comentarios y subtítulos (Sprint 3)