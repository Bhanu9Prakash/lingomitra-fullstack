import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as helpers from '../shared/learning-client';
test('retry response preserves text written after the original failed request',()=>{
  assert.deepEqual(helpers.reconcileAnswer?.({requestAnswer:'A',currentAnswer:'B',savedAnswer:'A',advance:false}),{answer:'B',recovery:null});
  assert.deepEqual(helpers.reconcileAnswer?.({requestAnswer:'A',currentAnswer:'B',savedAnswer:'',advance:true}),{answer:'',recovery:'B'});
});
test('active clock excludes the hidden interval even when its timer is throttled',()=>{
  const clock=helpers.ActiveClock?new helpers.ActiveClock(0):null;
  clock?.setRunning(true,0);clock?.setRunning(false,1000);clock?.setRunning(true,61000);clock?.sample(62000);
  assert.equal(clock?.pending,2000);
  clock?.consume(2000);clock?.setRunning(false,62500);clock?.sample(100000);
  assert.equal(clock?.pending,500);
});
test('unresolved recovery survives repeated reads and has its original step identity',()=>{
  const map=new Map<string,string>();const storage={getItem:(k:string)=>map.get(k)||null,setItem:(k:string,v:string)=>map.set(k,v),removeItem:(k:string)=>map.delete(k)};
  helpers.saveRecovery?.(storage,'account:activity',{answer:'B',stepId:'water',at:1000});
  assert.deepEqual(helpers.readRecovery?.(storage,'account:activity',2000),{answer:'B',stepId:'water',at:1000});
  assert.equal(helpers.readRecovery?.(storage,'account:activity',3000)?.answer,'B');
  assert.equal(helpers.readRecovery?.(storage,'another-account',3000),null);
});
