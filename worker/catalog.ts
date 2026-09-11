import data from '../generated/catalog.json';
import { HttpError } from './core';
export const languages=data.languages;
export const lessons=data.lessons;
export function lesson(id:string) { const result=lessons.find(l=>l.lessonId===id); if(!result)throw new HttpError(404,'Lesson not found.');return result; }
export function language(code:string) { const result=languages.find(l=>l.code===code); if(!result)throw new HttpError(404,'Language not found.');return result; }
