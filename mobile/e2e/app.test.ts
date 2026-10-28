describe('RepSense App', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, delete: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication Flow', () => {
    it('should show login screen', async () => {
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should navigate to register screen', async () => {
      await element(by.id('register-link')).tap();
      await expect(element(by.id('register-screen'))).toBeVisible();
    });

    it('should navigate to forgot password screen', async () => {
      await element(by.id('forgot-password-link')).tap();
      await expect(element(by.id('forgot-password-screen'))).toBeVisible();
    });
  });

  describe('Onboarding Flow', () => {
    it('should show profile setup screen', async () => {
      await expect(element(by.id('profile-setup-screen'))).toBeVisible();
    });

    it('should complete profile setup and navigate to device connection', async () => {
      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('age-input')).typeText('25');
      await element(by.id('gender-male')).tap();
      await element(by.id('height-input')).typeText('175');
      await element(by.id('weight-input')).typeText('70');
      await element(by.id('fitness-goal-input')).typeText('Build muscle');
      await element(by.id('continue-button')).tap();
      
      await expect(element(by.id('connect-device-screen'))).toBeVisible();
    });
  });

  describe('Main App Flow', () => {
    beforeEach(async () => {
      // Login and complete onboarding
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(10000);
    });

    it('should show home screen with stats', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
      await expect(element(by.text('Good morning'))).toBeVisible();
      await expect(element(by.id('start-workout-button'))).toBeVisible();
    });

    it('should navigate to workout screen', async () => {
      await element(by.id('workout-tab')).tap();
      await expect(element(by.id('workout-screen'))).toBeVisible();
      await expect(element(by.text('Select Exercise'))).toBeVisible();
    });

    it('should navigate to history screen', async () => {
      await element(by.id('history-tab')).tap();
      await expect(element(by.id('history-screen'))).toBeVisible();
      await expect(element(by.text('Workout History'))).toBeVisible();
    });

    it('should navigate to analytics screen', async () => {
      await element(by.id('analytics-tab')).tap();
      await expect(element(by.id('analytics-screen'))).toBeVisible();
      await expect(element(by.text('Analytics'))).toBeVisible();
    });

    it('should navigate to profile screen', async () => {
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('profile-screen'))).toBeVisible();
      await expect(element(by.text('Profile'))).toBeVisible();
    });
  });

  describe('Workout Flow', () => {
    beforeEach(async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(10000);
    });

    it('should start a bicep curl workout', async () => {
      await element(by.id('start-workout-button')).tap();
      await expect(element(by.id('workout-screen'))).toBeVisible();
      await element(by.id('bicep-curl-exercise')).tap();
      await expect(element(by.id('live-workout-screen'))).toBeVisible();
    });
  });
});