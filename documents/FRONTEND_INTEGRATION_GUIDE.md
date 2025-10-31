# 📋 **ESPECIFICACIONES TÉCNICAS DEL BACKEND PARA FRONTEND**

## 🎯 **Resumen Ejecutivo**

Este documento proporciona las especificaciones exactas de lo que el backend espera para la integración del frontend. **IMPORTANTE**: El campo `username` es OPCIONAL desde la actualización reciente.

---

## 🔧 **ENDPOINT DE REGISTRO: POST /api/auth/register**

### **📤 Campos Requeridos (Request Body)**

```typescript
interface RegisterUserRequest {
  // CAMPOS OBLIGATORIOS
  email: string;           // Email válido
  password: string;        // Mínimo 8 caracteres con mayúscula, número y símbolo
  firstName: string;       // Nombre (1-50 caracteres)
  lastName: string;        // Apellido (1-50 caracteres)  
  age: number;            // Edad entre 13 y 120 (número entero)
  
  // CAMPOS OPCIONALES
  username?: string;       // Username (3-30 caracteres, solo letras, números y _)
}
```

### **✅ Ejemplo de Petición Correcta**

```javascript
// Opción 1: CON username
{
  "email": "juan@example.com",
  "password": "MiPassword123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "age": 25,
  "username": "juanperez"
}

// Opción 2: SIN username (se genera automáticamente)
{
  "email": "maria@example.com", 
  "password": "MiPassword456!",
  "firstName": "María",
  "lastName": "García",
  "age": 30
  // username se generará automáticamente como "mariagarcia"
}
```

---

## 📋 **VALIDACIONES DETALLADAS**

### **1. EMAIL**
```typescript
// Validación del backend
body('email')
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail()
```
- ✅ **Válido**: `usuario@dominio.com`
- ❌ **Inválido**: `usuario@`, `@dominio.com`, `usuario.dominio.com`

### **2. PASSWORD**
```typescript
// Validación del backend
body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character')
```
- ✅ **Válido**: `MiPassword123!`, `Secure@Pass456`
- ❌ **Inválido**: `password`, `PASSWORD123`, `Password123`

### **3. USERNAME (OPCIONAL)**
```typescript
// Validación del backend
body('username')
  .optional() // ← CAMPO OPCIONAL
  .isLength({ min: 3, max: 30 })
  .withMessage('Username must be between 3 and 30 characters')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can only contain letters, numbers, and underscores')
```
- ✅ **Válido**: `juan123`, `maria_garcia`, `user_2024`
- ❌ **Inválido**: `ju`, `usuario-con-guión`, `user@email`

### **4. FIRSTNAME / LASTNAME**
```typescript
// Validación del backend
body('firstName')
  .trim()
  .isLength({ min: 1, max: 50 })
  .withMessage('First name must be between 1 and 50 characters')
```
- ✅ **Válido**: `Juan`, `María José`, `Ana`
- ❌ **Inválido**: `""`, `nombre demasiado largo para cumplir límite de 50`

### **5. AGE**
```typescript
// Validación del backend
body('age')
  .isInt({ min: 13, max: 120 })
  .withMessage('Age must be a number between 13 and 120')
```
- ✅ **Válido**: `25`, `18`, `65`
- ❌ **Inválido**: `"25"`, `12`, `150`, `25.5`

---

## 🎯 **NOMBRES DE CAMPOS EXACTOS**

**⚠️ IMPORTANTE**: Usar estos nombres EXACTOS en el JSON:

```json
{
  "email": "...",        // NO "correo" o "mail"
  "password": "...",     // NO "contraseña" o "pass"
  "firstName": "...",    // NO "nombre" o "first_name"
  "lastName": "...",     // NO "apellido" o "last_name"
  "age": 25,            // NO "edad" - debe ser NUMBER no STRING
  "username": "..."      // OPCIONAL - NO "usuario" o "user_name"
}
```

---

## 📨 **RESPUESTAS DEL SERVIDOR**

### **✅ Registro Exitoso (201)**
```json
{
  "success": true,
  "message": "Registro exitoso",
  "data": {
    "user": {
      "id": "6a1b2c3d4e5f6789",
      "username": "juanperez",  // Generado automáticamente si no se proporcionó
      "email": "juan@example.com",
      "firstName": "Juan",
      "lastName": "Pérez", 
      "age": 25,
      "role": "user"
    }
  },
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

### **❌ Error de Validación (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Password must contain uppercase, lowercase, number, and special character",
  "details": [
    {
      "type": "field",
      "value": "password123",
      "msg": "Password must contain uppercase, lowercase, number, and special character",
      "path": "password",
      "location": "body"
    }
  ],
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

### **❌ Usuario Duplicado (409)**
```json
{
  "success": false,
  "message": "Este correo electrónico ya está registrado. Por favor usa uno diferente.",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

---

## 🔄 **LÓGICA DE GENERACIÓN AUTOMÁTICA DE USERNAME**

Cuando NO se proporciona `username`, el backend:

1. **Genera username base**: `firstName.toLowerCase() + lastName.toLowerCase()`
2. **Remueve espacios y caracteres especiales**
3. **Si ya existe, agrega número secuencial**

```typescript
// Ejemplos de generación automática
"Juan Pérez" → "juanperez"
"María José García" → "mariajosegarcia" 
"Juan Pérez" (ya existe) → "juanperez1"
"Juan Pérez" (juanperez1 ya existe) → "juanperez2"
```

---

## 🛠️ **IMPLEMENTACIÓN RECOMENDADA PARA FRONTEND**

### **1. Formulario de Registro**
```javascript
const registerUser = async (formData) => {
  // Asegurar que age sea número
  const payload = {
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(), 
    age: parseInt(formData.age, 10), // ← IMPORTANTE: convertir a número
    // username es opcional - solo incluir si el usuario lo proporcionó
    ...(formData.username && { username: formData.username.trim() })
  };

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
};
```

### **2. Validación Client-Side (Opcional pero Recomendada)**
```javascript
const validateRegistrationForm = (data) => {
  const errors = {};

  // Email
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email inválido';
  }

  // Password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!data.password || !passwordRegex.test(data.password)) {
    errors.password = 'Password debe tener mayúscula, minúscula, número y símbolo especial';
  }

  // FirstName
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.firstName = 'Nombre es requerido';
  }

  // LastName  
  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.lastName = 'Apellido es requerido';
  }

  // Age
  const age = parseInt(data.age, 10);
  if (!age || age < 13 || age > 120) {
    errors.age = 'Edad debe ser entre 13 y 120 años';
  }

  // Username (solo si se proporciona)
  if (data.username) {
    if (data.username.length < 3 || data.username.length > 30) {
      errors.username = 'Username debe tener entre 3 y 30 caracteres';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = 'Username solo puede contener letras, números y guiones bajos';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

---

## 🚨 **ERRORES COMUNES A EVITAR**

### ❌ **Error 1: Campos en español (PROBLEMA ACTUAL)**
```javascript
// INCORRECTO ❌ - Frontend actual está enviando esto:
{
  "correo": "juan@email.com",     // ❌ Debe ser "email"
  "contraseña": "Password123!",   // ❌ Debe ser "password"
  "nombre": "Juan",               // ❌ Debe ser "firstName"
  "apellido": "Pérez",           // ❌ Debe ser "lastName"
  "edad": "25"                   // ❌ Debe ser "age" y NUMBER
}

// CORRECTO ✅ - Lo que el backend espera:
{
  "email": "juan@email.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "age": 25
}
```

### ❌ **Error 2: Enviar age como string**
```javascript
// INCORRECTO
{ "age": "25" }

// CORRECTO  
{ "age": 25 }
```

### ❌ **Error 3: Nombres de campos incorrectos**
```javascript
// INCORRECTO
{
  "nombre": "Juan",
  "apellido": "Pérez", 
  "correo": "juan@email.com"
}

// CORRECTO
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com"
}
```

### ❌ **Error 3: Enviar username vacío**
```javascript
// INCORRECTO
{ "username": "" }
{ "username": null }

// CORRECTO - No incluir el campo si está vacío
{
  // No incluir username si no se va a usar
}
```

---

## 🔧 **HERRAMIENTAS DE DEBUG**

### **🚨 PROBLEMA ACTUAL - Error 400 Bad Request**

**Si ves error 400, es porque el frontend está enviando campos en español:**

1. **Abrir DevTools (F12)**
2. **Ir a Network tab**
3. **Hacer el registro**
4. **Buscar la petición a `/api/auth/register`**
5. **Ver el Request Payload**

**Payload INCORRECTO actual (causa error 400):**
```json
{
  "correo": "usuario@email.com",     // ❌ 
  "contraseña": "Password123!",      // ❌
  "nombre": "Usuario",               // ❌ 
  "apellido": "Test",               // ❌
  "edad": "25"                      // ❌
}
```

**Payload CORRECTO esperado:**
```json
{
  "email": "usuario@email.com",     // ✅
  "password": "Password123!",       // ✅
  "firstName": "Usuario",           // ✅
  "lastName": "Test",              // ✅
  "age": 25                        // ✅
}
```

### **1. Verificar Request en DevTools**
```javascript
// En Network tab, verificar que el payload sea:
{
  "email": "test@example.com",
  "password": "Password123!",
  "firstName": "Test", 
  "lastName": "User",
  "age": 25,
  // username opcional
}
```

### **2. Headers Correctos**
```javascript
Content-Type: application/json
Accept: application/json
```

### **3. Endpoint Correcto**
```
POST https://pi-mp-2-back-prod.onrender.com/api/auth/register
```

---

## 📋 **CHECKLIST FINAL**

Antes de implementar, verificar:

- [ ] ✅ Usar nombres de campos exactos: `email`, `password`, `firstName`, `lastName`, `age`
- [ ] ✅ Campo `username` es opcional - no enviar si está vacío
- [ ] ✅ Convertir `age` a número con `parseInt()`
- [ ] ✅ Validar password con regex correcta
- [ ] ✅ Manejar respuestas 201 (éxito), 400 (validación), 409 (duplicado)
- [ ] ✅ Usar Content-Type: application/json
- [ ] ✅ URL correcta del endpoint

---

## 📞 **CONTACTO TÉCNICO**

Si hay problemas de integración:

1. **Verificar Network tab** en DevTools
2. **Comprobar payload exacto** que se está enviando
3. **Validar headers** de la petición
4. **Revisar respuesta del servidor** para errores específicos

**Backend Repository**: https://github.com/Unyfilm/PI-MP--2-BACK
**Backend URL**: https://pi-mp-2-back-prod.onrender.com

---

## 🚀 **SOLUCIÓN RÁPIDA PARA FRONTEND**

**El problema del error 400 se soluciona cambiando los nombres de campos en el frontend:**

```javascript
// CAMBIAR ESTO en el frontend:
const payload = {
  correo: formData.correo,           // ❌ CAMBIAR por "email"
  contraseña: formData.contraseña,   // ❌ CAMBIAR por "password"  
  nombre: formData.nombre,           // ❌ CAMBIAR por "firstName"
  apellido: formData.apellido,       // ❌ CAMBIAR por "lastName"
  edad: parseInt(formData.edad)      // ❌ CAMBIAR por "age"
};

// POR ESTO:
const payload = {
  email: formData.correo,            // ✅ CORRECTO
  password: formData.contraseña,     // ✅ CORRECTO
  firstName: formData.nombre,        // ✅ CORRECTO  
  lastName: formData.apellido,       // ✅ CORRECTO
  age: parseInt(formData.edad)       // ✅ CORRECTO
};
```

**O mejor aún, cambiar también los nombres de los campos del formulario para que coincidan:**

```html
<!-- CAMBIAR los name attributes del formulario -->
<input name="email" type="email" />        <!-- en lugar de "correo" -->
<input name="password" type="password" />  <!-- en lugar de "contraseña" -->
<input name="firstName" type="text" />     <!-- en lugar de "nombre" -->  
<input name="lastName" type="text" />      <!-- en lugar de "apellido" -->
<input name="age" type="number" />         <!-- en lugar de "edad" -->
```

---

**Documento generado**: Octubre 17, 2025  
**Versión del Backend**: v2.1.0 (Username Opcional)