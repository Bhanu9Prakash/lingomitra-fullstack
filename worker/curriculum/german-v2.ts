import { course, teach, model, prior, task, meaning } from './author';
import type { AuthoredStep } from './types';
const key=(objects:string[],action='',question=false)=>`de|${question?'offer':'request'}|${[...objects].sort().join('+')}|${action}`;
function request(id:string,objects:string[],prompt:string,please=false,action='',question=false):AuthoredStep{
 const orders=objects.length===2?[objects,[...objects].reverse()]:[objects];
 const starts=question?'Möchten Sie':'Ich möchte';
 const accepted=orders.flatMap(o=>[...new Set([please?'bitte':'','bitte','gern','gerne'].filter(x=>!please||x==='bitte'))].flatMap(m=>m==='bitte'?[`${starts} bitte ${o.join(' und ')}${action?' '+action:''}.`,`${starts} ${o.join(' und ')}${action?' '+action:''}, bitte.`]:[`${starts} ${m?m+' ':''}${o.join(' und ')}${action?' '+action:''}.`]));
 if(objects.length===1&&!please){const article=['Tee','Kaffee','Saft'].includes(objects[0])?'einen':'ein';if(objects[0]!=='Milch')accepted.push(`${starts} ${article} ${objects[0]}${action?' '+action:''}.`);}
 return task('de',id,key(objects,action,question),prompt,accepted,[question?'Who are you asking, and which part begins the question?':'Who is making the request?',question?'Put möchten before polite Sie. Keep any action at the end.':action?'After Ich möchte, put the drink or language first and the action last.':'Put the “would like” piece before the drink.',`${starts} …${action?' '+action:''}`],[{match:'\\bmochte(n)?\\b',category:'verb-form',message:'The dots change the meaning: möchte is “would like”; mochte is “liked”. You may type moechte for möchte.'},{match:'^ich (?!möchte|moechte)',category:'word-order',message:'Put möchte after Ich. The drink follows; any second action stays at the end.'},{match:'\\b(lerne|trinke|zu)\\b',category:'verb-form',message:'After möchte, use the unchanged action lernen or trinken at the end. This pattern does not add zu.'},{match:'^sie möchten',category:'word-order',message:'That can check something with a questioning tone. For this neutral question, put möchten before Sie.'}]);
}
const recap=teach('recap','Bring back the request','Ich möchte means I would like. Tee, Wasser, Kaffee, Milch and Saft are tea, water, coffee, milk and juice. Bitte means please, und means and. You can reopen this supplied recap whenever you need it.', ['Ich möchte|I would like','Tee|tea','Wasser|water','Kaffee|coffee','Milch|milk','Saft|juice','bitte|please','und|and'],[model('Ich möchte Tee.','I would like tea.',key(['Tee']))]);
export const german=[
course('de','de-starter-01','Ask for a drink','Request a drink, then combine two choices.',['de-lesson01'],[],[
 prior('If you already know German, ask for water in a full German sentence.'),
 teach('idea','One useful request','ich means I. möchte means would like. Tee means tea. Put the three pieces in that order. You are requesting tea, not saying you already have it. German writes names of things, such as Tee, with a capital letter. The ch in ich has no exact English spelling. If your keyboard cannot type ö, you may type oe: moechte.',['ich|I','möchte|would like','Tee|tea'],[model('Ich möchte Tee.','I would like tea.',key(['Tee']))]),
 meaning('meaning','What does the example tell the listener?',['The speaker would like tea','The speaker already has tea'],'The speaker would like tea','möchte describes what the speaker would like.'),
 teach('coffee-word','Change just the drink','Kaffee means coffee. On the next screen, the example and word card will close.',['Kaffee|coffee']),
 request('coffee',['Kaffee'],'At a café, ask for coffee in a full German sentence.'),
 teach('milk-word','A different choice','Milch means milk. Keep the request pattern and change the choice.',['Milch|milk']),
 request('milk',['Milch'],'At an office, your host asks what you would like. Ask for milk.'),
 teach('please','Add a polite touch','bitte means please. It can come at the end or after möchte. Moving bitte does not create a new meaning.',['bitte|please'],[model('Ich möchte Tee, bitte.','I would like tea, please.',key(['Tee'])),model('Ich möchte bitte Tee.','I would like tea, please.',key(['Tee']))]),
 teach('water-word','Another drink','Wasser means water.',['Wasser|water']),
 request('water-please',['Wasser'],'Ask for water and include please.',true),
 teach('juice-word','One last drink','Saft means juice.',['Saft|juice']),
 teach('and','Bring two choices together','und means and. Join the two drinks with und. We will try a different pair next.',['und|and'],[model('Ich möchte Tee und Wasser.','I would like tea and water.',key(['Tee','Wasser']))]),
 request('exit-pair-please',['Kaffee','Saft'],'At a breakfast counter, request coffee and juice for your table. Include please.',true),
], [request('return-milk-juice',['Milch','Saft'],'You are choosing for a picnic. Request milk and juice.')], [request('week-tea-milk',['Tee','Milch'],'You are arranging refreshments. Request tea and milk.')]),
course('de','de-starter-02','Say what you want to do','Keep the second action at the end.',['de-lesson06'],['de-starter-01'],[
 recap,
 teach('action','Give the action its place','trinken means to drink. Start with Ich möchte, add the drink, and put trinken at the end. English puts drink before the drink name; in this German pattern the action comes last. There is no extra word for to.',['trinken|to drink'],[model('Ich möchte Tee trinken.','I would like to drink tea.',key(['Tee'],'trinken'))]),
 request('water-action',['Wasser'],'Say that you would like to drink water.',false,'trinken'),
 teach('learning','Use the pattern for learning','lernen means to learn. Deutsch, Englisch and Spanisch mean German, English and Spanish. The language goes before lernen. Saying you would like to learn does not say that you are studying right now.',['lernen|to learn','Deutsch|German','Englisch|English','Spanisch|Spanish'],[model('Ich möchte Deutsch lernen.','I would like to learn German.',key(['Deutsch'],'lernen'))]),
 request('english-action',['Englisch'],'Say that you would like to learn English.',false,'lernen'),
 request('coffee-action',['Kaffee'],'Say that you would like to drink coffee.',false,'trinken'),
 request('spanish-action',['Spanisch'],'At a course desk, say that you would like to learn Spanish.',false,'lernen'),
 meaning('meaning','What did the speaker express with möchte?',['A wish to do something','Proof that the action is happening now'],'A wish to do something','möchte expresses what the speaker would like.'),
], [request('return-milk-action',['Milch'],'At a breakfast table, say you would like to drink milk.',false,'trinken')], [request('week-juice-action',['Saft'],'Say that you would like to drink juice.',false,'trinken')]),
course('de','de-starter-03','Ask someone politely','Offer a choice using möchten Sie.',['de-lesson09'],['de-starter-01','de-starter-02'],[
 recap,
 teach('actions','Supplied action recap','trinken means to drink, lernen means to learn. Deutsch, Englisch and Spanisch are German, English and Spanish. The second action stays last.',['trinken|to drink','lernen|to learn','Deutsch|German','Englisch|English','Spanisch|Spanish'],[model('Ich möchte Deutsch lernen.','I would like to learn German.',key(['Deutsch'],'lernen'))]),
 teach('formal','A respectful way to say you','Sie, with a capital S, is a polite or formal you. Use möchten with Sie, instead of möchte. In a neutral yes/no question, möchten comes first. We use this form with a visitor we do not know; informal du has different forms.',['Sie|you, polite/formal','möchten|would like, with Sie'],[model('Möchten Sie Tee?','Would you like tea?',key(['Tee'],'',true))]),
 request('water-offer',['Wasser'],'Politely ask a visitor whether they would like water.',false,'',true),
 teach('longer','The second action stays last','Only the first verb moves to the front in this question pattern.',[],[model('Möchten Sie Tee trinken?','Would you like to drink tea?',key(['Tee'],'trinken',true))]),
 request('english-question',['Englisch'],'Ask someone politely whether they would like to learn English.',false,'lernen',true),
 request('coffee-question',['Kaffee'],'Ask someone politely whether they would like to drink coffee.',false,'trinken',true),
 teach('reply','A useful short reply','Ja, bitte accepts an offer. Nein, danke declines politely. These replies are useful phrases; recalling one is different evidence from building a new sentence.',['ja|yes','nein|no','danke|thank you'],[model('Ja, bitte.','Yes, please.','de|reply|yes'),model('Nein, danke.','No, thank you.','de|reply|no')]),
 meaning('reply-meaning','You do not want the offered tea. Which reply fits?',['Nein, danke.','Ja, bitte.'],'Nein, danke.','Choose the reply that says no.'),
], [request('return-milk-offer',['Milch'],'Politely ask a visitor whether they would like milk.',false,'',true)], [request('week-spanish-question',['Spanisch'],'At a course desk, ask someone politely whether they would like to learn Spanish.',false,'lernen',true)])
];
