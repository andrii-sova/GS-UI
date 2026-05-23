import { Component } from '@angular/core';

@Component({
  selector: 'app-process',
  templateUrl: './process.html',
})
export class ProcessComponent {
  steps = [
    {
      number: 1,
      text: '[Text: We receive the brief or sketch. If needed, we help develop it.]',
      image: '[image of engineer reviewing drawings / brief]',
    },
    {
      number: 2,
      text: '[Text: We calculate the order and agree on price and timeline.]',
      image: '[image of quote / calculation on screen or paper]',
    },
    {
      number: 3,
      text: '[Text: We accept payment or agreed post-payment.]',
      image: '[image of payment / invoice / handshake]',
    },
    {
      number: 4,
      text: '[Text: We launch production — from material sourcing to the finished product.]',
      image: '[image of factory production floor in action]',
    },
    {
      number: 5,
      text: '[Text: We check quality and ship the order with documentation.]',
      image: '[image of quality control / inspection / packaged parts]',
    },
  ];
}
