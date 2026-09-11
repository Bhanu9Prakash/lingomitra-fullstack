import type { TeachingStep } from '../../shared/learning';

// Authored pilot. Original LingoMitra content; not a Language Transfer script.
// These keys, hints and validators are Worker-only. Do not import into the client.
export type TaskTarget = { subject: 'ich' | 'sie'; drink?: 'Tee' | 'Wasser' | 'Kaffee'; language?: 'Deutsch' | 'Englisch'; action?: 'trinken' | 'lernen'; question?: boolean; please?: boolean };
export type AuthoredStep = TeachingStep & { target?: TaskTarget; hints?: string[]; answer?: string; correctOption?: string; exposures?: string[]; newContext?: boolean };
export type Activity = { id: string; title: string; outcome: string; linkedLessonId: string; version: string; reviewStatus: string; prerequisites: string[]; nextActivityId?: string; steps: AuthoredStep[]; review: AuthoredStep[] };
const word = (word:string,meaning:string) => ({word,meaning});
const example = (sentence:string,meaning:string) => ({sentence,meaning});
const inNewContext = (step:AuthoredStep,prompt:string):AuthoredStep => ({...step,prompt,newContext:true});
function requestTask(id:string,drink:TaskTarget['drink'],please=false):AuthoredStep {
  const meaning={Tee:'tea',Wasser:'water',Kaffee:'coffee'}[drink!];
  return {id,kind:'construct',title:'Make your own request',text:'The examples are put away. Take the time you need.',prompt:`At a café, ask for ${meaning} in a full German sentence${please?', including “please”':''}.`,companion:'You have the pieces. Try putting them together.',target:{subject:'ich',drink,please},answer:`Ich möchte ${drink}${please?', bitte':''}.`,hints:['Start with the person making the request. What comes after “I”?','Use “would like” before the drink in this pattern.','Ich möchte …']};
}
function actionTask(id:string,target:TaskTarget,prompt:string):AuthoredStep {
  return {id,kind:'construct',title:target.question?'Ask someone politely':'Build a new combination',text:'Use only the words and pattern you have met.',prompt,target,answer:target.question?`Möchten Sie ${target.drink||target.language} ${target.action}?`:`Ich möchte ${target.drink||target.language} ${target.action}.`,hints:target.question?['Start with the verb to make this a polite question.','Use möchten before Sie. Keep the action at the end.','Möchten Sie … ?']:['Find the words for “I would like” first.','Put the drink or language after möchte. Put the action last.','Ich möchte …']};
}
const intro:AuthoredStep={id:'prior',kind:'prior',title:'A quick starting point',text:'Have you learned German before? This helps us avoid crediting the lesson for something you already know. You can choose “I don’t know yet”.',prompt:'If you already can, ask for water in a full German sentence. Otherwise leave this blank.',companion:'We can start from the beginning.'};
const recap:AuthoredStep={id:'recap',kind:'teach',title:'The pieces we will reuse',text:'ich means I; möchte means would like. Put the drink after them. German writes the names of things with a capital letter. In this pattern, English and German put these pieces in the same order. That does not hold for every German sentence.',examples:[example('Ich möchte Tee.','I would like tea.')],words:[word('Wasser','water'),word('Kaffee','coffee'),word('bitte','please')],exposures:['ich:Tee::statement:plain']};
const finish:AuthoredStep={id:'finish',kind:'finish',title:'Bring this pattern back later',text:'Your attempts and the help you used are saved separately from lesson completion. A short return tomorrow will help you find out what you can retrieve. You can choose any lesson next.'};

export const activities:Activity[]=[
  {id:'de-starter-01',title:'Ask for a drink',outcome:'Build a request with “I would like …”.',linkedLessonId:'de-lesson01',version:'1.0.0',reviewStatus:'awaiting-human-review',prerequisites:[],nextActivityId:'de-starter-02',steps:[
    intro,
    {id:'idea',kind:'teach',title:'One useful request',text:'ich means I. möchte means would like. Tee means tea. Put them together in that order: Ich möchte Tee. You are making a request, not saying that you already have tea. German writes Tee with a capital letter because it is a noun. We will change just the drink first.',examples:[example('Ich möchte Tee.','I would like tea.')],words:[word('ich','I'),word('möchte','would like'),word('Tee','tea')],companion:'Let’s work out one small pattern.',exposures:['ich:Tee::statement:plain']},
    {id:'meaning',kind:'understand',title:'Check the meaning',text:'What is the speaker doing with “Ich möchte Tee”?',options:['Requesting tea','Saying they already have tea'],correctOption:'Requesting tea',hints:['möchte describes what the person would like.'],answer:'Requesting tea'},
    {id:'water-word',kind:'teach',title:'Change just the drink',text:'Wasser means water. Keep the first two pieces of the request. You will choose the final piece yourself.',words:[word('Wasser','water')]},
    requestTask('water','Wasser'),
    {id:'coffee-word',kind:'teach',title:'One more useful word',text:'Kaffee means coffee. Use the same request pattern with this new drink.',words:[word('Kaffee','coffee')]},
    requestTask('coffee','Kaffee'),
    {id:'please',kind:'teach',title:'Add a polite touch',text:'bitte means please. You can put it at the end of this request. You may also put it after möchte: Ich möchte bitte Tee. Both positions work. The meaning stays the same.',examples:[example('Ich möchte Tee, bitte.','I would like tea, please.')],words:[word('bitte','please')],exposures:['ich:Tee::statement:please']},
    requestTask('water-please','Wasser',true),
    requestTask('coffee-please','Kaffee',true),
    {id:'choice',kind:'context',title:'Choose what you want',text:'Imagine you are ordering for yourself. Choose tea, water or coffee and write your request. This is meaningful reuse; it may be a sentence you have already made.',prompt:'What would you like to drink?',target:{subject:'ich'},hints:['Choose your drink first, then use the request pattern.','Ich möchte …'],answer:'For example: Ich möchte Tee.'},
    finish
  ],review:[inNewContext(requestTask('return-water','Wasser'),'You are visiting an office. Your host asks what you would like. Request water in a full German sentence.'),requestTask('return-coffee-please','Kaffee',true),finish]},
  {id:'de-starter-02',title:'Say what you want to do',outcome:'Put an action at the end of a request.',linkedLessonId:'de-lesson06',version:'1.0.0',reviewStatus:'awaiting-human-review',prerequisites:['de-starter-01'],nextActivityId:'de-starter-03',steps:[
    recap,
    {id:'action',kind:'teach',title:'Give the action its place',text:'trinken means to drink. Start with Ich möchte, add the drink, and put trinken at the end. In this pattern, German puts the action after the drink. English puts “drink” before it. You do not need an extra German word for “to” here.',examples:[example('Ich möchte Tee trinken.','I would like to drink tea.')],words:[word('trinken','to drink')],exposures:['ich:Tee:trinken:statement:plain']},
    actionTask('water-action',{subject:'ich',drink:'Wasser',action:'trinken'},'Say that you would like to drink water.'),
    {id:'learning',kind:'teach',title:'Use the pattern for learning',text:'lernen means to learn. Deutsch means German. The action still goes at the end. You are saying what you would like to do, not what you are doing right now.',examples:[example('Ich möchte Deutsch lernen.','I would like to learn German.')],words:[word('lernen','to learn'),word('Deutsch','German')],exposures:['ich:Deutsch:lernen:statement:plain']},
    {id:'english-word',kind:'teach',title:'A language you already know',text:'Englisch means English. Like Deutsch, it goes before lernen in this pattern.',words:[word('Englisch','English')]},
    actionTask('english-action',{subject:'ich',language:'Englisch',action:'lernen'},'Say that you would like to learn English.'),
    actionTask('coffee-action',{subject:'ich',drink:'Kaffee',action:'trinken'},'Say that you would like to drink coffee.'),
    {id:'meaning',kind:'understand',title:'Wish or current action?',text:'What does “Ich möchte Deutsch lernen” tell you?',options:['The speaker would like to learn German','The speaker is definitely studying German right now'],correctOption:'The speaker would like to learn German',answer:'The speaker would like to learn German',hints:['möchte expresses what the person would like.']},
    finish
  ],review:[actionTask('return-coffee-action',{subject:'ich',drink:'Kaffee',action:'trinken'},'Say that you would like to drink coffee.'),inNewContext(actionTask('return-english-action',{subject:'ich',language:'Englisch',action:'lernen'},''),'You are discussing a course with an adviser. Say that you would like to learn English. The German words you need are all from this starter.'),finish]},
  {id:'de-starter-03',title:'Ask someone politely',outcome:'Make a polite question with möchten Sie.',linkedLessonId:'de-lesson09',version:'1.0.0',reviewStatus:'awaiting-human-review',prerequisites:['de-starter-01','de-starter-02'],steps:[
    recap,
    {id:'action-recap',kind:'teach',title:'An action at the end',text:'trinken means to drink; lernen means to learn. Deutsch is German and Englisch is English. After Ich möchte, put the drink or language first and the action last.',examples:[example('Ich möchte Tee trinken.','I would like to drink tea.'),example('Ich möchte Deutsch lernen.','I would like to learn German.')],words:[word('trinken','to drink'),word('lernen','to learn'),word('Deutsch','German'),word('Englisch','English')],exposures:['ich:Tee:trinken:statement:plain','ich:Deutsch:lernen:statement:plain']},
    {id:'formal',kind:'teach',title:'A respectful way to say “you”',text:'Sie, written with a capital S, is a polite or formal “you”. Use möchten with Sie, rather than möchte. A statement is Sie möchten Tee. To ask a neutral yes/no question, put möchten first: Möchten Sie Tee? We are using this polite form with someone we do not know; informal du has its own forms.',examples:[example('Sie möchten Tee.','You would like tea.'),example('Möchten Sie Tee?','Would you like tea?')],words:[word('Sie','you, polite/formal'),word('möchten','would like, with Sie')],exposures:['sie:Tee::statement:plain','sie:Tee::question:plain']},
    {id:'water-offer',kind:'construct',title:'Offer someone water',text:'Use the polite question pattern you have just met. The examples are put away.',prompt:'Ask a visitor: “Would you like water?”',target:{subject:'sie',drink:'Wasser',question:true},answer:'Möchten Sie Wasser?',hints:['Which piece comes first in the question?','Use möchten before Sie.','Möchten Sie … ?']},
    {id:'longer-question',kind:'teach',title:'Keep the action at the end',text:'The question starts with möchten Sie. If there is another action, it stays at the end. Only the first verb moves to the front in this pattern.',examples:[example('Möchten Sie Tee trinken?','Would you like to drink tea?')],exposures:['sie:Tee:trinken:question:plain']},
    actionTask('english-question',{subject:'sie',language:'Englisch',action:'lernen',question:true},'Ask someone politely whether they would like to learn English.'),
    actionTask('coffee-question',{subject:'sie',drink:'Kaffee',action:'trinken',question:true},'Ask someone politely whether they would like to drink coffee.'),
    {id:'reply',kind:'teach',title:'A short reply is useful too',text:'ja means yes; nein means no; danke means thank you. Ja, bitte accepts an offer. Nein, danke declines politely. These useful replies are phrases; recalling one is different evidence from building a new sentence.',examples:[example('Ja, bitte.','Yes, please.'),example('Nein, danke.','No, thank you.')],words:[word('ja','yes'),word('nein','no'),word('danke','thank you')]},
    {id:'reply-meaning',kind:'understand',title:'Choose your meaning',text:'You do not want the offered tea. Which reply fits?',options:['Nein, danke.','Ja, bitte.'],correctOption:'Nein, danke.',answer:'Nein, danke.',hints:['Choose the reply that says no.']},
    finish
  ],review:[inNewContext(actionTask('return-water-question',{subject:'sie',drink:'Wasser',action:'trinken',question:true},''),'You are welcoming a participant to a workshop. Politely ask whether they would like to drink water.'),inNewContext(actionTask('return-german-question',{subject:'sie',language:'Deutsch',action:'lernen',question:true},''),'At a course information desk, politely ask a visitor whether they would like to learn German.'),finish]}
];

export function activity(id:string,version?:string) { return activities.find(a=>a.id===id&&(!version||a.version===version)); }
export function publicStep(step:AuthoredStep):TeachingStep {
  const {target,hints,answer,correctOption,exposures,newContext,...safe}=step; return safe;
}
export function semanticKey(t:TaskTarget) { return [t.subject,t.drink||t.language||'',t.action||'',t.question?'question':'statement',t.please?'please':'plain'].join(':'); }
