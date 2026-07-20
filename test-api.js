const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting API tests...\n');

  try {
    // 1. Test GET /api/products
    console.log('Testing GET /api/products...');
    const productsRes = await fetch(`${BASE_URL}/api/products`);
    const products = await productsRes.json();
    if (productsRes.ok && Array.isArray(products)) {
      console.log(`✅ Success: Found ${products.length} products.\n`);
    } else {
      throw new Error(`Failed to load products: ${JSON.stringify(products)}`);
    }

    // 2. Test GET /api/products?search=Samsung
    console.log('Testing search query (GET /api/products?search=Samsung)...');
    const searchRes = await fetch(`${BASE_URL}/api/products?search=Samsung`);
    const searchResult = await searchRes.json();
    if (searchRes.ok && searchResult.length > 0) {
      console.log(`✅ Success: Found search match: "${searchResult[0].name}"\n`);
    } else {
      throw new Error(`Failed search test: ${JSON.stringify(searchResult)}`);
    }

    // 3. Test POST /api/auth/register
    const randomEmail = `user_${Math.floor(Math.random() * 1000000)}@example.com`;
    console.log(`Testing POST /api/auth/register with email: ${randomEmail}...`);
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'API Test User',
        email: randomEmail,
        password: 'testPassword123'
      })
    });
    const authData = await registerRes.json();
    if (registerRes.ok && authData.token) {
      console.log(`✅ Success: Registered successfully. Token received: ${authData.token.substring(0, 10)}...\n`);
    } else {
      throw new Error(`Failed registration: ${JSON.stringify(authData)}`);
    }

    // 4. Test GET /api/orders (Authenticated)
    console.log('Testing GET /api/orders (Authenticated)...');
    const ordersRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`
      }
    });
    const orders = await ordersRes.json();
    if (ordersRes.ok && Array.isArray(orders)) {
      console.log(`✅ Success: Loaded authenticated orders list (length: ${orders.length}).\n`);
    } else {
      throw new Error(`Failed authenticated orders fetch: ${JSON.stringify(orders)}`);
    }

    // 5. Test POST /api/checkout (Authenticated)
    console.log('Testing POST /api/checkout (Authenticated)...');
    const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({
        total: 420000,
        items: [
          { id: 'ps5-standard', price: 420000, quantity: 1 }
        ]
      })
    });
    const checkoutResult = await checkoutRes.json();
    if (checkoutRes.ok && checkoutResult.success) {
      console.log(`✅ Success: Checked out successfully! Order ID: ${checkoutResult.order.id}\n`);
    } else {
      throw new Error(`Failed checkout: ${JSON.stringify(checkoutResult)}`);
    }

    console.log('🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

runTests();
