import React, { useEffect, useState } from 'react';
import './App.css';
import { Account, EVM, Memory, Stack, Storage } from './EVM';
import { opcodes, Opcode } from './Opcodes';

import {hexToBytes} from './Utils';

function sleep (ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

interface Instruction {
  index: number;
  opcode: Opcode;
  bytes: number[];
}

function App() {
  const [pc, setPC] = useState<bigint>(0n);
  const [stack, setStack] = useState<Stack>([]);
  const [memory, setMemory] = useState<Memory>({});
  const [storage, setStorage] = useState<Storage>({});
  const [instructions, setIntructions] = useState<Instruction[]>([]);

  const caller: Account = {
    address: 0x00n,
    nonce: 0n,
    balance: 0n
  };

  const evm = new EVM();

  const deploy = () => {
    const bytecode = hexToBytes("608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e919061009d565b61007e565b005b60008054905090565b8060008190555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea2646970667358221220404e37f487a89a932dca5e77faaf6ca2de3b991f93d230604b1b8daaef64766264736f6c63430008070033");
    
    const inst: Instruction[] = [];
    for (let i = 0; i < bytecode.length;) {
      const opcode = opcodes[bytecode[i]];
      inst.push({
        index: i,
        opcode: opcode,
        bytes: bytecode.slice(i, i + opcode.byteLength)
      });
      i += opcode.byteLength;
    }
    setIntructions(inst);

    const contractAddress = evm.createAddress(caller.address, caller.nonce);
    evm.createAccount(contractAddress);

    evm.run(bytecode, async (pc, stack, memory, storage) => {
      setPC(pc);
      setStack(stack);
      setMemory(memory);
      setStorage(storage);

      await sleep(500);
    }).then(ret => {
      console.log(ret.map(byte => byte.toString(16).padStart(2, '0')).join(' '));

      evm.setCode(contractAddress, ret);
    });
  };

  return (
    <div className="layout">
      <div className="topbar">
        <div className="topbar-title">EVM</div>
      </div>

      <div className="content">
        <div className="sidebar">
          <div className="sidebar-header">PC</div>
          <div>{pc.toString()}</div>

          <div className="sidebar-header">Stack</div>
          <div className="sidebar-product-list">
            {stack.map(value => <div>
              {value.toString(16)}
            </div>)}
          </div>

          <div className="sidebar-header">Memory</div>
          <div className="sidebar-product-list">
            {Object.keys(memory).map(key => BigInt('0x' + key)).sort((a, b) => a > b ? 1 : (a < b ? -1 : 0)).map(key => <div>
              {key.toString(16)} = {memory[key.toString(16)].toString(16)}
            </div>)}
          </div>
        </div>

        <div>
          <button onClick={deploy}>Deploy</button>
          <div>
            {instructions.map(instruction => {
              return <div>
                {instruction.index} {Number(pc) == instruction.index ? <b>{instruction.opcode.mnemonic}</b> : instruction.opcode.mnemonic}
              </div>;
            })}
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default App;
