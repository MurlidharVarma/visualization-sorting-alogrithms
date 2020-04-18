import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {
  height: string;
  val: any;

  @Input("val")
  set assign(v){
    this.height=`${v*3}px`;
    this.val=v;
  }

  @Input("color")
  color:boolean;
  
  styleObj: any;

  constructor() { }

  ngOnInit(): void {
    this.styleObj={
      'height': this.height,
      'background-image': `var(--${this.color})`
    }
  }

}
