// Simple analytics helper to track user events
// Later, this will be integrated with PostHog or another analytics provider

type EventName = 
  | 'first_open'
  | 'lesson_start'
  | 'lesson_complete'
  | 'streak_hit'
  | 'quiz_completed'
  | 'subscription_view'
  | 'language_selected'
  | 'chat_started'
  | 'registration_complete'
  | 'profile_viewed'
  | 'paywall_dismissed'
  | 'subscription_plan_selected'
  | 'subscription_initiated';

type EventProperties = Record<string, string | number | boolean | null>;

// Initialize analytics - placeholder for now
// Would normally set up PostHog or another analytics provider here
let isAnalyticsInitialized = false;

function initializeAnalytics() {
  // This would normally initialize PostHog or another provider
  // For now, it's just a placeholder
  console.log('[Analytics] Initialized');
  isAnalyticsInitialized = true;
  
  // Track first_open event on initialization
  trackEvent('first_open');
}

export function trackEvent(eventName: EventName, properties: EventProperties = {}) {
  // Initialize analytics if not already done
  if (!isAnalyticsInitialized) {
    initializeAnalytics();
  }
  
  // This would normally send the event to PostHog or another provider
  // For now, just log it to the console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Event: ${eventName}`, properties);
  }
  
  // Later, we would add real tracking code here:
  // Example with PostHog:
  // posthog.capture(eventName, properties);
}

export function identifyUser(userId: number, traits: Record<string, any> = {}) {
  // Initialize analytics if not already done
  if (!isAnalyticsInitialized) {
    initializeAnalytics();
  }
  
  // This would normally identify the user in PostHog or another provider
  // For now, just log it to the console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Identify user: ${userId}`, traits);
  }
  
  // Later, we would add real identification code here:
  // Example with PostHog:
  // posthog.identify(userId.toString(), traits);
}

// Initialize analytics when this module is imported
initializeAnalytics();