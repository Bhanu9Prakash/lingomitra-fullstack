import { course, teach, model, prior, task, meaning } from './author';
const k=(verb:string,item:string)=>`es|${verb}|${item}`;
const chunks=['necesito|I need','busco|I am looking for','un taxi|a taxi','un mapa|a map','ayuda|help','información|information','yo|I, optional here'];
function say(id:string,verb:string,item:string,prompt:string,eligible=true){
 const question=verb.endsWith('?'),v=verb.replace('?',''),subject=question?(v==='tiene'?'usted':'tú'):'yo';
 const base=`${v} ${item}`;
 const forms=question?[`¿${base}?`,`¿${subject} ${base}?`,`¿${v} ${subject} ${item}?`]:[base,`${subject} ${base}`];
 return task('es',id,k(verb,item),prompt,forms.flatMap(x=>[x,x+', por favor']),['Who is speaking, and is this a need, a search, or possession?','Keep the complete item piece. The negative word comes before the verb.',question?`¿${v} …?`:`${v} …`],[{match:'\\b(un|una) (ayuda|información)\\b',category:'vocabulary',message:'In these messages, use ayuda or información without un or una.'},{match:'\\bbusco (por|para)\\b',category:'word-order',message:'Busco already means “I am looking for”. This pattern does not add a word for “for”.'},{match:'^(yo )?(necesito|busco|tengo) no ',category:'word-order',message:'Put no before the verb.'},{match:'^(yo )?(necesito|busco|tengo) mapa$',category:'vocabulary',message:'The map piece is un mapa. Keep both words together.'}],eligible);
}
const recap=teach('recap','The pieces you already met','Necesito means I need, and busco means I am looking for. Keep un with taxi and mapa. In these messages, ayuda and información need no un. Yo is optional because the verb already identifies the speaker.',chunks,[model('Necesito ayuda.','I need help.',k('necesito','ayuda')),model('Busco un taxi.','I am looking for a taxi.',k('busco','un taxi'))]);
export const spanish=[
course('es','es-starter-01','Say what you need','Tell someone what you need or are looking for.',['es-lesson01','es-lesson06','es-lesson18'],[],[
 prior('Do you already know how to say that you need help?'),
 teach('ingredients','Two useful meanings','Necesito means I need. Busco means I am looking for. Each is already a complete I verb form. Do not add a separate word for for after busco. Keep un with taxi and mapa. Ayuda and información do not need un in these messages. We are learning these usable pieces, not every article rule.',chunks),
 teach('models','Put the need or search first','Put what you need after necesito; put what you are looking for after busco. Yo means I. You can put yo before either statement, but the verb already makes the speaker clear.',[],[model('Necesito ayuda.','I need help.',k('necesito','ayuda')),model('Busco un taxi.','I am looking for a taxi.',k('busco','un taxi'))]),
 teach('sound','Keep the vowels steady','The strong syllables are ne-ce-SI-to, BUS-co, MA-pa and in-for-ma-CIÓN. The written accent in información shows its stress. Keep Spanish o steady rather than sliding into an English oh. Sound cues support practice; they do not measure pronunciation.'),
 meaning('meaning','In the taxi example, what is the speaker doing?',['Looking for a taxi','Saying they drive a taxi for work'],'Looking for a taxi','Busco describes a search, not a job.'),
 say('guided-map','busco','un mapa','Say you are looking for a map. Use the search meaning.',false),
 say('guided-information','necesito','información','You need information. Tell someone.',false),
 say('transfer-a','necesito','un mapa','At a visitor desk, tell the person that you need a map.'),
 say('transfer-b','busco','ayuda','You are looking for help. Tell a person at the desk what you are looking for.'),
 say('consolidation','necesito','información','Try a different message: tell the person you need information.',false),
], [say('return-search-information','busco','información','Tell the visitor-desk worker you are looking for information.')], [say('week-need-taxi','necesito','un taxi','Tell your host you need a taxi.')]),
course('es','es-starter-02','Correct a need and ask a companion','Use a negative message and a familiar you question.',['es-lesson08','es-lesson09','es-lesson06'],['es-starter-01'],[
 recap,
 teach('negative','Say what is not needed','No before the verb makes these statements negative. Keep the Spanish verb; do not add an English-style do.', ['no|not; also no as a separate reply'],[model('No necesito un taxi.',"I don’t need a taxi.",k('no necesito','un taxi'))]),
 teach('companion','Ask one familiar companion','For a companion addressed as tú, use necesitas for you need and buscas for you are looking for. Question marks show the question in writing. You do not need an English-style do. Tú is optional here. These scenarios use tú; familiar address varies across Spanish-speaking places.', ['necesitas|you need, familiar singular','buscas|you are looking for, familiar singular','tú|you, familiar singular','sí|yes'],[model('¿Buscas un mapa?','Are you looking for a map?',k('buscas?','un mapa'))]),
 say('guided-question','necesitas?','información','Ask a familiar companion whether they need information.',false),
 say('guided-negative','no busco','un mapa','Say that you are not looking for a map.',false),
 say('transfer-a','no necesito','ayuda','Your companion offers help, but you do not need any. Tell them.'),
 say('transfer-a-question','buscas?','un taxi','Now ask your familiar companion whether they are looking for a taxi.'),
 say('transfer-b','no busco','información','Tell your companion that you are not looking for information.'),
 say('transfer-b-question','necesitas?','un mapa','Ask your familiar companion whether they need a map.'),
], [say('return-negative','no necesito','información','Say that you do not need information.'),say('return-question','buscas?','ayuda','Ask a familiar companion whether they are looking for help.')], [say('week-negative','no busco','un taxi','Say you are not looking for a taxi.'),say('week-question','necesitas?','ayuda','Ask a familiar companion whether they need help.')]),
course('es','es-starter-03','Check what the desk has','Ask a desk worker about availability and report your supply.',['es-lesson04','es-lesson09','es-lesson17'],['es-starter-01','es-starter-02'],[
 recap,
 teach('possession','Your supply and the desk’s supply','Tengo means I have. At this desk, tiene asks the worker, addressed as usted, whether they have something. You may include usted. Use tengo for your own supply. Politeness depends on context and delivery, not a magic word. Hola means hello; por favor means please; gracias means thank you.', ['tengo|I have','tiene|you have, addressing usted here','usted|you, formal singular here','hola|hello','por favor|please','gracias|thank you'],[model('¿Tiene un mapa?','Do you have a map?',k('tiene?','un mapa')),model('Tengo información.','I have information.',k('tengo','información'))]),
 teach('no-supply','Keep no before the verb','No before tengo says you do not have something. In this scene you are a transport agent reporting that no taxi is available to you.', ['no|not'],[model('No tengo un taxi.','I do not have a taxi available.',k('no tengo','un taxi'))]),
 say('guided-map','tengo','un mapa','You have a map. Tell your companion.',false),
 say('guided-information','tiene?','información','Ask the desk worker whether they have information. Address them as usted.',false),
 say('transfer-taxi','tiene?','un taxi','You are the visitor. Ask the transport-desk worker whether they have a taxi available.'),
 say('transfer-no-info','no tengo','información','Now you are the desk worker. Tell the visitor you have no information.'),
 say('consolidation','tiene?','un mapa','Try a different message: ask the desk worker whether they have a map.',false),
], [say('return-no-map','no tengo','un mapa','You are at the desk and have no map. Tell the visitor.')], [say('week-taxi','tengo','un taxi','You are a transport agent. Say that you have a taxi available.')])
];
