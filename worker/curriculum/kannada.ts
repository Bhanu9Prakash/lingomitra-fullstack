import { course, teach, model, prior, task, meaning } from './author';
const drinks={water:['ನೀರು','niiru'],tea:['ಟೀ','Tii'],coffee:['ಕಾಫಿ','kaafi'],milk:['ಹಾಲು','haalu']} as const;
const k=(intent:string,drink:string)=>`kn|${intent}|${drink}`;
function choice(id:string,drink:keyof typeof drinks,intent:'want'|'decline'|'offer',prompt:string,eligible=true){
 const [n,r]=drinks[drink],person=intent==='offer'?'ನಿಮಗೆ':'ನನಗೆ',pr=intent==='offer'?'nimage':'nanage',end=intent==='want'?'ಬೇಕು':intent==='decline'?'ಬೇಡ':'ಬೇಕಾ',er=intent==='want'?'beeku':intent==='decline'?'beeDa':'beekaa';
 return task('kn',id,k(intent,drink),prompt,[`${person} ${n} ${end}${intent==='offer'?'?':'.'}`,`${n} ${end}${intent==='offer'?'?':'.'}`,{text:`${pr} ${r} ${er}`,modality:'romanized'},{text:`${r} ${er}`,modality:'romanized'}],['Are you naming a want, declining, or making an offer?','The drink comes before the final need, refusal, or question word.',`${person} … ${end}`],[{match:'^(ನಾನು|naanu|nanu) ',category:'person-form',message:'This need pattern uses ನನಗೆ, nanage, for whose need it is. It does not use the ordinary I form.'},{match:'(ಬೇಕು|ಬೇಡ|ಬೇಕಾ) (ನೀರು|ಟೀ|ಕಾಫಿ|ಹಾಲು)',category:'word-order',message:'For the neutral pattern here, put the drink before the final need or refusal word.'}],eligible);
}
function give(id:string,drink:keyof typeof drinks,small:boolean,prompt:string,eligible=true,explicit=false){
 const [n,r]=drinks[drink],native=`${small?'ಸ್ವಲ್ಪ ':''}${n} ಕೊಡಿ`,roman=`${small?'svalpa ':''}${r} koDi`;
 const forms=explicit?[`ನನಗೆ ${native}`]:[native,`ನನಗೆ ${native}`,`ದಯವಿಟ್ಟು ${native}`,`ದಯವಿಟ್ಟು ನನಗೆ ${native}`];
 return task('kn',id,k('give'+(small?'-small':''),drink),prompt,[...forms,...(explicit?[{text:`nanage ${roman}`,modality:'romanized' as const}]:[{text:roman,modality:'romanized' as const},{text:`nanage ${roman}`,modality:'romanized' as const},{text:`dayaviTTu ${roman}`,modality:'romanized' as const}])],['Are you naming a wish or asking the host to act?','Put a little before the drink. Finish with the respectful give-request form.',`${small?'ಸ್ವಲ್ಪ ':''}… ಕೊಡಿ`],[{match:'(ಬೇಕು|beeku)$',category:'meaning',message:'That names a wish. This task asks the host to give the drink: use ಕೊಡಿ, koDi.'}],eligible);
}
function locate(id:string,drink:keyof typeof drinks,place:'home'|'shop'|'where',prompt:string,eligible=true){
 const [n,r]=drinks[drink],p=place==='home'?'ಮನೆಯಲ್ಲಿ':place==='shop'?'ಅಂಗಡಿಯಲ್ಲಿ':'',pr=place==='home'?'maneyalli':'angaDiyalli';
 const native=place==='where'?`${n} ಎಲ್ಲಿದೆ?`:`${n} ${p} ಇದೆ.`,roman=place==='where'?`${r} ellide`:`${r} ${pr} ide`;
 const forms=place==='where'?[native]:[native,`${n} ${p}ದೆ.`];
 return task('kn',id,k('location-'+place,drink),prompt,[...forms,{text:roman,modality:'romanized'},...(place==='where'?[]:[{text:`${r} ${pr}de`,modality:'romanized' as const}])],['Are you giving a location or asking where?','Use the complete place form, or the joined where-is expression.',place==='where'?'… ಎಲ್ಲಿದೆ?':`… ${p} ಇದೆ`],[{match:'(ಮನೆ|ಅಂಗಡಿ) ಇದೆ',category:'place-form',message:'Use the complete location form ಮನೆಯಲ್ಲಿ or ಅಂಗಡಿಯಲ್ಲಿ. The bare word just names home or shop.'}],eligible);
}
const recap=teach('recap','A drink for you','ನನಗೆ identifies my need; ನಿಮಗೆ identifies your need. Put the drink before ಬೇಕು for wanted, ಬೇಡ for not wanted, or ಬೇಕಾ for an offer question. These endings do not change with the requester’s gender. The person may be left out when it is clear from context.', ['ನನಗೆ|for me / my need|nanage','ನಿಮಗೆ|for you / your need|nimage','ನೀರು|water|niiru','ಟೀ|tea|Tii','ಕಾಫಿ|coffee|kaafi','ಹಾಲು|milk|haalu','ಬೇಕು|wanted / needed|beeku','ಬೇಡ|not wanted|beeDa','ಬೇಕಾ|wanted? / would you like?|beekaa'],[model('ನನಗೆ ನೀರು ಬೇಕು.','I want water.',k('want','water'),'nanage niiru beeku'),model('ನಿಮಗೆ ಕಾಫಿ ಬೇಕಾ?','Would you like coffee?',k('offer','coffee'),'nimage kaafi beekaa')]);
export const kannada=[
course('kn','kn-drink-choice-001','A drink for you?','Name a drink you want, decline another, and offer a choice.',['kn-lesson01','kn-lesson04','kn-lesson09'],[],[
 prior('If you already know Kannada, tell a host you want water.'),
 teach('welcome','Start with one choice','ನಮಸ್ಕಾರ, namaskaara, is a greeting. We will use a few real Kannada words beside a sound guide. You may type either for now. Romanized typing can show a message pattern; it does not show Kannada literacy or pronunciation.', ['ನಮಸ್ಕಾರ|hello/greeting|namaskaara']),
 recap,
 teach('decline','Name what you do not want','ಬೇಡ declines a wanted or offered thing in this pattern. Say which drink, then ಬೇಡ. A short drink-plus-ending message can be natural; a recalled ending alone does not show a new combination.',[],[model('ಹಾಲು ಬೇಡ.','I do not want milk.',k('decline','milk'),'haalu beeDa')]),
 meaning('meaning','Which ending declines the offered drink?',['ಬೇಡ','ಬೇಕು'],'ಬೇಡ','ಬೇಡ is not wanted; ಬೇಕು expresses a want.'),
 choice('guided-tea','tea','want','Tell the host you want tea.',false),
 choice('guided-water-offer','water','offer','Ask your guest whether they would like water.',false),
 choice('transfer-decline','coffee','decline','The host offers coffee. Decline it and name the drink.'),
 choice('transfer-offer','tea','offer','Offer your guest tea.'),
 teach('script','Notice the long vowels','ನೀರು has a long ii vowel; our guide writes niiru. ಬೇಕು and ಬೇಡ begin with long ee. Keep those sounds distinct instead of treating every doubled Latin vowel as interchangeable. The guide is temporary: try a familiar written chunk before opening it on your next visit.', ['ನೀರು|water|niiru','ಬೇಕು|wanted|beeku','ಬೇಡ|not wanted|beeDa']),
 meaning('reading','Which written chunk expresses wanted?',['ಬೇಕು','ಬೇಡ'],'ಬೇಕು','ಬೇಕು expresses a want. This is reading recognition, separate from sentence production.'),
], [choice('return-milk-offer','milk','offer','Offer your guest milk.'),choice('return-milk-decline','milk','decline','Decline milk by name.')], [choice('week-coffee','coffee','want','Tell the host you want coffee.'),choice('week-water','water','decline','Decline water by name.')]),
course('kn','kn-small-request-002','Ask for a little','Request a small amount and revise an offer.',['kn-lesson06','kn-lesson15'],['kn-drink-choice-001'],[
 recap,
 teach('give','Ask the other person to act','ಬೇಕು states a want. ಕೊಡಿ asks the other person to give it. This is already a respectful request; it does not change with your gender. You may omit ನನಗೆ when the requester is clear.', ['ಕೊಡಿ|give, respectful request|koDi'],[model('ನನಗೆ ನೀರು ಕೊಡಿ.','Please give me water.',k('give','water'),'nanage niiru koDi')]),
 teach('amount','Choose a small amount','ಸ್ವಲ್ಪ means a little or some. Put it before the drink. ದಯವಿಟ್ಟು means please and can sound more formal. The respectful request already uses ಕೊಡಿ; you need not translate every English please literally.', ['ಸ್ವಲ್ಪ|a little / some|svalpa','ದಯವಿಟ್ಟು|please|dayaviTTu'],[model('ಸ್ವಲ್ಪ ಹಾಲು ಕೊಡಿ.','Please give a little milk.',k('give-small','milk'),'svalpa haalu koDi')]),
 meaning('meaning','What does ಸ್ವಲ್ಪ specify?',['The amount','The drink name'],'The amount','ಸ್ವಲ್ಪ asks for a little or some.'),
 give('guided-coffee','coffee',false,'Ask the host to give you coffee. Make the requester explicit.',false,true),
 give('guided-water','water',true,'Ask for a small amount of water.',false),
 choice('transfer-decline','milk','decline','Milk was offered, but you prefer tea. First decline milk by name.'),
 give('transfer-tea','tea',true,'Now request a little tea.'),
 give('transfer-coffee','coffee',true,'The host is pouring a full coffee. Request just a little coffee.'),
 give('consolidation','water',true,'Try a different request: a little water.',false),
], [choice('return-decline','water','decline','Decline water by name.'),give('return-milk','milk',true,'Request a little milk.',false)], [give('week-tea','tea',false,'Ask the host to give you tea.')]),
course('kn','kn-find-drink-003','Where is the drink?','Ask where a drink is, and locate it at home or in a shop.',['kn-lesson10','kn-lesson14'],['kn-drink-choice-001','kn-small-request-002'],[
 recap,
 teach('places','Keep the place relation with the word','ಮನೆ is home and ಅಂಗಡಿ is shop. Learn the complete forms ಮನೆಯಲ್ಲಿ, at home, and ಅಂಗಡಿಯಲ್ಲಿ, in the shop. A y sound joins these words to -alli; other words can use different joining forms. ಇದೆ says the nonhuman item is there.', ['ಮನೆ|home|mane','ಅಂಗಡಿ|shop|angaDi','ಮನೆಯಲ್ಲಿ|at home|maneyalli','ಅಂಗಡಿಯಲ್ಲಿ|in the shop|angaDiyalli','ಇದೆ|is / is present, for these items|ide'],[model('ನೀರು ಮನೆಯಲ್ಲಿ ಇದೆ.','The water is at home.',k('location-home','water'),'niiru maneyalli ide')]),
 teach('where','Ask for the location','ಎಲ್ಲಿ means where. With ಇದೆ it joins as ಎಲ್ಲಿದೆ, where is it. You may also write location endings joined, as ಮನೆಯಲ್ಲಿದೆ. These patterns locate drinks; describing I am here needs a different person form.', ['ಎಲ್ಲಿ|where|elli','ಎಲ್ಲಿದೆ|where is it|ellide'],[model('ಕಾಫಿ ಎಲ್ಲಿದೆ?','Where is the coffee?',k('location-where','coffee'),'kaafi ellide')]),
 meaning('meaning','Does ಮನೆಯಲ್ಲಿ mean at home or going home?',['At home','Going home'],'At home','This form locates something; it is not a destination form.'),
 locate('guided-shop','tea','shop','Tell the host that the tea is in the shop.',false),
 locate('guided-where','milk','where','Ask where the milk is.',false),
 locate('transfer-home','coffee','home','The coffee is at home. Send that information to the host.'),
 locate('transfer-where','water','where','The host cannot find the water. Ask where it is.'),
 locate('consolidation','tea','shop','Try a different message: the tea is in the shop.',false),
], [locate('return-shop','milk','shop','Tell the host the milk is in the shop.')], [locate('week-home','tea','home','Tell the host the tea is at home.')])
];
