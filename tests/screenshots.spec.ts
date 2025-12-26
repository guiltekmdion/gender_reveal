import { test } from '@playwright/test';

test.describe('Captures d\'écran pour la documentation', () => {
  test('Page principale - Vue initiale', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'docs/screenshots/01-page-principale.png', fullPage: true });
  });

  test('Page principale - Genre sélectionné (Fille)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Fille")').first().click();
    await page.screenshot({ path: 'docs/screenshots/02-selection-fille.png', fullPage: true });
  });

  test('Page principale - Genre sélectionné (Garçon)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Garçon")').first().click();
    await page.screenshot({ path: 'docs/screenshots/03-selection-garcon.png', fullPage: true });
  });

  test('Modal - Prédictions avancées', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Remplir et ouvrir la modal
    await page.locator('input[placeholder*="prénom"]').fill('Sophie Martin');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Valider mon vote")').click();
    
    // Attendre l'animation
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/screenshots/04-modal-predictions.png', fullPage: true });
  });

  test('Modal - Prédictions avec couleurs sélectionnées', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[placeholder*="prénom"]').fill('Sophie Martin');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Valider mon vote")').click();
    await page.waitForTimeout(500);
    
    // Sélectionner des couleurs
    await page.locator('button[aria-label="Cheveux: Roux"]').click();
    await page.locator('button[aria-label="Yeux: Verts"]').click();
    
    // Scroller vers le bas pour voir l'aperçu
    await page.evaluate(() => {
      const modal = document.querySelector('.overflow-y-auto');
      if (modal) modal.scrollTop = modal.scrollHeight;
    });
    await page.waitForTimeout(300);
    
    await page.screenshot({ path: 'docs/screenshots/05-modal-predictions-couleurs.png', fullPage: true });
  });

  test('Modal - Email', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[placeholder*="prénom"]').fill('Marc Dubois');
    await page.locator('button:has-text("Garçon")').first().click();
    await page.locator('button:has-text("Valider mon vote")').click();
    await page.waitForTimeout(500);
    
    // Remplir tous les champs obligatoires de la modale de prédictions
    await page.locator('input[type="date"]').fill('2025-01-15');
    await page.locator('input[type="time"]').fill('14:30');
    
    // Remplir les sliders
    await page.evaluate(() => {
      const sliders = document.querySelectorAll('input[type="range"]');
      if (sliders.length >= 2) {
        (sliders[0] as HTMLInputElement).value = '3500';
        sliders[0].dispatchEvent(new Event('input', { bubbles: true }));
        sliders[0].dispatchEvent(new Event('change', { bubbles: true }));
        
        (sliders[1] as HTMLInputElement).value = '50';
        sliders[1].dispatchEvent(new Event('input', { bubbles: true }));
        sliders[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await page.waitForTimeout(300);
    
    // Sélectionner la couleur des cheveux (Bruns)
    await page.locator('button[title="Bruns"]').click();
    
    // Sélectionner la couleur des yeux (Bleus)
    await page.locator('button[title="Bleus"]').click();
    
    await page.waitForTimeout(300);
    
    // Cliquer sur Continuer avec force si disabled
    await page.locator('button:has-text("Continuer")').click({ force: true });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'docs/screenshots/06-modal-email.png', fullPage: true });
  });

  test('Page résultats - Statistiques', async ({ page }) => {
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'docs/screenshots/07-page-resultats.png', fullPage: true });
  });

  test('Page admin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'docs/screenshots/08-page-admin.png', fullPage: true });
  });

  test('Mobile - Page principale', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'docs/screenshots/09-mobile-principale.png', fullPage: true });
  });

  test('Mobile - Modal prédictions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[placeholder*="prénom"]').fill('Alice');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Valider mon vote")').click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'docs/screenshots/10-mobile-modal.png', fullPage: true });
  });
});
