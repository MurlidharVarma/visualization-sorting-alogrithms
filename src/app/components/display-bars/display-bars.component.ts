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

  isLight:boolean = true;
  
  NUMBER_OF_BARS: number=49;
  NO_OF_COMPARISION: number=0;
  NO_OF_SWAPS: number=0;
  EXECUTION_TIME:any=0;

  DELAY_TYPES=["FAST", "MEDIUM", "SLOW"];
  DELAY=0;
  DELAY_SPEED=[0,25,100];
  DELAY_TYPE="FAST";
  delayTypeIdx=0;
  delayTypeMaxIdx = this.DELAY_TYPES.length-1;

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
    //initializing numbers from 1 to 100
    this.numberSet = _.shuffle(_.range(1, 100));
    
    //form control for number of bars field
    this.numberOfBars = new FormControl(this.NUMBER_OF_BARS,Validators.compose([Validators.required, Validators.min(10), Validators.max(50)]));

    //observing changes made to number of bars and accordingly rendering bars
    this.numberOfBars.valueChanges.subscribe((data:number)=>{
      if(data &&  this.numberOfBars.valid){
        this.NUMBER_OF_BARS = data;
        this.resize();
      }
    })
  }

  // on page load resize number of bars based on default value
  ngOnInit(): void {
    this.resize();
  }

  toggleTheme(){
    this.isLight = !this.isLight;
  }
  
  // function that controls the change made in alogirthm selection using the arrow buttons
  changeSpeed(arrow){
    if(arrow=='left' && this.delayTypeIdx != 0){
      this.delayTypeIdx--;
      this.DELAY_TYPE = this.DELAY_TYPES[this.delayTypeIdx];
      this.DELAY = this.DELAY_SPEED[this.delayTypeIdx];
    }else if(arrow == 'right' && this.delayTypeIdx != this.delayTypeMaxIdx){
      this.delayTypeIdx++;
      this.DELAY_TYPE = this.DELAY_TYPES[this.delayTypeIdx];
      this.DELAY = this.DELAY_SPEED[this.delayTypeIdx];
    }
  }

  // function that controls the change made in alogirthm selection using the arrow buttons
  changeSortType(arrow){
    if(arrow=='left' && this.sortTypeIdx != 0){
      this.sortTypeIdx--;
      this.SORT_TYPE = this.SORT_TYPES[this.sortTypeIdx];
    }else if(arrow == 'right' && this.sortTypeIdx != this.sortTypeMaxIdx){
      this.sortTypeIdx++;
      this.SORT_TYPE = this.SORT_TYPES[this.sortTypeIdx];
    }
  }

  // Reset button function
  async reset(){
    this.isResetClicked=true;
    this.breakSorting=true;
    await utils.sleep(1000);
    this.range = this.original;
    this.breakSorting=false;
    this.isResetClicked=false;
  }

  // changes the number of bars on screen
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

  // Shuffle the bar values to random numbers
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

  // Initates sorting based on selected alogrithm
  async sortStart(){
    if(this.isSortingStarted || !this.numberOfBars.valid){
      return;
     }
    this.original = JSON.parse(JSON.stringify(this.range));
    this.isSortingStarted=true;
    this.NO_OF_COMPARISION = 0;
    this.NO_OF_SWAPS=0;
    this.EXECUTION_TIME=0;
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

  // assign color to bar at the a specific index
  async assignColor(idx, color){
    this.range[idx].color = color;
    this.range[idx] = Object.assign({},this.range[idx]);
    await utils.sleep(this.DELAY); 
  }

  // swap bars at the provided 2 indices.
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

// Check if the bar on index 1 is smaller that 2
  isSmaller(idx1, idx2){
    if(this.range[idx1].value < this.range[idx2].value){
      return true;
    }else{
      return false;
    }
  }

// Bubble sort logic
 async bubbleSort(){
   
    // loop thru each bar in the set
    for(let i=0; i<this.range.length; i++){
      await this.assignColor(i, "green");

      // loop thru remaining bars for comparision
      for(let j=i; j<this.range.length; j++){
        this.NO_OF_COMPARISION++;
        await this.assignColor(j, "green");
        
        // if any bar is found smaller, then swap
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

// Quick Sort logic
  async quickSort(){
    await this.doQuickSort(0,this.NUMBER_OF_BARS-1);
    return;
  }

// Recursive method to do quick sort
  async doQuickSort(startIdx,endIdx){

    // if the start and end indices are adjacent or same then return back.

    if(endIdx-startIdx <= 1){
      //when this occurs means those respective bars are in sorted order
      await this.assignColor(startIdx,"blue");
      await this.assignColor(endIdx,"blue");
      return;
    }

    // pick the pivot - in this case I am picking the one in middle.
    let pivotIdx = Math.floor((startIdx + endIdx)/2);
    let pivot = this.range[pivotIdx].value;
  
    // leftIdx and rightIdx are the pointers scanning left and right respectively
    let leftIdx = startIdx;
    let rightIdx = endIdx;
    
    let foundLeft=false;
    let foundRight=false;

    // loop until left and right indices crosses each other
    // leftIndx will start from left moves towards right and find an element greater than pivot
    // rightIndx will start from right moves towards left and find an element less than pivot
    // if left and right scan finds respective numbers then swap
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
    //recursive call to split the array into smaller units based on where one of the indices has reached and surpassed other
    //in this case I am using leftIdx position to split the array
    await this.doQuickSort(startIdx, leftIdx);
    await this.doQuickSort(leftIdx+1,endIdx);

    return;
  }

  display(start, end){
    console.log(_.map(this.range,e=>e.value).slice(start,end+1));
  }
}