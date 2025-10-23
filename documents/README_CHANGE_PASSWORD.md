# 🔐 **CAMBIO DE CONTRASEÑA - DOCUMENTACIÓN ENDPOINT `/change-password`**

## 🎯 **Resumen Ejecutivo**

Este documento detalla el endpoint `/api/users/change-password` para usuarios **autenticados** que desean cambiar su contraseña desde dentro de la plataforma (perfil, configuración, etc.).

**🚨 DIFERENCIA IMPORTANTE**: Este NO es para "olvidé mi contraseña", sino para cambio voluntario con contraseña actual.

---

## 🔧 **ESPECIFICACIÓN TÉCNICA**

### **📍 Endpoint**
```http
PUT /api/users/change-password
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### **🔐 Autenticación Requerida**
- ✅ **JWT Token válido** en header Authorization
- ✅ Usuario debe estar **activo** en la base de datos
- ✅ Token debe **no estar expirado** (7 días por defecto)

### **📤 Request Body**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;    // Contraseña actual del usuario
  newPassword: string;        // Nueva contraseña deseada
  confirmPassword: string;    // Confirmación de nueva contraseña
}
```

### **✅ Ejemplo de Petición Completa**
```javascript
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const token = localStorage.getItem('token'); // O desde tu estado global
  
  const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword,
      newPassword, 
      confirmPassword
    })
  });
  
  return await response.json();
};

// Uso:
await changePassword("MiPasswordActual123!", "NuevoPassword456!", "NuevoPassword456!");
```

---

## 📨 **RESPUESTAS DEL SERVIDOR**

### **✅ Éxito (200)**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

### **❌ Errores Posibles**

#### **401 - No Autenticado**
```json
{
  "success": false,
  "message": "Usuario no autenticado",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

#### **400 - Campos Faltantes**
```json
{
  "success": false,
  "message": "Todos los campos son requeridos",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

#### **400 - Contraseñas No Coinciden**
```json
{
  "success": false,
  "message": "Las contraseñas no coinciden",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

#### **400 - Nueva Contraseña Débil**
```json
{
  "success": false,
  "message": "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

#### **400 - Contraseña Actual Incorrecta**
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

#### **400 - Nueva Contraseña Igual a la Actual**
```json
{
  "success": false,
  "message": "La nueva contraseña debe ser diferente a la actual",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

#### **404 - Usuario No Encontrado**
```json
{
  "success": false,
  "message": "Usuario no encontrado",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

---

## 🏗️ **IMPLEMENTACIÓN FRONTEND REACT + VITE**

### **1. 🎛️ Componente Cambio de Contraseña**

```jsx
// components/ChangePassword.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Tu contexto de auth

const ChangePassword = () => {
  const { token, logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validaciones client-side
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (!validatePassword(formData.newPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo');
      return;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Opcional: Logout automático para re-login con nueva contraseña
        setTimeout(() => {
          alert('Contraseña cambiada. Inicia sesión nuevamente.');
          logout();
        }, 2000);
        
      } else {
        setError(data.message || 'Error al cambiar contraseña');
        
        // Si es error de autenticación, hacer logout
        if (response.status === 401) {
          logout();
        }
      }
    } catch (error) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-form">
      <h2>Cambiar Contraseña</h2>
      
      {success && (
        <div className="success-message">
          ✅ Contraseña actualizada exitosamente
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Contraseña Actual:</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            placeholder="Ingresa tu contraseña actual"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">Nueva Contraseña:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="Nueva contraseña"
            required
          />
          <small>Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirmar nueva contraseña"
            required
          />
        </div>
        
        {error && <div className="error-message">❌ {error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
```

### **2. 🎨 CSS Opcional**

```css
/* components/ChangePassword.css */
.change-password-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}
```

### **3. 🔗 Integración en Perfil/Configuración**

```jsx
// components/UserProfile.jsx
import { useState } from 'react';
import ChangePassword from './ChangePassword';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="user-profile">
      <nav className="profile-tabs">
        <button 
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'active' : ''}
        >
          Perfil
        </button>
        <button 
          onClick={() => setActiveTab('password')}
          className={activeTab === 'password' ? 'active' : ''}
        >
          Cambiar Contraseña
        </button>
      </nav>
      
      <div className="tab-content">
        {activeTab === 'profile' && (
          <div>
            {/* Otros datos del perfil */}
          </div>
        )}
        
        {activeTab === 'password' && (
          <ChangePassword />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
```

---

## 🔒 **VALIDACIONES Y SEGURIDAD**

### **🛡️ Validaciones del Backend**

1. **Autenticación**: Token JWT válido y no expirado
2. **Contraseña Actual**: Debe coincidir con la almacenada en BD
3. **Nueva Contraseña**: Mínimo 8 chars, mayúscula, minúscula, número, símbolo
4. **Confirmación**: Nueva contraseña === confirmación
5. **Diferencia**: Nueva contraseña ≠ contraseña actual
6. **Usuario Activo**: Usuario debe existir y estar activo

### **⚡ Flujo de Seguridad**

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    U->>F: Llena formulario cambio contraseña
    F->>F: Validación client-side
    F->>B: PUT /change-password + JWT
    B->>B: Verificar JWT token
    B->>DB: Buscar usuario por ID del token
    B->>B: Verificar contraseña actual
    B->>B: Validar nueva contraseña
    B->>DB: Hashear y guardar nueva contraseña
    B->>F: Respuesta exitosa
    F->>U: Mostrar éxito + opcional logout
```

---

## 🧪 **TESTING Y CASOS DE PRUEBA**

### **📋 Test Cases**

#### **Test 1: Cambio exitoso**
```javascript
const testSuccessfulChange = async () => {
  const response = await changePassword(
    "CurrentPass123!",  // Contraseña actual correcta
    "NewPassword456!",  // Nueva contraseña válida
    "NewPassword456!"   // Confirmación igual
  );
  
  expect(response.success).toBe(true);
  expect(response.message).toBe("Contraseña actualizada exitosamente");
};
```

#### **Test 2: Contraseña actual incorrecta**
```javascript
const testWrongCurrentPassword = async () => {
  const response = await changePassword(
    "WrongPassword999!",  // Contraseña actual incorrecta
    "NewPassword456!",
    "NewPassword456!"
  );
  
  expect(response.success).toBe(false);
  expect(response.message).toBe("La contraseña actual es incorrecta");
};
```

#### **Test 3: Nueva contraseña débil**
```javascript
const testWeakNewPassword = async () => {
  const response = await changePassword(
    "CurrentPass123!",
    "weak",  // Contraseña débil
    "weak"
  );
  
  expect(response.success).toBe(false);
  expect(response.message).toBe("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo");
};
```

#### **Test 4: Sin autenticación**
```javascript
const testNoAuth = async () => {
  // Petición sin token Authorization
  const response = await fetch('/api/users/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentPassword: "CurrentPass123!",
      newPassword: "NewPassword456!",
      confirmPassword: "NewPassword456!"
    })
  });
  
  expect(response.status).toBe(401);
};
```

### **🔍 Debugging en DevTools**

**1. Verificar Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**2. Verificar Request Payload:**
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**3. Códigos de respuesta esperados:**
- `200` - Éxito
- `400` - Error de validación 
- `401` - No autenticado/token inválido
- `404` - Usuario no encontrado
- `500` - Error del servidor

---

## 🚨 **ERRORES COMUNES Y SOLUCIONES**

### **❌ Error 1: "Usuario no autenticado"**
**Causas:**
- Token no enviado en headers
- Token malformado
- Token expirado
- Token revocado/invalidado

**Solución Frontend:**
```javascript
// Verificar token antes de la petición
const token = localStorage.getItem('token');
if (!token) {
  // Redirect a login
  return;
}

// Manejar error 401
if (response.status === 401) {
  localStorage.removeItem('token');
  // Redirect a login
}
```

### **❌ Error 2: "La contraseña actual es incorrecta"**
**Causa:** Usuario escribió mal su contraseña actual

**Solución UX:**
```javascript
// Mostrar mensaje específico
if (data.message === "La contraseña actual es incorrecta") {
  setError("Contraseña actual incorrecta. Verifica que esté bien escrita.");
  // Opcional: Focus en campo de contraseña actual
  document.getElementById('currentPassword').focus();
}
```

### **❌ Error 3: CORS o conexión**
**Causa:** Problemas de red o configuración CORS

**Solución:**
```javascript
try {
  const response = await changePassword(...);
} catch (error) {
  if (error.name === 'TypeError') {
    setError('Error de conexión. Verifica tu conexión a internet.');
  } else {
    setError('Error inesperado. Intenta de nuevo.');
  }
}
```

---

## ⚙️ **CONFIGURACIÓN NECESARIA**

### **🔐 Variables de Entorno Backend**
```bash
JWT_SECRET=tu_jwt_secret_de_32_caracteres_minimo
JWT_EXPIRES_IN=7d
```

### **⚛️ Variables de Entorno Frontend**
```bash
# .env
VITE_API_URL=https://pi-mp-2-back-prod.onrender.com

# .env.local (desarrollo) 
VITE_API_URL=http://localhost:5000
```

### **🎯 Context de Autenticación (Recomendado)**
```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    // Redirect a login
  };

  return (
    <AuthContext.Provider value={{ token, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **Backend (Ya implementado) ✅**
- [ ] ✅ Endpoint `PUT /api/users/change-password`
- [ ] ✅ Middleware de autenticación
- [ ] ✅ Validación de contraseña actual
- [ ] ✅ Validación de nueva contraseña
- [ ] ✅ Hasheo automático de contraseña
- [ ] ✅ Manejo de errores completo

### **Frontend (Por implementar)**
- [ ] Componente `ChangePassword.jsx`
- [ ] Validación client-side de contraseñas
- [ ] Integración con contexto de autenticación
- [ ] Manejo de estados (loading, error, success)
- [ ] UX para errores específicos
- [ ] Integración en página de perfil/configuración
- [ ] CSS/estilos
- [ ] Testing de casos de uso

### **Testing**
- [ ] Probar cambio exitoso
- [ ] Probar contraseña actual incorrecta  
- [ ] Probar nueva contraseña débil
- [ ] Probar sin autenticación
- [ ] Probar con token expirado

---

## 📞 **CONTACTO TÉCNICO**

**Para problemas de integración:**

1. **Autenticación**: Verificar token JWT en LocalStorage
2. **Validación**: Revisar que contraseña cumpla regex
3. **Network**: Verificar headers Authorization en DevTools
4. **Backend logs**: Revisar consola Render para errores del servidor

**Endpoint de producción**: `PUT https://pi-mp-2-back-prod.onrender.com/api/users/change-password`

**Repositorio**: https://github.com/Unyfilm/PI-MP--2-BACK

---

**Documento creado**: Octubre 17, 2025  
**Versión del Backend**: v2.1.0 (Change Password Endpoint)