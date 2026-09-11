import { course, teach, model, prior, task, meaning } from './author';
const people={self:['我','wǒ'],you:['你','nǐ'],he:['他','tā']} as const;
const objects={tea:['茶','chá'],coffee:['咖啡','kāfēi'],water:['水','shuǐ'],milk:['牛奶','niúnǎi'],juice:['果汁','guǒzhī']} as const;
const verbs={drink:['喝','hē'],skip:['不喝','bù hē'],like:['喜欢','xǐhuan'],have:['有','yǒu'],lack:['没有','méiyǒu']} as const;
const k=(person:string,verb:string,item:string,q=false)=>`zh|${person}|${verb}|${item}|${q}`;
function say(id:string,person:keyof typeof people,verb:keyof typeof verbs,item:keyof typeof objects,question:boolean,prompt:string,eligible=true){
 const [p,pr]=people[person],[v,vr]=verbs[verb],[n,nr]=objects[item];
 const native=`${p}${v}${n}${question?'吗？':'。'}`,roman=`${pr} ${vr} ${nr}${question?' ma':''}`;
 return task('zh',id,k(person,verb,item,question),prompt,[native,{text:roman,modality:'romanized'}],['Who is the message about, and is it a choice, preference, or availability?','Keep person, action or preference, then drink. The yes/no question marker comes last.',`${p} …${question?'吗？':''}`],[{match:'不有|bu you',category:'negation',message:'For not having, use 没有, méiyǒu. 不喝 means not drinking; those are different meanings.'},{match:'吗.+[^？。!?]$',category:'word-order',message:'In this yes/no question pattern, 吗 goes at the end.'},{match:'^(我|你|他)(茶|咖啡|水|牛奶|果汁)(喝|喜欢|有)',category:'word-order',message:'The ingredients are here. Put the action or preference before the drink.'}],eligible);
}
const recap=teach('recap','Choose a drink','我 is I; 你 is you. 喝 is drink. Put the person first, then 喝, then the drink. 不 before 喝 says the person will not drink it in this planning scene; this does not describe a completed past event.', ['我|I|wǒ','你|you|nǐ','喝|drink|hē','茶|tea|chá','咖啡|coffee|kāfēi','水|water|shuǐ','不|not in this choice pattern|bù'],[model('我喝茶。','I will drink tea, in this plan.',k('self','drink','tea'),'Wǒ hē chá.'),model('我不喝茶。','I will not drink tea.',k('self','skip','tea'),'Wǒ bù hē chá.')]);
export const mandarin=[
course('zh','zh.drink-choice','Choose a drink','State a drink plan and change its person or polarity.',['zh-lesson01','zh-lesson08'],[],[
 prior('If you already know Mandarin, say that you will drink tea as your breakfast choice.'),
 teach('words','A choice at breakfast','You may type Simplified Chinese or pinyin. Pinyin supports your sentence before character typing is familiar; it is not a pronunciation score. 我 means I, 你 means you, and 喝 means drink. The verb does not change when the person changes.', ['我|I|wǒ','你|you|nǐ','喝|drink|hē','茶|tea|chá','咖啡|coffee|kāfēi','水|water|shuǐ'],[model('我喝茶。','I will drink tea, in our breakfast plan.',k('self','drink','tea'),'Wǒ hē chá.')]),
 say('coffee','self','drink','coffee',false,'Your breakfast choice is coffee. Tell your companion that you will drink coffee.'),
 say('you-tea','you','drink','tea',false,'Your companion chose tea. Tell them their drink plan: you will drink tea.'),
 teach('negative','Change the choice','不, bù, means not in this pattern. Place it before 喝. This says you will not drink tea in this plan; it does not say you did not drink tea earlier.', ['不|not in this pattern|bù'],[model('我不喝茶。','I will not drink tea.',k('self','skip','tea'),'Wǒ bù hē chá.')]),
 say('no-coffee','self','skip','coffee',false,'You are skipping coffee at breakfast. State your choice.',false),
 say('you-no-tea','you','skip','tea',false,'Your companion chose not to drink tea. Tell them that plan.',false),
 meaning('script','Which written label means water?',['茶','水'],'水','水 is water; 茶 is tea. This is character recognition, not a sentence score.'),
 say('transfer','you','skip','water',false,'Your companion is not drinking water at this breakfast. Tell them their plan.'),
 say('consolidation','self','drink','coffee',false,'Try a different message: state your own coffee choice.',false),
 teach('sound','Keep word tones and sentence meaning separate','Pinyin marks lexical tones. A tone is part of the word, not simply an English-style question tune. Optional audio supplies an example to listen to; typed pinyin cannot prove how you pronounced it. Try recognising a familiar character before opening its pinyin on your next visit.'),
], [say('return-water','self','drink','water',false,'State your breakfast plan: you will drink water.')], [say('week-you-coffee','you','drink','coffee',false,'Tell your companion their breakfast plan: they will drink coffee.')]),
course('zh','zh.drink-questions','Ask about a drink choice','Turn a statement into a question and distinguish liking from drinking.',['zh-lesson09','zh-lesson06'],['zh.drink-choice'],[
 recap,
 teach('question','The question marker comes last','吗, ma, turns this statement pattern into a yes/no question. Keep the order and add 吗 at the end. It has a light neutral tone. Do not replace the words’ tones with an English rising tune. In a clear drink exchange, 喝 can be a short yes reply, and 不喝 a short no reply. These are useful replies, not newly composed sentences.', ['吗|yes/no question marker|ma','喝|yes, I will, in a clear drink exchange|hē','不喝|no, I won’t, in a clear drink exchange|bù hē'],[model('你喝茶吗？','Will you drink tea?',k('you','drink','tea',true),'Nǐ hē chá ma?')]),
 say('guided-coffee-question','you','drink','coffee',true,'Ask whether your companion will drink coffee.',false),
 meaning('reply','Your companion asks whether you will drink tea. Which reply declines?',['不喝','喝'],'不喝','不喝 declines the drink plan. This is recognition of a short reply.'),
 teach('like','Preference is a different meaning','喜欢 means like. It expresses a preference, not an order. 他 means he; the verb still stays the same. In connected wǒ xǐhuan, the first of the adjacent third tones rises; the pinyin spelling still shows the base tone. Speaker review of audio remains pending.', ['喜欢|like|xǐhuan','他|he|tā'],[model('我喜欢茶。','I like tea.',k('self','like','tea'),'Wǒ xǐhuan chá.')]),
 say('guided-he','he','like','coffee',false,'His profile says he likes coffee. Report that preference.',false),
 say('guided-water-question','you','like','water',true,'Ask whether your companion likes water.',false),
 say('transfer','he','like','tea',true,'You are asking a friend about another man. Ask whether he likes tea.'),
 meaning('script','Read 你喝咖啡吗？ Is this asking or telling?',['Asking','Telling'],'Asking','The final 吗 makes it a question.'),
], [say('return-self-coffee','self','like','coffee',false,'Tell your friend you like coffee.')], [say('week-he-water','he','like','water',true,'Ask whether the man likes water.')]),
course('zh','zh.drink-stock','Check the drinks available','Distinguish not having from choosing not to drink.',['zh-lesson04','zh-lesson08'],['zh.drink-choice','zh.drink-questions'],[
 recap,
 teach('availability','What is on the tray?','有 says someone has something or that it is available in this stock context. 没有 says it is not available. Do not put 不 before 有 for this meaning. 牛奶 is milk and 果汁 is fruit juice. Not drinking and not having are different.', ['有|have / available here|yǒu','没有|do not have / unavailable|méiyǒu','牛奶|milk|niúnǎi','果汁|fruit juice|guǒzhī','他|he|tā','吗|yes/no question marker|ma'],[model('我有茶。','I have tea.',k('self','have','tea'),'Wǒ yǒu chá.'),model('我没有咖啡。','I do not have coffee.',k('self','lack','coffee'),'Wǒ méiyǒu kāfēi.')]),
 say('guided-milk','self','have','milk',false,'Your tray has milk. Tell your companion.',false),
 say('guided-juice','you','lack','juice',false,'Your companion has no fruit juice. Tell them what their tray lacks.',false),
 teach('stock-question','Reuse the question ending','Put 吗 at the end, just as before. A short answer can be 有 or 没有 when the item is already clear. Those short replies are separate from new sentence construction.',[],[model('你有茶吗？','Do you have tea?',k('you','have','tea',true),'Nǐ yǒu chá ma?')]),
 say('guided-milk-question','you','have','milk',true,'Ask whether your companion has milk.',false),
 say('transfer-juice','he','have','juice',true,'You are checking a man’s tray. Ask your companion whether he has fruit juice.'),
 say('transfer-no-milk','self','lack','milk',false,'Your tray has no milk. Tell your companion.'),
 meaning('meaning','You have tea but are skipping it. Which message fits?',['我不喝茶。','我没有茶。'],'我不喝茶。','不喝 describes not drinking it; 没有 would say you do not have it.'),
], [say('return-he-no-water','he','skip','water',false,'His plan is not to drink water. Report it.'),say('return-you-juice','you','have','juice',true,'Ask whether your companion has fruit juice.')], [say('week-no-juice','self','lack','juice',false,'Say that you have no fruit juice.'),say('week-he-milk','he','like','milk',true,'Ask whether the man likes milk.')])
];
