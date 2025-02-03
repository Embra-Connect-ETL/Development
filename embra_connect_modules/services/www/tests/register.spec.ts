import { before, describe } from 'node:test';
import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

let registerUrl = 'https://embraconnect.onrender.com/pages/register/index.html';


describe("User Registration Tests", ()=>{
    let userEmail: string = faker.internet.email();
    

    test('Should show a toast message when user clicks register button without providing email and password', async ({ page }) => {
      await page.goto(registerUrl);
      await page.locator('#registeration-btn').click();
      expect(await page.locator('.toastify').textContent()).toBe('Email and password cannot be empty.');
        
    });
    
    test('Should show a toast message when user provide only the email address', async ({ page }) => {
      await page.goto(registerUrl);
      await page.locator('#email').fill('random.email@example.com');
      await page.locator('#registeration-btn').click();
      expect(await page.locator('.toastify').textContent()).toBe('Email and password cannot be empty.');
        
    });
    
    
    test('Should show a toast message when user provide only the password', async ({ page }) => {
      await page.goto(registerUrl);
      await page.locator('#password').fill('Test@12345');
      await page.locator('#registeration-btn').click();
      expect(await page.locator('.toastify').textContent()).toBe('Email and password cannot be empty.');
        
    });

    // test('Should reject user input if email provided is not a valid email address', async({ page })=>{
    //   await page.goto(registerUrl);
    //   await page.locator('#email').fill('Random');
    //   await page.locator('#password').fill('Test@12345');
    //   await page.locator('#registeration-btn').click();
    //   expect(await page.locator('.toastify').textContent()).toBe('Invalid email address format.');
    // })

    test('should create a new user if user input passes validation checks', async({page})=>{
      await page.goto(registerUrl);
      await page.locator('#email').fill(userEmail);
      await page.locator('#password').fill('Test@12345');
      await page.locator('#registeration-btn').click();
      expect(await page.locator('.toastify').textContent()).toBe('User registered!');
      await page.waitForTimeout(6000);
      expect(await page.url()).toBe('https://embraconnect.onrender.com/pages/login/index.html');
    });

    test('should show a toast warning the user of registration of an already registered email address', async({page})=>{
      await page.goto(registerUrl);
      await page.locator('#email').fill(userEmail);
      await page.locator('#password').fill('Test@12345');
      await page.locator('#registeration-btn').click();
      expect(await page.locator('.toastify').textContent()).toBe('A user with this email already exists');
    });


    })
    

  

