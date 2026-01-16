import { test, expect } from '@playwright/test';

test.describe('Gender Reveal App - Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Page principale se charge correctement', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Fille ou Garçon');
    await expect(page.locator('input[placeholder*="prénom"]')).toBeVisible();
    await expect(page.locator('button:has-text("Fille"), button:has-text("Garçon")')).toHaveCount(2);
  });

  test('Sélection du genre fonctionne visuellement', async ({ page }) => {
    const girlButton = page.locator('button:has-text("Fille")').first();
    await girlButton.click();
    await expect(girlButton).toHaveClass(/border-pink-500|bg-pink-50/);
    
    const boyButton = page.locator('button:has-text("Garçon")').first();
    await boyButton.click();
    await expect(boyButton).toHaveClass(/border-blue-500|bg-blue-50/);
  });

  test('Sliders de poids et taille fonctionnent', async ({ page }) => {
    // Remplir nom et sélectionner genre pour aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Jean');
    await page.locator('button:has-text("Garçon")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    
    // L'étape 2 s'affiche - les sliders sont maintenant visibles
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    const firstSlider = page.locator('input[type="range"]').first();
    await firstSlider.waitFor({ state: 'visible', timeout: 5000 });
    
    // Modifier le slider
    await page.evaluate(() => {
      const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
      if (slider) {
        slider.value = '3500';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await expect(page.locator('text=/3500.*g/')).toBeVisible();
  });

  test('Palette de couleurs cheveux fonctionne', async ({ page }) => {
    // Aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Marie');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    
    // Vérifier que la palette est visible à l'étape 2
    await expect(page.locator('text=Couleur des cheveux')).toBeVisible({ timeout: 5000 });
    const blondButton = page.locator('button[aria-label="Cheveux: Blonds"]');
    await blondButton.click();
    await expect(blondButton).toHaveClass(/ring-purple-400/);
  });

  test('Avatar bébé affiche avec les couleurs sélectionnées', async ({ page }) => {
    // Aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Sophie');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    
    // Attendre que l'étape 2 soit affichée
    await page.waitForSelector('text=Fais tes pronostics', { timeout: 5000 });
    
    // Sélectionner les couleurs
    await page.locator('button[aria-label="Cheveux: Roux"]').click();
    await page.locator('button[aria-label="Yeux: Verts"]').click();
    
    // Vérifier l'aperçu
    await expect(page.locator('text=Aperçu')).toBeVisible();
    // L'avatar doit être visible (chercher le composant BabyAvatar)
    const avatar = page.locator('svg').filter({ hasText: /^$/ }).first(); // SVG de l'avatar
    await expect(avatar).toBeVisible();
  });

  test('Email optionnel à l\'étape 2 fonctionne', async ({ page }) => {
    // Aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Jean Dupont');
    await page.locator('button:has-text("Garçon")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    
    // L'étape 2 s'affiche
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 5000 });
    
    // Remplir les champs obligatoires
    await page.locator('input[type="date"]').fill('2025-01-15');
    await page.locator('input[type="time"]').fill('14:30');
    
    // Remplir les sliders
    await page.evaluate(() => {
      const sliders = document.querySelectorAll('input[type="range"]');
      if (sliders.length >= 2) {
        (sliders[0] as HTMLInputElement).value = '3500';
        sliders[0].dispatchEvent(new Event('input', { bubbles: true }));
        (sliders[1] as HTMLInputElement).value = '50';
        sliders[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Sélectionner les couleurs
    await page.locator('button[title="Bruns"]').click();
    await page.locator('button[title="Bleus"]').click();
    await page.waitForTimeout(300);
    
    // Vérifier que le champ email est visible dans l'étape 2
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    
    // Le bouton "Envoyer mon vote" doit être activé même sans email
    const submitButton = page.locator('button:has-text("Envoyer mon vote")');
    await expect(submitButton).toBeEnabled();
  });

  test('Symboles de genre sont affichés correctement', async ({ page }) => {
    const femaleSymbol = page.locator('text=♀').first();
    const maleSymbol = page.locator('text=♂').first();
    await expect(femaleSymbol).toBeVisible();
    await expect(maleSymbol).toBeVisible();
  });
});

test.describe('Page de statistiques', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/results');
  });

  test('Page de résultats se charge', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Statistiques|Résultats/);
  });

  test('Symboles dans les stats', async ({ page }) => {
    const symbols = page.locator('div:has-text("♀"), div:has-text("♂")');
    await expect(symbols.first()).toBeVisible();
  });

  test('Portrait moyen affiché si votes existent', async ({ page }) => {
    const portraitSection = page.locator('text=Portrait moyen');
    const hasVotes = await page.locator('text=/\\d+ votes/').count() > 0;
    
    if (hasVotes) {
      await expect(portraitSection).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('Mobile viewport fonctionne', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="prénom"]')).toBeVisible();
  });

  test('Tablet viewport fonctionne', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Fille")').first()).toBeVisible();
  });
});
