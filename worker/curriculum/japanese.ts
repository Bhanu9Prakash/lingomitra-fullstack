import { course, teach, model, prior, task, meaning } from './author';
const nouns={water:['水','みず','mizu'],tea:['お茶','おちゃ','ocha'],coffee:['コーヒー','コーヒー','kōhī'],bread:['パン','パン','pan']} as const;
const k=(kind:string,item:string,place='')=>`ja|${kind}|${item}|${place}`;
function identify(id:string,item:keyof typeof nouns,place:'this'|'that',form:'is'|'question'|'not',prompt:string,eligible=true){
 const [n,kana,r]=nouns[item],p=place==='this'?'これ':'それ',pr=place==='this'?'kore':'sore',end=form==='is'?'です':form==='question'?'ですか':'じゃないです',er=form==='is'?'desu':form==='question'?'desu ka':'ja nai desu';
 const forms=[...new Set([n,kana])].flatMap(word=>[`${p}は${word}${end}。`,{text:`${word}${end}。`,key:k(form,item),detail:'This is a complete, natural sentence when the item is clear. It does not demonstrate a topic or this/that contrast.'}]);
 return task('ja',id,k(form,item,place),prompt,[...forms,{text:`${pr} wa ${r} ${er}`,modality:'romanized'},{text:`${r} ${er}`,key:k(form,item),modality:'romanized',detail:'A natural short sentence in this context. The topic and this/that contrast are untested.'}],['Are you identifying, checking, or correcting the item?','Put the item before the polite noun ending. A question adds か last.',`${p}は … ${end}`],[{match:'^これ(、|,|\s)?(コーヒー|水|お茶|パン)$',category:'politeness',message:'The item is clear. Add the polite noun ending です to complete this pattern.'},{match:'です(コーヒー|水|お茶|パン)',category:'word-order',message:'Name the item before the polite ending です.'}],eligible);
}
function order(id:string,items:(keyof typeof nouns)[],prompt:string,eligible=true){
 const orders=items.length===2?[items,[...items].reverse()]:[items];
 const accepted=orders.flatMap(os=>{
  const text=os.map(o=>nouns[o][0]).join('と'),roman=os.map(o=>nouns[o][2]).join(' to ');
  return [`${text}をください。`,`${text}ください。`,`すみません。${text}をください。`,{text:`${roman} o kudasai`,modality:'romanized' as const},{text:`${roman} kudasai`,modality:'romanized' as const},{text:`sumimasen ${roman} o kudasai`,modality:'romanized' as const}];
 });
 return task('ja',id,k('request',[...items].sort().join('+')),prompt,accepted,['Which items are you requesting?','Join two item names with と, then make the request.','… をください'],[{match:'くださいです|kudasai desu',category:'ending',message:'Do not add です to ください. The request is already complete.'},{match:'^ください',category:'word-order',message:'Put the requested item first, then を and ください.'},{match:'です[。.!]?$',category:'meaning',message:'That identifies an item. This task asks the server to give it; use the request expression.'}],eligible);
}
const recap=teach('recap','The table and its things','水 is water, お茶 tea, コーヒー coffee, and パン bread. これ points to something near the speaker; それ points to something near the listener in this scene. は marks a topic and is pronounced wa here, even though the character is usually read ha. Finish this polite noun sentence with です. Do not add です to every Japanese sentence.', ['水|water|みず · mizu','お茶|tea|おちゃ · ocha','コーヒー|coffee|kōhī','パン|bread|pan','これ|this near me|kore','それ|that near you|sore','は|topic marker, pronounced wa here|wa','です|polite noun-sentence ending|desu'],[model('これは水です。','This is water.',k('is','water','this'),'Kore wa mizu desu.'),model('それはお茶です。','That is tea.',k('is','tea','that'),'Sore wa ocha desu.')]);
export const japanese=[
course('ja','ja.table-identification','Identify something at the table','Tell a visitor what an item is, politely.',['ja-lesson01','ja-lesson04'],[],[
 prior('If you already know Japanese, politely identify water beside you.'),
 teach('welcome','Help a visitor identify things','You are helping a visitor at a table. The prompt will say whether an item is beside you or beside them. Type Japanese or romaji for now. Romaji can show a sentence pattern, but it does not demonstrate Japanese script reading or pronunciation.'),
 recap,
 identify('coffee','coffee','this','is','The coffee is beside you. Tell the visitor what it is politely.'),
 identify('water','water','that','is','The water is beside the visitor. Tell them what it is politely.'),
 identify('tea','tea','this','is','Tea is beside you. Politely identify it.',false),
 identify('coffee-that','coffee','that','is','Coffee is beside the visitor. Politely identify it.',false),
 teach('sound','Coffee has two long vowels','In kō-hī, both vowels are long. In コーヒー, the bars mark that length. Tap four timing units: ko-o-hi-i. A long vowel lasts longer; it does not become a different vowel. Do not add strong English stress to every word. You may type koohii for kōhī.', ['コーヒー|coffee|kōhī / koohii']),
 meaning('reading','Which written label means water?',['水','パン'],'水','水 means water; パン means bread. This checks recognition separately from sentence construction.'),
 identify('transfer','bread','this','is','A visitor points to the bread beside you. Tell them what it is politely. Build your sentence without the word bank.'),
 identify('consolidation','coffee','that','is','Try a different item: politely identify the coffee near the visitor.',false),
], [identify('return-bread','bread','that','is','Bread is near the visitor. Politely identify it.')], [identify('week-water','water','this','is','Politely identify the water beside you.')]),
course('ja','ja.confirm-and-correct','Check and correct a label','Ask a polite identity question and reject a wrong label.',['ja-lesson08','ja-lesson09'],['ja.table-identification'],[
 recap,
 teach('question','Put the question marker last','To ask a polite yes/no question in this noun pattern, put か after です. Keep the rest of the order. はい confirms an affirmative question; いいえ disagrees. These short replies are useful, but recalling one is not novel sentence construction.', ['か|question marker|ka','はい|yes, confirming an affirmative question|hai','いいえ|no, disagreeing|iie'],[model('これはコーヒーですか。','Is this coffee?',k('question','coffee','this'),'Kore wa kōhī desu ka.')]),
 identify('guided-question','tea','that','question','Tea is near the visitor. Ask whether that is tea.',false),
 meaning('reply','The visitor asks if this is water, and it is. Which short reply confirms?',['はい','いいえ'],'はい','はい confirms this affirmative question.'),
 teach('negative','Correct the identity','Replace です with じゃないです to make this negative noun statement. Keep that ending together for now. It is polite conversational speech, not a universal negative ending for all verbs or adjectives.', ['じゃないです|is not, in this noun pattern|ja nai desu'],[model('それは水じゃないです。','That is not water.',k('not','water','that'),'Sore wa mizu ja nai desu.')]),
 identify('guided-coffee','coffee','this','not','The cup beside you is tea. Someone calls it coffee. Politely say this is not coffee.',false),
 identify('guided-tea','tea','that','not','The cup near the visitor is water. Politely say that is not tea.',false),
 identify('transfer','bread','this','not','The item beside you is tea. A label says it is bread. Politely correct the label: say it is not bread.'),
 identify('repair','tea','this','is','Now politely identify the tea. This part is familiar retrieval.',false),
 identify('transfer-question','water','that','question','Help the visitor check another label. Water is beside them. Politely ask whether it is water.'),
], [identify('return-bread-question','bread','that','question','Bread is beside the visitor. Politely ask whether that is bread.')], [identify('week-bread-negative','bread','this','not','The item beside you is coffee. Politely say this is not bread.')]),
course('ja','ja.order-at-table','Request one or two items','Ask for familiar items at a counter.',['ja-lesson06','ja-lesson12','ja-lesson17'],['ja.table-identification','ja.confirm-and-correct'],[
 recap,
 teach('request','Ask for an item','すみません gets the server’s attention here. Say the item, then を, then ください to request it. を is written wo but pronounced o in this use. Do not add です after ください. You may hear 水、ください in this counter scene; the request is still meaningful. We also practise を to notice the object marker.', ['すみません|excuse me, to get attention|sumimasen','を|object marker, pronounced o here|o','ください|please give me, in item requests|kudasai','ありがとうございます|thank you|arigatō gozaimasu'],[model('水をください。','Water, please.',k('request','water'),'Mizu o kudasai.')]),
 order('guided-bread',['bread'],'Get the server’s attention if needed, and request bread.',false),
 order('guided-tea',['tea'],'Request tea.',false),
 teach('and','One request for two things','と joins the two item names before the request. The request then covers both items. Reversing their order keeps the same meaning; it is not a new combination.', ['と|and, joining nouns|to'],[model('お茶とパンをください。','Tea and bread, please.',k('request','bread+tea'),'Ocha to pan o kudasai.')]),
 order('guided-pair',['water','bread'],'Request water and bread.',false),
 order('guided-other-pair',['coffee','water'],'Now request coffee and water.',false),
 order('transfer',['coffee','tea'],'Get the server’s attention if needed and request coffee and tea.'),
 meaning('script','Which marker is pronounced o when it marks the requested item?',['を','は'],'を','を marks the requested item here. This recognition check does not assess pronunciation.'),
 order('consolidation',['water','bread'],'Try a familiar pair again: request water and bread.',false),
], [order('return-pair',['water','tea'],'Request water and tea.')], [order('week-pair',['coffee','bread'],'Request coffee and bread.')])
];
