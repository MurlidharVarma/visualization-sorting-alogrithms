import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as _ from 'underscore';
import * as utils from '../../utils';

@Component({
  selector: 'display-bars',
  templateUrl: './display-bars.component.html',
  styleUrls: ['./display-bars.component.scss']
})
export class DisplayBarsComponent implements OnInit {

  NUMBER_OF_BARS: number=50;
  NO_OF_COMPARISION: number=0;
  NO_OF_SWAPS: number=0;
  EXECUTION_TIME:any=0;

  SORT_TYPE = "quick";
  SORT_TYPES = ["quick","bubble"];
  sortTypeIdx = 0;
  sortTypeMaxIdx = this.SORT_TYPES.length-1;

  numberSet: any;
  range: any;
  original:any;
  numberOfBars: FormControl;

  isShuffleClicked=false;
  isSortingStarted=false;
  breakSorting=false;
  isResetClicked=false;

  constructor() {
    this.numberSet = _.shuffle(_.range(1, 100));
    
    this.numberOfBars = new FormControl(this.NUMBER_OF_BARS,Validators.compose([Validators.required, Validators.min(10), Validators.max(50)]));

    this.numberOfBars.valueChanges.subscribe((data:number)=>{
      if(data){
        this.NUMBER_OF_BARS = data;
        this.resize();
      }
    })
  }

  ngOnInit(): void {
    this.resize();
  }

  changeSortType(arrow){
    if(arrow=='left' && this.sortTypeIdx != 0){
      this.sortTypeIdx--;
      this.SORT_TYPE = this.SORT_TYPES[this.sortTypeIdx];
    }else if(arrow == 'right' && this.sortTypeIdx != this.sortTypeMaxIdx){
      this.sortTypeIdx++;
      this.SORT_TYPE = this.SORT_TYPES[this.sortTypeIdx];
    }
  }

  async reset(){
    this.isResetClicked=true;
    this.breakSorting=true;
    await utils.sleep(1000);
    this.range = this.original;
    this.breakSorting=false;
    this.isResetClicked=false;
  }

  resize(){
    this.range = _.chain(this.numberSet)
                  .first(this.NUMBER_OF_BARS)
                  .map(e=>{
                    return {
                      value: e,
                      color: 'orange'
                    }
                  })
                  .value();
    this.original = JSON.parse(JSON.stringify(this.range));
  }

  async shuffle(){
    this.isShuffleClicked=true;
    this.breakSorting=true;
    await utils.sleep(1000);
    this.numberSet = _.shuffle(_.range(1, 100));
    this.range = _.chain(this.numberSet)
                  .sample(this.NUMBER_OF_BARS)
                  .map(e=>{
                    return {
                      value: e,
                      color: 'orange'
                    }
                  })
                  .value();
      this.original = JSON.parse(JSON.stringify(this.range));
      await utils.sleep(250);
      this.isShuffleClicked = false;
      this.breakSorting=false;
  }

  async sortStart(){
    if(this.isSortingStarted){
      return;
     }
    this.original = JSON.parse(JSON.stringify(this.range));
    this.isSortingStarted=true;
    this.NO_OF_COMPARISION = 0;
    this.NO_OF_SWAPS=0;
    let start = Date.now();
    let interval = setInterval(()=>{
      this.EXECUTION_TIME = Math.round((Date.now() - start)/1000);
    },1000);

    switch(this.SORT_TYPE){
      case "bubble": await this.bubbleSort(); break;
      case "quick": await this.quickSort(); break;
    }
    
    clearInterval(interval);
    this.isSortingStarted=false;
  }

  async assignColor(idx, color){
    this.range[idx].color = color;
    this.range[idx] = Object.assign({},this.range[idx]);
    await utils.sleep(25); 
  }


  async swap(idx1, idx2){

    await this.assignColor(idx1, "magenta")
    await this.assignColor(idx2, "magenta")

    let e1 = this.range[idx1];
    let e2 = this.range[idx2];

    this.range[idx1] =e2;
    this.range[idx2] =e1;  
    
    this.NO_OF_SWAPS++;

    await utils.sleep(25);  

  }

  isSmaller(idx1, idx2){
    if(this.range[idx1].value < this.range[idx2].value){
      return true;
    }else{
      return false;
    }
  }

 async bubbleSort(){
    for(let i=0; i<this.range.length; i++){
      await this.assignColor(i, "green");

      for(let j=i; j<this.range.length; j++){
        this.NO_OF_COMPARISION++;
        await this.assignColor(j, "green");

        if(this.isSmaller(j,i)){
          await this.swap(j,i);
        }
        await this.assignColor(j, "orange");
        
      }
      await this.assignColor(i, "blue");
      if(this.breakSorting){
        break;
      }
   }
  }

  async quickSort(){
    await this.doQuickSort(0,this.NUMBER_OF_BARS-1);
  }

  async doQuickSort(startIdx,endIdx){
    if(endIdx-startIdx <= 1){
      await this.assignColor(startIdx,"blue");
      await this.assignColor(endIdx,"blue");
      return;
    }

    let pivotIdx = Math.floor((startIdx + endIdx)/2);
    let pivot = this.range[pivotIdx].value;
  
    let leftIdx = startIdx;
    let rightIdx = endIdx;
    
    let foundLeft=false;
    let foundRight=false;

    while(leftIdx < rightIdx){
      let left=this.range[leftIdx].value;
      let right = this.range[rightIdx].value;

      if(left >= pivot){
        this.NO_OF_COMPARISION++;
        foundLeft = true;
      }else if(!foundLeft){
        leftIdx++;
      }

      await this.assignColor(leftIdx,"green");

      if(right <= pivot){
        this.NO_OF_COMPARISION++;
        foundRight=true;
      }else if(!foundRight){
        rightIdx--;
      }

      await this.assignColor(rightIdx,"green");
      
      if(foundRight && foundLeft){
        await this.swap(leftIdx, rightIdx);
        foundLeft=false;
        foundRight=false;
      }

      await this.assignColor(leftIdx,"orange");
      await this.assignColor(rightIdx,"orange");

    }
    await this.doQuickSort(startIdx, leftIdx);
    await this.doQuickSort(leftIdx+1,endIdx);

    return;
  }

  display(start, end){
    console.log(_.map(this.range,e=>e.value).slice(start,end+1));
  }
}