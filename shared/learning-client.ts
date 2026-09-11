export function reconcileAnswer({requestAnswer,currentAnswer,savedAnswer,advance}:{requestAnswer:string;currentAnswer:string;savedAnswer:string;advance:boolean}) {
  const newer=currentAnswer!==requestAnswer;
  return {answer:advance?savedAnswer:newer?currentAnswer:savedAnswer,recovery:advance&&newer?currentAnswer:null};
}
export class ActiveClock {
  pending=0; private running=false;
  constructor(private last:number){}
  sample(at:number){if(this.running)this.pending+=Math.max(0,at-this.last);this.last=at;return this.pending;}
  setRunning(running:boolean,at:number){this.sample(at);this.running=running;}
  consume(ms:number){this.pending=Math.max(0,this.pending-ms);}
}
type StorageLike=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type Recovery={answer:string;stepId:string;at:number};
export function saveRecovery(storage:StorageLike,key:string,record:Recovery){storage.setItem(key,JSON.stringify(record));}
export function readRecovery(storage:StorageLike,key:string,at=Date.now()):Recovery|null {
  try{const value=JSON.parse(storage.getItem(key)||'null');if(!value||typeof value.answer!=='string'||typeof value.stepId!=='string'||typeof value.at!=='number')return null;if(at-value.at>86400000){storage.removeItem(key);return null;}return value;}catch{return null;}
}
