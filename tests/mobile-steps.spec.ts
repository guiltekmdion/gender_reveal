import { test, expect } from '@playwright/test';

test.describe('Système d\'étapes mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Étape 1 : Nom et choix sont visibles par défaut', async ({ page }) => {
    await expect(page.locator('input[placeholder*="prénom"]')).toBeVisible();
    await expect(page.locator('button:has-text("Fille")')).toBeVisible();
    await expect(page.locator('button:has-text("Garçon")')).toBeVisible();
    // Le sticky footer avec "Suivant" doit être visible
    await expect(page.locator('button:has-text("Suivant")')).toBeVisible();
  });

  test('Navigation vers l\'étape 2 après validation étape 1', async ({ page }) => {
    // Remplir l'étape 1
    await page.locator('input[placeholder*="prénom"]').fill('Jean');
    await page.locator('button:has-text("Garçon")').first().click();
    
    // Cliquer sur Suivant
    await page.locator('button:has-text("Suivant")').click();
    
    // Vérifier qu'on est à l'étape 2
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Étape 2 sur 3')).toBeVisible();
    // Le bouton Retour doit être visible
    await expect(page.locator('button:has-text("Retour")')).toBeVisible();
  });

  test('Validation étape 1 : ne peut pas passer sans nom', async ({ page }) => {
    // Sélectionner seulement le genre
    await page.locator('button:has-text("Garçon")').first().click();
    
    // Le bouton Suivant doit être désactivé
    const nextButton = page.locator('button:has-text("Suivant")');
    await expect(nextButton).toBeDisabled();
  });

  test('Validation étape 1 : ne peut pas passer sans choix', async ({ page }) => {
    // Remplir seulement le nom
    await page.locator('input[placeholder*="prénom"]').fill('Jean');
    
    // Le bouton Suivant doit être désactivé
    const nextButton = page.locator('button:has-text("Suivant")');
    await expect(nextButton).toBeDisabled();
  });

  test('Bouton Retour fonctionne à l\'étape 2', async ({ page }) => {
    // Aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Marie');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    
    // Cliquer sur Retour
    await page.locator('button:has-text("Retour")').click();
    
    // Vérifier qu'on est revenu à l'étape 1
    await expect(page.locator('input[placeholder*="prénom"]')).toBeVisible();
    // Les données doivent être conservées
    await expect(page.locator('input[placeholder*="prénom"]')).toHaveValue('Marie');
  });

  test('Indicateur de progression s\'affiche à l\'étape 2', async ({ page }) => {
    // Aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Sophie');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    
    // Vérifier l'indicateur de progression
    await expect(page.locator('text=Étape 2 sur 3')).toBeVisible();
    // Le point 2 doit être actif
    const step2 = page.locator('div:has-text("2")').filter({ hasText: /^2$/ });
    await expect(step2.first()).toHaveClass(/bg-purple-600/);
  });

  test('Validation étape 2 : tous les champs sont obligatoires', async ({ page }) => {
    // Aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Marc');
    await page.locator('button:has-text("Garçon")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    
    // Le bouton "Envoyer mon vote" doit être désactivé
    const submitButton = page.locator('button:has-text("Envoyer mon vote")');
    await expect(submitButton).toBeDisabled();
  });

  test('Sauvegarde localStorage : données conservées après refresh', async ({ page, context }) => {
    // Remplir l'étape 1
    await page.locator('input[placeholder*="prénom"]').fill('Test User');
    await page.locator('button:has-text("Fille")').first().click();
    
    // Aller à l'étape 2 et remplir quelques champs
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    
    // Remplir quelques champs
    await page.locator('input[type="date"]').fill('2025-06-15');
    await page.locator('input[type="time"]').fill('14:30');
    
    // Recharger la page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Vérifier que les données sont restaurées
    // On doit être à l'étape 2 car nom et choix sont remplis
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    // Les champs doivent être remplis
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toHaveValue('2025-06-15');
  });

  test('Email optionnel à l\'étape 2', async ({ page }) => {
    // Aller à l'étape 2 et remplir tous les champs obligatoires
    await page.locator('input[placeholder*="prénom"]').fill('Alice');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    
    // Remplir tous les champs obligatoires
    await page.locator('input[type="date"]').fill('2025-07-20');
    await page.locator('input[type="time"]').fill('10:00');
    
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
    
    await page.locator('button[title="Blonds"]').click();
    await page.locator('button[title="Bleus"]').click();
    await page.waitForTimeout(300);
    
    // Le bouton doit être activé même sans email
    const submitButton = page.locator('button:has-text("Envoyer mon vote")');
    await expect(submitButton).toBeEnabled();
  });

  test('Gestion d\'erreur : message d\'erreur affiché si soumission échoue', async ({ page }) => {
    // Intercepter la requête POST pour simuler une erreur
    await page.route('/api/votes', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erreur serveur' })
      });
    });
    
    // Aller à l'étape 2 et remplir tous les champs
    await page.locator('input[placeholder*="prénom"]').fill('Test');
    await page.locator('button:has-text("Garçon")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    
    // Remplir tous les champs
    await page.locator('input[type="date"]').fill('2025-08-15');
    await page.locator('input[type="time"]').fill('12:00');
    await page.evaluate(() => {
      const sliders = document.querySelectorAll('input[type="range"]');
      if (sliders.length >= 2) {
        (sliders[0] as HTMLInputElement).value = '3000';
        sliders[0].dispatchEvent(new Event('input', { bubbles: true }));
        (sliders[1] as HTMLInputElement).value = '48';
        sliders[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await page.locator('button[title="Bruns"]').click();
    await page.locator('button[title="Marrons"]').click();
    await page.waitForTimeout(300);
    
    // Soumettre
    await page.locator('button:has-text("Envoyer mon vote")').click();
    
    // Vérifier que le message d'erreur s'affiche
    await expect(page.locator('text=Erreur lors de l\'envoi')).toBeVisible({ timeout: 3000 });
    // Le bouton Réessayer doit être visible
    await expect(page.locator('button:has-text("Réessayer")')).toBeVisible();
    
    // Les données doivent être conservées
    await expect(page.locator('input[placeholder*="prénom"]')).not.toBeVisible(); // On est toujours à l'étape 2
  });

  test('Sticky footer visible sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Le sticky footer doit être visible
    const stickyFooter = page.locator('.sticky.bottom-0');
    await expect(stickyFooter).toBeVisible();
    
    // Aller à l'étape 2
    await page.locator('input[placeholder*="prénom"]').fill('Mobile User');
    await page.locator('button:has-text("Fille")').first().click();
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=Fais tes pronostics')).toBeVisible({ timeout: 3000 });
    
    // Le sticky footer doit toujours être visible avec le bouton Retour
    await expect(page.locator('button:has-text("Retour")')).toBeVisible();
    await expect(page.locator('button:has-text("Envoyer mon vote")')).toBeVisible();
  });
});
