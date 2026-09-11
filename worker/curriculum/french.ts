import { course, teach, model, prior, task, meaning } from './author';
const k=(form:string,item:string)=>`fr|${form}|${item}`;
function preference(id:string,item:string,negative:boolean,prompt:string,eligible=true){
 const base=negative?`Je n’aime pas le ${item}.`:`J’aime le ${item}.`;
 return task('fr',id,k(negative?'dislike':'like',item),prompt,[base,...(negative?[{text:`J’aime pas le ${item}.`,detail:'This is natural in informal speech. In the careful writing pattern we taught, include ne: Je n’aime pas…'}]:[])],['Is the preference positive or negative?','Keep le with the thing. The negative wraps around aime.',negative?'Je n’aime pas le …':'J’aime le …'],[{match:'^je aime',category:'spelling',message:'Before the vowel in aime, je contracts to j’: J’aime.'},{match:'^je n.?aime le ',category:'meaning',message:'The negative needs pas after aime. Without it, the intended negative is incomplete.'},{match:'^j.?aime (café|thé|chocolat|lait)',category:'vocabulary',message:'For this general preference, keep le with the noun.'}],eligible);
}
function order(id:string,drink:string,condition:string,prompt:string,eligible=true){
 const base=`Je voudrais un ${drink}${condition?' '+condition:''}`;
 return task('fr',id,k('order',drink+'|'+condition),prompt,[base,base+", s’il vous plaît.","S’il vous plaît, "+base,base+", s’il vous plait.",`Bonjour. ${base}, s’il vous plaît. Merci.`],['Which drink and preparation does the customer want?','Use the request piece, then one serving and the preparation piece.','Je voudrais un …'],[{match:'^j.?aime',category:'meaning',message:'That states a preference. This situation asks for an order.'},{match:'pas sucre',category:'vocabulary',message:'Use the complete preparation piece sans sucre for without sugar.'},{match:'je voudrais le ',category:'vocabulary',message:'Le can refer to a particular known drink. Here you are ordering an unspecified serving: use un café or un thé.'}],eligible);
}
function supply(id:string,form:'ask'|'have'|'no',item:string,prompt:string,eligible=true){
 const text=form==='ask'?`Vous avez du ${item} ?`:form==='have'?`On a du ${item}.`:`On n’a pas de ${item}.`;
 const variants=form==='ask'?[text,`Avez-vous du ${item} ?`]:form==='have'?[text,`Oui, ${text}`]:[text,`Non, ${text}`,{text:`On a pas de ${item}.`,detail:'The absence is clear. In informal speech ne is often omitted; include n’ for the careful writing pattern.'}];
 return task('fr',id,k(form,item),prompt,variants,['Are you asking the staff or speaking for the hosts?','An affirmative amount uses du here; no supply uses pas de.',form==='ask'?'Vous avez du … ?':form==='have'?'On a du …':'On n’a pas de …'],[{match:'on avons|vous a ',category:'verb-form',message:'Use a with on and avez with vous in these patterns.'},{match:'pas du ',category:'vocabulary',message:'For this no-supply pattern, du changes to de after pas.'}],eligible);
}
const recap=teach('recap','Four familiar tastes','These are general preferences: J’aime is I like; Je n’aime pas is I do not like. The noun pieces are le café, le thé, le chocolat and le lait.', ['J’aime|I like','Je n’aime pas|I do not like','le café|coffee','le thé|tea','le chocolat|chocolate','le lait|milk'],[model('J’aime le café.','I like coffee.',k('like','café')),model('Je n’aime pas le lait.','I do not like milk.',k('dislike','lait'))]);
export const french=[
course('fr','fr-starter-01','Share a preference','Say what you like and what you do not.',['fr-lesson01','fr-lesson02','fr-lesson11'],[],[
 prior('Do you already know how to say that you like coffee?'),
 teach('words','Choose something familiar','Aime means like with je in this pattern. Je is I, and it shortens to j’ before the vowel in aime. Learn the full pieces le café, le thé, le chocolat and le lait. Here le introduces a general preference, even though English uses no the.', ['J’aime|I like','le café|coffee','le thé|tea','le chocolat|chocolate','le lait|milk'],[model('J’aime le café.','I like coffee.',k('like','café'))]),
 teach('negative','Change the preference','Je n’aime pas means I do not like. The negative pieces go around aime. Le stays with the noun in this general preference. Do not insert an English do.', ['Je n’aime pas|I do not like'],[model('Je n’aime pas le lait.','I do not like milk.',k('dislike','lait'))]),
 teach('sound','Listen to the whole phrase','In aime, do not pronounce the final written e as a separate syllable. French r is not the usual English r. Audio is a model to listen to, not a pronunciation score. You can learn with the text if audio is unavailable.'),
 meaning('meaning','In the milk example, what is the preference?',['The speaker does not like milk','The speaker likes milk'],'The speaker does not like milk','Pas marks the negative preference.'),
 preference('guided-tea','thé',false,'Say that you like tea.',false),
 preference('guided-no-tea','thé',true,'Now say that you do not like tea.',false),
 preference('transfer-chocolate','chocolat',true,'A host asks about your tastes. Tell them you do not like chocolate.'),
 preference('transfer-milk','lait',false,'Tell the host that you like milk.'),
 preference('consolidation','thé',false,'Try a different message: say that you like tea.',false),
], [preference('return-no-coffee','café',true,'Tell a friend you do not like coffee.')], [preference('week-chocolate','chocolat',false,'Tell a friend you like chocolate.')]),
course('fr','fr-starter-02','Order with a preparation choice','Request a drink with or without an ingredient.',['fr-lesson06','fr-lesson05','fr-lesson19'],['fr-starter-01'],[
 recap,
 teach('order','From preference to a request','Je voudrais means I would like. We are learning a useful polite form, not a full tense chart. A general preference used le café; a serving here is un café. Put the drink next, then a preparation piece. Sans sucre means without sugar. Avec du lait requests milk in the drink. Both preparation pieces can be used together, in either order.', ['Je voudrais|I would like','un café|a coffee serving','un thé|a tea serving','sans sucre|without sugar','avec du lait|with milk','s’il vous plaît|please, addressing vous','bonjour|hello, daytime greeting','merci|thank you'],[model('Je voudrais un café, s’il vous plaît.','I would like a coffee, please.',k('order','café|')),model('Je voudrais un thé avec du lait.','I would like a tea with milk.',k('order','thé|avec du lait'))]),
 teach('sound','A phrase to listen to','Un has a nasal vowel, not the English sound oon. The final s in voudrais is not pronounced. S’il vous plaît is the please expression we use with the staff in this scene. Plait is also accepted under the 1990 spelling rectifications.'),
 meaning('meaning','In the tea order you just saw, is milk requested?',['Yes','No'],'Yes','Avec du lait requests milk in the tea.'),
 order('guided-coffee','café','sans sucre','Request a coffee without sugar politely.',false),
 order('transfer-tea','thé','sans sucre','At the café, request one tea without sugar politely.'),
 order('transfer-coffee','café','avec du lait','Now request one coffee with milk politely.'),
 order('consolidation','café','sans sucre','Try a different order: coffee without sugar.',false),
], [order('return-tea','thé','','Request one plain tea politely.')], [(()=>{const s=order('week-both','café','avec du lait sans sucre','Request coffee with milk and without sugar.');s.validation!.accepted.push({text:'Je voudrais un café sans sucre avec du lait, s’il vous plaît.'});return s;})()]),
course('fr','fr-starter-03','Ask what is available','Ask the staff, then answer as a host.',['fr-lesson04','fr-lesson08','fr-lesson11'],['fr-starter-01','fr-starter-02'],[
 teach('supply','An amount, rather than a serving','For an unspecified amount here, use du café, du thé, du lait or du sucre. Vous avez asks the staff whether they have it. On a means we have when speaking for the hosts here. In an everyday question, subject and verb can stay in that order; voice and a question mark signal the question.', ['vous avez|you have, addressing vous','on a|we have, in this scene','du café|some coffee','du thé|some tea','du lait|some milk','du sucre|some sugar','oui|yes','non|no'],[model('Vous avez du lait ?','Do you have any milk?',k('ask','lait')),model('On a du lait.','We have milk.',k('have','lait'))]),
 teach('no-supply','Say there is none','Use On n’a pas de for we do not have any. The amount word du changes to de in this negative supply pattern. The le of our earlier general preference stayed le. In vous avez, listen for the linking z; do not turn this into a rule to pronounce every final consonant.', ['On n’a pas de|we do not have any'],[model('Vous avez du thé ?','Do you have tea?',k('ask','thé')),model('On n’a pas de thé.','We do not have tea.',k('no','thé'))]),
 meaning('meaning','Can the host in the last example provide tea?',['No','Yes'],'No','Pas de says there is no tea available.'),
 supply('guided-ask','ask','sucre','Ask the staff whether they have sugar.',false),
 supply('guided-answer','have','sucre','Now you are the host. Tell your guest you have sugar.',false),
 supply('transfer-ask','ask','café','You are a customer. Ask the staff whether they have coffee.'),
 supply('transfer-no','no','sucre','You are now a host speaking for your household. Tell your guest you do not have any sugar.'),
 supply('consolidation','ask','sucre','Try a different role: ask the staff whether they have sugar.',false),
], [supply('return-tea','have','thé','As a host, tell your guest you have tea.')], [supply('week-coffee','no','café','As a host, say you do not have any coffee.')])
];
