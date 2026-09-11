import { course, teach, model, prior, task, meaning } from './author';
const persons={self:['मैं','main','हूँ','hoon'],group:['हम','ham','हैं','hain'],you:['आप','aap','हैं','hain']} as const;
const states={here:['यहाँ','yahaan'],okay:['ठीक','theek'],ready:['तैयार','taiyaar'],tiredM:['थका','thakaa'],tiredF:['थकी','thakii']} as const;
const k=(person:string,state:string,negative=false,question=false)=>`hi|state|${person}|${state}|${negative}|${question}`;
function state(id:string,person:keyof typeof persons,description:keyof typeof states,prompt:string,negative=false,question=false,eligible=true){
 const [p,pr,c,cr]=persons[person],[s,sr]=states[description];
 const native=`${question?'क्या ':''}${p} ${s} ${negative?'नहीं ':''}${c}${question?'?':'।'}`;
 const roman=`${question?'kya ':''}${pr} ${sr} ${negative?'nahin ':''}${cr}`;
 return task('hi',id,k(person,description,negative,question),prompt,[native,{text:roman,modality:'romanized'}],['Who is the message about? Is it a statement or a question?','Keep the state before the person ending. For a negative, put नहीं before that ending.',`${question?'क्या ':''}${p} … ${negative?'नहीं ':''}${c}`],[{match:'^मैं .* हैं',category:'agreement',message:'The state is clear. With मैं, finish this pattern with हूँ.'},{match:'^(हम|आप) .* हूँ',category:'agreement',message:'Keep the person you chose. हम and respectful आप use हैं here.'},{match:'^main .* hain$',category:'agreement',message:'With main, use hoon. Hain belongs with ham or respectful aap here.'}],eligible);
}
const drinks={tea:['चाय','chaay'],water:['पानी','paanii'],milk:['दूध','duudh']} as const;
const habitKey=(role:string,drink:string)=>`hi|habit|${role}|${drink}`;
function habit(id:string,role:'selfM'|'selfF'|'youM'|'youF',drink:keyof typeof drinks,prompt:string,eligible=true){
 const you=role.startsWith('you'),female=role.endsWith('F'),v=female?'पीती':you?'पीते':'पीता',vr=female?'piitii':you?'piite':'piitaa';
 const [n,r]=drinks[drink],native=`${you?'क्या आप':'मैं'} ${n} ${v} ${you?'हैं?':'हूँ।'}`,roman=`${you?'kya aap':'main'} ${r} ${vr} ${you?'hain':'hoon'}`;
 return task('hi',id,habitKey(role,drink),prompt,[native,{text:roman,modality:'romanized'}],['Whose usual practice are you describing?','The drink goes before the action; choose the form for the stated role.',`${you?'क्या आप':'मैं'} … ${v} ${you?'हैं':'हूँ'}`],[{match:'(पीता|पीती|पीते) (चाय|पानी|दूध)',category:'word-order',message:'For the neutral pattern we taught, put the drink before the action.'},{match:'^क्या आप .* हूँ',category:'agreement',message:'Keep respectful आप and finish with हैं.'}],eligible);
}
const recap=teach('recap','A quick check-in','मैं means I, हम means we, and आप addresses someone respectfully. Here, ठीक and तैयार name a state, followed by हूँ with मैं or हैं with हम and आप. यहाँ means here. क्या at the beginning can turn the statement into a yes/no question.', ['मैं|I|main','हम|we|ham','आप|you, respectful|aap','यहाँ|here|yahaan','ठीक|okay|theek','तैयार|ready|taiyaar','हूँ|am, with I|hoon','हैं|are, with we/respectful you|hain','क्या|yes/no question marker here|kya'],[model('मैं यहाँ हूँ।','I am here.',k('self','here'), 'main yahaan hoon')]);
export const hindi=[
course('hi','hi-checkin-001','Are we ready?','State how you or your group are, and check on a host.',['hi-lesson01','hi-lesson04','hi-lesson09'],[],[
 prior('If you already know Hindi, tell a host that you are here.'),
 teach('arrival','A short check-in','You can greet the host with नमस्ते, namaste. This is a useful greeting, not a new sentence-construction score. You can type Hindi or the sound guide for now. Romanized input checks meaning and pattern, not Devanagari writing or pronunciation.',['नमस्ते|hello/greeting|namaste']),
 recap,
 teach('question','Check on another person','With respectful आप, use हैं. Put क्या first to ask a neutral yes/no question. This is respectful you even when addressing one person. These state words do not change with the speaker’s gender.',[],[model('क्या आप तैयार हैं?','Are you ready?',k('you','ready',false,true),'kya aap taiyaar hain')]),
 meaning('meaning','What does क्या do at the start of this check-in?',['Asks a yes/no question','Means that someone is not ready'],'Asks a yes/no question','The state stays the same; the opening marker makes it a question.'),
 state('guided-okay','self','okay','Tell the host that you are okay.',false,false,false),
 state('guided-here','group','here','Speak for your group. Tell the host you are all here.',false,false,false),
 state('transfer-ready','group','ready','Your group has finished getting ready. Tell the host that you are ready.'),
 state('transfer-question','you','okay','Politely ask the host whether they are okay.',false,true),
 teach('script','Meet the real written words','Look at मैं and हम. They represent different people: I and we. The marks in हूँ and हैं distinguish these endings in writing. Keep Hindi script beside the sound guide during teaching; on later visits, try reading a familiar chunk before opening its guide. You do not need to learn the entire alphabet first.', ['मैं|I|main','हम|we|ham','हूँ|I ending|hoon','हैं|we/respectful you ending|hain']),
 meaning('reading','Which written chunk means we?',['मैं','हम'],'हम','हम means we. This is script recognition, separate from composing a sentence.'),
], [state('return-ready','self','ready','Tell the host that you are ready.'),state('return-group-okay','group','okay','Tell the host your group is okay.')], [state('week-group-question','group','ready','Ask whether your group is ready.',false,true),state('week-you-here','you','here','Respectfully tell the host that they are here.')]),
course('hi','hi-checkin-repair-002','Say what is not true','Deny a state and keep the person’s agreement.',['hi-lesson08','hi-lesson11'],['hi-checkin-001'],[
 recap,
 teach('negative','Keep the ending when you say not','नहीं means not. In these state sentences, place it before हूँ or हैं.', ['नहीं|not|nahin'],[model('मैं तैयार नहीं हूँ।','I am not ready.',k('self','ready',true),'main taiyaar nahin hoon')]),
 teach('agreement','Two forms of the same state','Some descriptions change form. A character using masculine agreement can say मैं थका हूँ; a character using feminine agreement can say मैं थकी हूँ. Both mean I am tired. Use the role stated in the prompt; you need not disclose your identity. ठीक and तैयार did not change. Do not turn every Hindi word ending in aa into ii. Keep tiredness about I today.', ['थका|tired, masculine singular agreement|thakaa','थकी|tired, feminine singular agreement|thakii'],[model('मैं थका हूँ।','I am tired, masculine agreement.',k('self','tiredM'),'main thakaa hoon'),model('मैं थकी हूँ।','I am tired, feminine agreement.',k('self','tiredF'),'main thakii hoon')]),
 meaning('meaning','Which piece makes the state negative?',['नहीं','हूँ'],'नहीं','हूँ connects the statement to I. नहीं reverses the state.'),
 state('guided-tired','self','tiredM','Use the character with masculine agreement. Say you are not tired.',true,false,false),
 state('guided-group','group','here','Your group is elsewhere. Tell the host your group is not here.',true,false,false),
 state('transfer-tired','self','tiredF','Use the character with feminine agreement. Someone thinks you are tired; deny that.',true),
 state('transfer-question','you','ready','You think the host is not ready. Politely ask to check that impression.',true,true),
 state('consolidation','self','ready','Try a different state: say you are not ready.',true,false,false),
], [state('return-not-here','self','here','You are elsewhere. Tell someone you are not here.',true)], [state('week-group-not-ready','group','ready','Tell the host your group is not ready.',true)]),
course('hi','hi-drink-habit-003','What do you usually drink?','Describe a usual drink and ask a respectful habit question.',['hi-lesson06','hi-lesson09'],['hi-checkin-001','hi-checkin-repair-002'],[
 recap,
 teach('drinks','A usual practice','पानी is water, चाय tea, and दूध milk. पीना means to drink. These forms describe a usual practice, not “I am drinking right now”. Put the drink before the action. For I, use पीता with masculine agreement or पीती with feminine agreement, then हूँ.', ['पानी|water|paanii','चाय|tea|chaay','दूध|milk|duudh','पीना|to drink|piinaa','पीता|habitual form, I with masculine agreement|piitaa','पीती|habitual form with feminine agreement|piitii'],[model('मैं चाय पीता हूँ।','I usually drink tea, masculine agreement.',habitKey('selfM','tea'),'main chaay piitaa hoon'),model('मैं पानी पीती हूँ।','I usually drink water, feminine agreement.',habitKey('selfF','water'),'main paanii piitii hoon')]),
 teach('guest','Keep the guest’s agreement','For the respectful guest in today’s roles, masculine agreement uses पीते हैं; feminine agreement uses पीती हैं. The guest determines the agreement, not the drink. We are not learning all Hindi tense patterns.', ['पीते|habitual form, respectful masculine agreement|piite'],[model('क्या आप पानी पीते हैं?','Do you usually drink water? Respectful masculine agreement.',habitKey('youM','water'),'kya aap paanii piite hain')]),
 meaning('meaning','What does the last question ask?',['Whether the guest usually drinks water','Whether the guest wants water right now'],'Whether the guest usually drinks water','This is a habit question. A present request uses another construction.'),
 habit('guided-guest','youF','tea','Politely ask a guest using feminine agreement whether she usually drinks tea.',false),
 habit('guided-self','selfM','milk','Use masculine agreement for yourself. Say you usually drink milk.',false),
 habit('transfer-self','selfF','milk','Use feminine agreement for yourself. Tell the host milk is a drink you usually have.'),
 habit('transfer-guest','youM','tea','Politely ask a guest using masculine agreement whether he usually drinks tea.'),
 teach('reading','Notice the written drink','Read पानी and दूध with the optional guide. Use your device’s Hindi keyboard if you want to enter one known word. Script practice is recorded separately from sentence meaning.', ['पानी|water|paanii','दूध|milk|duudh']),
], [habit('return-guest','youF','milk','Politely ask a guest using feminine agreement whether she usually drinks milk.')], [habit('week-self','selfM','water','Use masculine agreement. Say that you usually drink water.')])
];
