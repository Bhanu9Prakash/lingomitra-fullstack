// Navigation metadata only. Assessment content and keys stay on the Worker.
export const pathways=[
 {code:'de',name:'German',nativeName:'Deutsch',count:39,starters:['de-starter-01','de-starter-02','de-starter-03'],titles:['Ask for a drink','Say what you want to do','Ask someone politely'],outcome:'Make a request and combine your choices.'},
 {code:'es',name:'Spanish',nativeName:'Español',count:25,starters:['es-starter-01','es-starter-02','es-starter-03'],titles:['Say what you need','Correct a need and ask a companion','Check what the desk has'],outcome:'Say what you need or are looking for.'},
 {code:'fr',name:'French',nativeName:'Français',count:25,starters:['fr-starter-01','fr-starter-02','fr-starter-03'],titles:['Share a preference','Order with a preparation choice','Ask what is available'],outcome:'Express a preference and change its meaning.'},
 {code:'hi',name:'Hindi',nativeName:'हिन्दी',count:25,starters:['hi-checkin-001','hi-checkin-repair-002','hi-drink-habit-003'],titles:['Are we ready?','Say what is not true','What do you usually drink?'],outcome:'Check in with a host and speak for your group.'},
 {code:'zh',name:'Mandarin',nativeName:'普通话',count:30,starters:['zh.drink-choice','zh.drink-questions','zh.drink-stock'],titles:['Choose a drink','Ask about a drink choice','Check the drinks available'],outcome:'State a drink plan and ask about a choice.'},
 {code:'ja',name:'Japanese',nativeName:'日本語',count:35,starters:['ja.table-identification','ja.confirm-and-correct','ja.order-at-table'],titles:['Identify something at the table','Check and correct a label','Request one or two items'],outcome:'Help a visitor identify things at a table.'},
 {code:'kn',name:'Kannada',nativeName:'ಕನ್ನಡ',count:30,starters:['kn-drink-choice-001','kn-small-request-002','kn-find-drink-003'],titles:['A drink for you?','Ask for a little','Where is the drink?'],outcome:'Name a drink you want and offer a choice.'},
];
export const pathway=(code:string)=>pathways.find(p=>p.code===code);
export const pathwayForActivity=(id:string)=>pathways.find(p=>p.starters.includes(id)||id.startsWith(`word-${p.code}.sense.`));
