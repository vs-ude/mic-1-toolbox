import { Injectable } from '@angular/core';
import { Tokenizer } from '../tokenizer';
import { Token } from '../tokenizer';

@Injectable({
  providedIn: 'root'
})
export class ParserService {

  constructor() { }

  private tokenizer = new Tokenizer();
  private tokens: Token[];

  labels:{ [id: string] : number } = {};

  // address of current instruction
  private address: number;

  addr = Array(9)
  jam = Array(3)
  alu = Array(8)
  c = Array(9)
  mem = Array(3)
  b = Array(4)



  public init(instruction: string, address: number){
    this.tokenizer.init(instruction);
    this.tokens = this.tokenizer.getAllTokens();
    this.address = address

    // set all output Bits to 0
    this.addr.fill(0);
    this.jam.fill(0);
    this.alu.fill(0);
    this.c.fill(0);
    this.mem.fill(0);
    this.b.fill(0);
  }


  parse(){
    if(this.tokens.length == 0){
      throw new Error("EmptyInstructionError");
    }

    this.setAddr(this.address + 1);

    this.newLabel();

    this.setCBus();

    this.setAlu();

    // goto and Memory Instructions are optional
    while (this.tokens.length != 0){
      switch (this.tokens[0].type) {
        case "MEMORY_INSTRUCTION":
          this.setMemory();
          break;  
  
        case "GOTO":
          this.goto();
          break;

        default:
          throw new Error(`Unexpected Token: ${this.tokens[0].value}`);
      }
      
    }
    console.log(`Parser Output:
      Addr:  ${this.addr.join("")},
      JAM:   ${this.jam.join("")},
      Alu:   ${this.alu.join("")},
      C:     ${this.c.join("")},
      Mem:   ${this.mem.join("")},
      B:     ${this.b.join("")}, 
    `)

  }


  private findNextDivider(): number{
    let dividerPos = 0
    for (let i= 0; i<this.tokens.length; i++){
      if(this.tokens[i].type == "DIVIDER"){
        dividerPos = i;
        break;
      }
    }

    // Found no divider -> no other Operation after
    if (dividerPos == 0){
      dividerPos = this.tokens.length - 1;
    }
    return dividerPos;
  }

  private setAddr(address: number){
    let binaryString = ((address) >>> 0 ).toString(2);

    let cursor = 0;
    for (let i = this.addr.length - binaryString.length; i < this.addr.length; i++){
      this.addr[i] = binaryString[cursor];
      cursor ++;
    }
    
  }

  private goto() {
    // find next DIVIDER or end of Instruction
    let dividerPos = this.findNextDivider();

    // after Goto must come a LABEL
    let labelToken = this.tokens[1]
    if (labelToken.type != "LABEL"){
      throw new Error(`Unexpected Token: ${labelToken.value}, a label was expected.`);
    }

    // Overwrite nextAddress to the Address of the label
    this.addr.fill(0);
    if (labelToken.value in this.labels){
      let nextAddress = this.labels[labelToken.value];
      this.setAddr(nextAddress);
    }else{
      throw new Error(`UnknownLabelError: Label "${labelToken.value}" has not yet been created`);
    }

    // consume Tokens
    this.tokens = this.tokens.slice(dividerPos+1);
  }

  private setMemory() {
    // find DIVIDER or end of instruction
    let dividerPos = this.findNextDivider();

    const memoryInst:{ [id: string] : number } = {"wr":0, "rd": 1, "fetch": 2};
    
    // set Mem Bit
    this.mem[memoryInst[this.tokens[0].value]] = 1;
    
    // consume Tokens
    this.tokens = this.tokens.slice(dividerPos + 1);

  }

  private setAlu() {

    // find DIVIDER or end of instruction
    let dividerPos = this.findNextDivider();

    // we can either have zero, one or two Registers in the Alu-Instruction
    let aluInstruction = this.tokens.slice(0,dividerPos+1);
    let registerAmount = aluInstruction.filter(x => x.type == "REGISTER").length

    // split shifter and Alu instructions
    let shifterInstruction: Token[] = [];
    for (let i= 0; i < aluInstruction.length; i++){
      if(aluInstruction[i].type == "BITWISE_OPERATOR"){
        shifterInstruction = aluInstruction.splice(i,2);
      }
    }


    switch (registerAmount) {
      case 0:
        this.aluCase0Reg(aluInstruction);
        break;
      
      case 1:
        this.aluCase1Reg(aluInstruction);
        break;
      
      case 2:
        this.aluCase2Reg(aluInstruction);
        break;  

      default:
        throw new Error("InvalidAluInstruction - The ALU can only use a maximum of two registers");
    }

    // check for shifter instruction
    if(shifterInstruction.length == 2){
      // Logical Left Shift
      if(shifterInstruction[0].value == "<<"){
        if(shifterInstruction[1].value == "8"){
          this.alu[0] = 1;
        }else{
          throw new Error("InvalidAluInstruction - the only valid logical left shift is by 8 bits");
        }
      }
      
      // Arithmetic right shift
      if(shifterInstruction[0].value == ">>"){
        if(shifterInstruction[1].value == "1"){
          this.alu[1] = 1;
        }else{
          throw new Error("InvalidAluInstruction - the only valid arithmetic right shift is one by bit");
        }
      }
    }

    // consume Tokens
    this.tokens = this.tokens.slice(dividerPos + 1);
  }

  private aluCase0Reg(aluInstruction: Token[]) {
    // Alu Instructions without a any Register can either be "0" , "1" or "-1".

    // check for sign (+/-)
    if (aluInstruction[0].type == "ADDITIVE_OPERATOR") {
      // - -> can only be "-1" instruction
      if (aluInstruction[0].value == "-"){
        if(aluInstruction[1].value == "1"){
          this.alu = [0,0,1,1,0,0,1,0];
          return;
        }else{ throw new Error("InvalidAluInstruction");}
      // + -> remove unnecessary sign
      }else{ aluInstruction.shift(); }
    }

    // 0 
    if (aluInstruction[0].value == "0"){
      this.alu = [0,0,0,1,0,0,0,0];
      return;
    }

    // 1
    if (aluInstruction[0].value == "1") {
      this.alu = [0,0,1,1,0,0,0,1];
      return;
    }

    throw new Error("InvalidAluInstruction");
  }

  private aluCase1Reg(aluInstruction: Token[]) {
    // Alu instructions with one Register can be "A", "B", "-A", "A+1", "B+1" or "B-1". 

    // Check of sign (+/-)
    if (aluInstruction[0].type == "ADDITIVE_OPERATOR"){
      // - -> can only be "-A" instruction
      if (aluInstruction[0].value == "-") {
        if (aluInstruction[1].value == "H") {
          this.alu = [0,0,1,1,1,0,1,1,];
          return;
        } else { throw new Error('InvalidAluInstruction - only valid subtraction is "-H" or "-1" ');}
      // + -> remove unnecessary sign
      }else{ aluInstruction.shift(); }
    }

    // first Operand must be a Register or a one
    if (aluInstruction[0].type != "REGISTER" && aluInstruction[0].value != "1") {
      throw new Error("InvalidAluInstruction");
    }

    
    if (aluInstruction.length > 2){
      // B-1
      if (aluInstruction[1].value == "-" && aluInstruction[2].value == "1"){
        this.alu = [0,0,1,1,0,1,1,0];
        this.setBBus(aluInstruction[0].value);
        return;
      }

      if (aluInstruction[1].value != "+"){ throw new Error("InvalidAluInstruction"); }

      // A + 1 || 1 + A
      if ( aluInstruction[0].value == "H" || aluInstruction[2].value == "H" ) {
        this.alu = [0,0,1,1,1,0,0,1];
        return;
      }

      // B + 1 || 1 + B
      if (aluInstruction[0].value == "1" || aluInstruction[2].value == "1"){
        this.alu = [0,0,1,1,0,1,0,1];
        aluInstruction[0].type == "REGISTER" ? this.setBBus(aluInstruction[0].value) : this.setBBus(aluInstruction[2].value);
        return;
      }
    }

    // A
    if (aluInstruction[0].value == "H"){
      this.alu = [0,0,0,1,1,0,0,0];
      return;
    }


    // B
    this.alu = [0,0,0,1,0,1,0,0];
    this.setBBus(aluInstruction[0].value);

    if(aluInstruction.length == 1){
      return;
    }

    if(aluInstruction[1].type != "DIVIDER"){
      throw new Error("InvalidAluInstruction");
    }

  }

  private aluCase2Reg(aluInstruction: Token[]) {
    // Alu instructions with two registers can be "A+B", "A+B+1", "B-A", "A AND B" or "A OR B"

    if(aluInstruction[0].type != "REGISTER" && aluInstruction[0].value != "1"){ throw new Error("InvalidAluInstruction"); }

    // A+B+1
    if (aluInstruction.length > 4){
      let one = false;
      let h = false;
      let reg = false;
      for (let i = 0; i<aluInstruction.length; i++){

        // ignore "+" but "-" can not occur
        if( aluInstruction[i].type == "ADDITIVE_OPERATOR"){
          if(aluInstruction[i].value == "+"){continue;}
          throw new Error("InvalidAluInstruction - can not use '-' in this context");
         }

        // ignore Divider
        if( aluInstruction[i].type == "DIVIDER"){ continue; }

        // The "+1" can only occur once
        if( aluInstruction[i].value == "1"){ 
          if (!one) {one = true;}
          else{ throw new Error("InvalidAluInstruction - can only do '+1' once per ALU-instruction");}
          continue;}

        // H register can only occur once
        if( aluInstruction[i].value == "H"){
          if (!h) { h = true;} 
          else { throw new Error("InvalidAluInstruction - H Register can only occur once"); }
          continue;}

        // Other register can only occur once
        if( aluInstruction[i].value != "1" && aluInstruction[i].value != "H"){
          if(!reg){ 
            reg = true;
            this.setBBus(aluInstruction[i].value);
          }else{ throw new Error("InvalidAluInstruction - ALU can only calculate with one B-Bus Register per instruction");}
        }

      }
      if( !one || !h || !reg){ throw new Error("InvalidAluInstruction"); }
      this.alu= [0,0,1,1,1,1,0,1];
      return;
    }

    // Instructions with one operator
    let h = false;
    let reg = false;
    let op = false;
    for (let i= 0; i< aluInstruction.length; i++){
      // ignore Divider
      if (aluInstruction[i].type == "DIVIDER") {continue;}
        
      // Logical Operations
      if (aluInstruction[i].type == "LOGICAL_OPERATOR"){
        if(!op){op = true;}
        else{throw new Error("InvalidAluInstruction - to many Operators in this Alu-instruction")}

        // A AND B
        if(aluInstruction[i].value == "AND"){
          this.alu = [0,0,0,0,1,1,0,0];
          continue;
        }

        // A OR B
        if (aluInstruction[i].value == "OR") {
          this.alu = [0,0,0,1,1,1,0,0];
          continue;
        }
        throw new Error("InvalidAluInstruction");
      }

      // Additive Operators
      if(aluInstruction[i].type == "ADDITIVE_OPERATOR"){
        if(!op){op = true;}
        else{ throw new Error("InvalidAluInstruction - to many Operators in this Alu-instruction") }

        // A+B
        if (aluInstruction[i].value == "+") {
          this.alu = [0,0,1,1,1,1,0,0];
          continue;
        }

        // B-A
        // right operator has to be the H Register
        if (aluInstruction[i+1].value != "H"){ throw new Error("InvalidAluInstruction - only valid subtrahends are H or 1")}
        this.alu = [0,0,1,1,1,1,1,1,];
      }

      // H Register can only occur once
      if (aluInstruction[i].value == "H"){
        if(!h){
          h = true;
          continue;
        }else{ throw new Error("InvalidAluInstruction - H Register can only be used once per Alu-instruction")}
      }

      // B-Bus Register can occur only once
      if (aluInstruction[i].type == "REGISTER"){
        if(!reg){
          reg = true;
          this.setBBus(aluInstruction[i].value);
          continue;
        }else{ throw new Error("InvalidAluInstruction - ALU can only calculate with one B-Bus Register per instruction")}
      }
    }

  }

  private setBBus(register:string){
    const regEncoding: {[id: string] : number[]} = { "MDR": [0,0,0,0], "PC":[0,0,0,1] , "MBR":[0,0,1,0], "MBRU":[0,0,1,1],
                          "SP":[0,1,0,0], "LV":[0,1,0,1], "CPPP":[0,1,1,0], "TOS":[0,1,1,1], "OPC":[1,0,0,0]}
    
    if (register in regEncoding) {
      this.b = regEncoding[register];
      return;
    }
    throw new Error("UnknownRegister - " + register + "is not a valid B-Bus register");
    

  }

  private setCBus(){

    // c-bus Bits -> find last Assignment -> instruction to the left are c-bus instructions
    let pos = 0
    let foundAssignment = false;
    for(let i = 0; i < this.tokens.length; i++){
      if (this.tokens[i].type == "ASSIGNMENT_OPERATOR"){
        pos = i;
        foundAssignment = true;
      }
    }

    if(!foundAssignment){throw new Error("SyntaxError - Microinstruction needs at least one assignment (=)");}

    // all registers than can be written
    const registers :{ [id: string] : number }={"H":0,"OPC":1,"TOS":2,"CPP":3,"LV":4,"SP":5,"PC":6,"MDR":7,"MAR":8}

    let nextToken: Token;
    for (let i=0; i <= pos; i++){
      nextToken = this.tokens[i];

      // all even indexes must be Registers
      if ( i % 2 == 0){
        if (nextToken.type == "REGISTER") {
          this.c[registers[nextToken.value]] = 1;
        }else{
          throw new Error(`Unexpected Token: ${nextToken.value}`);
          
        }
      // all odd indexes must be Assignments
      }else{
        if (nextToken.type != "ASSIGNMENT_OPERATOR") {
          throw new Error(`Unexpected Token: ${nextToken.value}`);
        }
      }
    }
    // consume tokens
    this.tokens = this.tokens.slice(pos+1);
  }

  private newLabel(){
    //look at first token -> token can either be "NEW_LABEL" or "REGISTER"
    
    if(this.tokens[0].type == "NEW_LABEL"){

      // consume first Token and remove ":" from Label
      let labelName = this.tokens.shift().value.slice(0,-1);

      //check if Label already exists -> Error
      if (labelName in this.labels){
        throw new Error(`DuplicateLabelError - Label "${labelName}" already exists`);
      }

      // create new label
      this.labels[labelName] = this.address;

      
    }else if(this.tokens[0].type == "REGISTER"){
      return;
    }else{
      throw new SyntaxError(`Unexpected token: ${this.tokens[0].value}`);
    }
    
  }

}