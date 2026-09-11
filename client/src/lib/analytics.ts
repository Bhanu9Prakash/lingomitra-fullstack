// No third-party analytics is connected. Legacy event hooks remain compatible.
// Authoritative learning records are saved by the account-scoped learning API.
type EventName='first_open'|'lesson_start'|'lesson_complete'|'streak_hit'|'quiz_completed'|'language_selected'|'chat_started'|'registration_complete'|'profile_viewed';
export function trackEvent(_name:EventName,_properties:Record<string,string|number|boolean|null>={}) {}
export function identifyUser(_id:number,_traits:Record<string,unknown>={}) {}
