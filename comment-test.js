/**
 * Test script for Comments API endpoints
 * Run this after starting the server with: npm run dev
 */

const API_BASE = 'http://localhost:5000';

// Test data
const testUser = {
  email: 'user@example.com',
  password: 'User123!'
};

const testComment = {
  content: 'Esta película es increíble! Me encantó la actuación y los efectos visuales.'
};

let userToken = '';
let movieId = '';
let commentId = '';

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`\n📍 ${config.method || 'GET'} ${endpoint}`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response:`, JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Error in ${endpoint}:`, error.message);
    return { error };
  }
}

/**
 * Test suite for Comments API
 */
async function runCommentTests() {
  console.log('🧪 INICIANDO TESTS DEL SISTEMA DE COMENTARIOS\n');
  console.log('=' .repeat(60));

  // 1. Login to get token
  console.log('\n🔐 STEP 1: Authenticating user...');
  const loginResult = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });

  if (loginResult.data?.success) {
    userToken = loginResult.data.token;
    console.log('✅ Login successful');
  } else {
    console.log('❌ Login failed - creating user first...');
    
    // Try to register user
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...testUser,
        firstName: 'Test',
        lastName: 'User',
        age: 25
      })
    });

    // Try login again
    const retryLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });

    if (retryLogin.data?.success) {
      userToken = retryLogin.data.token;
      console.log('✅ Login successful after registration');
    } else {
      console.log('❌ Could not authenticate user');
      return;
    }
  }

  // 2. Get a movie ID
  console.log('\n🎬 STEP 2: Getting movie ID...');
  const moviesResult = await apiRequest('/api/movies?limit=1', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  if (moviesResult.data?.success && moviesResult.data.data.length > 0) {
    movieId = moviesResult.data.data[0].id || moviesResult.data.data[0]._id;
    console.log(`✅ Got movie ID: ${movieId}`);
  } else {
    console.log('❌ No movies found - please seed database first');
    return;
  }

  // 3. Create a comment
  console.log('\n💬 STEP 3: Creating comment...');
  const createResult = await apiRequest('/api/comments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({
      movieId,
      content: testComment.content
    })
  });

  if (createResult.data?.success) {
    commentId = createResult.data.data.id || createResult.data.data._id;
    console.log('✅ Comment created successfully');
  } else {
    console.log('❌ Failed to create comment');
    return;
  }

  // 4. Get movie comments (public)
  console.log('\n📄 STEP 4: Getting movie comments (public)...');
  await apiRequest(`/api/comments/movie/${movieId}?page=1&limit=5`);

  // 5. Get user's own comments
  console.log('\n👤 STEP 5: Getting my comments...');
  await apiRequest('/api/comments/me?page=1&limit=5', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  // 6. Get specific comment
  console.log('\n👁️ STEP 6: Getting specific comment...');
  await apiRequest(`/api/comments/${commentId}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  // 7. Update comment
  console.log('\n✏️ STEP 7: Updating comment...');
  await apiRequest(`/api/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({
      content: 'Comentario actualizado: Esta película es una obra maestra del cine moderno.'
    })
  });

  // 8. Test validation errors
  console.log('\n🛡️ STEP 8: Testing validation (should fail)...');
  
  // Empty content
  await apiRequest('/api/comments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({
      movieId,
      content: ''
    })
  });

  // Content too long
  await apiRequest('/api/comments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({
      movieId,
      content: 'a'.repeat(201) // 201 characters
    })
  });

  // Invalid movie ID
  await apiRequest('/api/comments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({
      movieId: 'invalid_id',
      content: 'Test comment'
    })
  });

  // 9. Delete comment
  console.log('\n🗑️ STEP 9: Deleting comment...');
  await apiRequest(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  // 10. Verify comment is deleted
  console.log('\n🔍 STEP 10: Verifying comment is deleted...');
  await apiRequest(`/api/comments/${commentId}`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 COMMENT SYSTEM TESTS COMPLETED!');
  console.log('✅ Check the logs above to verify all endpoints are working');
  console.log('💡 Tip: Run "npm run db:seed" first to ensure you have test data');
}

// Export for Node.js usage
if (typeof module !== 'undefined') {
  module.exports = { runCommentTests };
}

// Run immediately if called directly
if (typeof window === 'undefined' && require.main === module) {
  runCommentTests().catch(console.error);
}

console.log(`
📋 COMMENT SYSTEM TEST SCRIPT
=============================

To run this test:

1. Make sure your server is running:
   npm run dev

2. Ensure you have test data:
   npm run db:seed

3. Run this script:
   node comment-test.js

Or copy the functions above to test in browser console.

🎯 This will test all comment endpoints:
   - Create comment
   - Get movie comments (public)
   - Get user comments
   - Get specific comment
   - Update comment
   - Delete comment
   - Validation errors
`);