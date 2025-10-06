// import { test, expect } from '@playwright/test' <- Replace this with the line below
import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';
import { Page } from 'playwright';

const washingtonArea = { id: 7, name: 'Washington Area', admin: [{id: '3', name: 'pizza franchisee', email: 'f@jwt.com'}], stores: [{id: 1, name: 'Test', totalRevenue: 0}]}

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  let franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };

  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '7', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'a@jwt.com': {id : '1', name: '常用名字', email:'a@jwt.com', password: 'admin', roles: [{role: Role.Admin}]},
    'testUser11@jwt.com': {id: '283', name: 'testUser11', email: 'testUser11@jwt.com', password: 'testUser11Pass', roles: [{role: Role.Franchisee}]},
    'f@jwt.com': {id: '3', name: 'pizza franchisee', email: 'f@jwt.com', password: 'franchisee', roles: [{ objectId: '7', role: Role.Franchisee}]} };
  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 200, json: {message: 'logout successful'} });
      return;
    }
    if(route.request().method() === 'POST') {
      let registerReq = route.request().postDataJSON();
      const { name, email, password } = registerReq || {};
      if (!name || !email || !password) {
        await route.fulfill({ status: 400, json: { message: 'name, email, and password are required' } });
        return;
      }
      const newUser: User = {
        id: '4',
        name,
        email,
        password,
        roles: [{ role: Role.Diner }]
      };

      loggedInUser = newUser;

      const token = 'testToken';
      await route.fulfill({ status: 200, json: { user: newUser, token } });
      return;
    }
    if(route.request().method() === 'PUT') {
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
        return;
      }
      loggedInUser = validUsers[loginReq.email];
      const loginRes = {
        user: loggedInUser,
        token: 'abcdef',
      };
      await route.fulfill({ json: loginRes });
    }
    
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    
    if(route.request().method() === 'POST') {
      franchiseRes.franchises.push(washingtonArea)
      await route.fulfill({ json: franchiseRes });
    }
    if(route.request().method() === 'DELETE') {
      franchiseRes.franchises = franchiseRes.franchises.filter(f => f.id !== washingtonArea.id);
    }
    if(route.request().method() === 'GET') {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    }
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };

    if(route.request().method() === 'GET') {
      await route.fulfill({json: orderRes})
      return;
    }
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}

async function login(page: Page) {
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
}

async function loginAdmin(page: Page) {
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
}

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await login(page);

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('logout', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await login(page);

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();

  //Logout
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

test('register', async ({ page }) => {
  await basicInit(page);

  //Register new user
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('testUser11');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('testUser11@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('testUser11Pass');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});

test('create and close franchise', async ({ page }) => {
  test.setTimeout(500000);
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await loginAdmin(page);

  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();

  await page.getByRole('link', { name: 'Admin' }).click();

  await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();

  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('Washington Area');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('testUser11@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('cell', { name: 'Washington Area' })).toBeVisible();

  await page.getByRole('row', { name: 'Washington Area' }).getByRole('button').click();
  
  await expect(page.getByText('Sorry to see you go')).toBeVisible();


  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
});

test('create Store and close store', async ({page}) => {
  //await basicInit(page);

  const loginReq = {email: "f@jwt.com", password: "franchisee"};
  const loginRes = {user: {id: 3,name: 'pizza franchisee',email: 'f@jwt.com',roles: [{ objectId: 7, role: 'franchisee' }]}, token: 'ttttt'};
  // const logoutReq = { token: 'ttttt' };
  // const logoutResponse = { message: 'logout successful' };

  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    // } else if (route.request().method() === 'DELETE') {
    //   expect(route.request().headers()['authorization']).toBe(`Bearer ${logoutReq.token}`);
    //   await route.fulfill({ json: logoutResponse });
    }
  });

  await page.route('*/**/api/franchise/3', async (route) => {
    if(route.request().method() === 'GET'){
      await route.fulfill({json: [washingtonArea]})
    }
  });

  await page.route('*/**/api/franchise/7/store', async (route) => {
    if(route.request().method() === 'POST'){
      washingtonArea.stores.push({id: 1, name: 'The Best', totalRevenue: 0})
      await route.fulfill({json: washingtonArea})
    }
  });

  await page.route('*/**/api/franchise/7/store/1', async (route) => {
    if(route.request().method() === 'DELETE'){
      washingtonArea.stores = washingtonArea.stores.filter(s => s.id !== 1);
      await route.fulfill({json: {message: 'store deleted'}})
    }
  });

  await page.goto('/');

  await page.getByRole('link', {name: 'Login'}).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', {name: 'Logout'})).toBeVisible();
  await page.getByLabel('Global').getByRole('link', {name: 'Franchise'}).click();
  
  await expect(page.getByRole('link', {name: 'franchise-dashboard'})).toBeVisible();
  await expect(page.getByRole('heading')).toContainText('Washington Area');
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('The Best');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('cell', { name: 'The Best' })).toBeVisible();
  await page.getByRole('row', { name: 'The Best 0 ₿ Close' }).getByRole('button').click();
  await expect(page.getByText('Are you sure you want to')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
});

test('visit pages', async ({page}) => {
  await basicInit(page);

  await page.getByRole('link', {name: 'About'}).click();
  await expect(page.getByText('The Secret sauce')).toBeVisible();
  await page.getByRole('link', {name: 'History'}).click();
  await expect(page.getByText('Mama Rucci')).toBeVisible();
  await page.getByLabel('Global').getByRole('link', {name: 'Franchise'}).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Login' }).click();
  await loginAdmin(page);
  await page.getByRole('link', {name: '常'}).click();
});