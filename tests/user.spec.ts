import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';
import { Page } from 'playwright';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '7', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'a@jwt.com': {id : '1', name: '常用名字', email:'a@jwt.com', password: 'admin', roles: [{role: Role.Admin}]},
    'testUser11@jwt.com': {id: '283', name: 'testUser11', email: 'testUser11@jwt.com', password: 'testUser11Pass', roles: [{role: Role.Franchisee}]},
    'f@jwt.com': {id: '3', name: 'pizza franchisee', email: 'f@jwt.com', password: 'franchisee', roles: [{ objectId: '7', role: Role.Franchisee}]},
    'user@jwt.com': {id: '4', name: 'pizza diner', email: 'user@jwt.com', password: 'diner', roles: [{ role: Role.Diner }]}}; 


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

  await page.route('*/**/api/user/me', async (route) => {
    if (route.request().method() === 'GET' ){
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: loggedInUser });
    }

  });

  await page.route('*/**/api/user/4', async (route) => {
    if( route.request().method() === 'PUT' ){
      const updateReq = route.request().postDataJSON();
      const updateUser = { ...loggedInUser, ...updateReq, roles: loggedInUser?.roles };
      const updatedToken = 'mockedToken';
      validUsers[updateUser.email].name = 'pizza dinerx';
      await route.fulfill({status:200, json: { user: updateUser, token: updatedToken } });
    }
  });
}


test('updateUser', async ({ page }) => {
  await basicInit(page);

  const email = `user@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza diner');
  
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});