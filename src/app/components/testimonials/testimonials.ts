import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
})
export class TestimonialsComponent {
  testimonials = [
    {
      quote: `[Quote: "We order from you when we can't keep up ourselves — because we know you'll do it right."]`,
      author: '[Client name]',
      company: '[Company: NG Metal]',
    },
    {
      quote: `[Quote: "Only with you, because you have material in stock and I always know exactly what I'll get."]`,
      author: '[Client name]',
      company: '[Company: Bramy]',
    },
    {
      quote: `[Quote: "You always find solutions even when other contractors can't."]`,
      author: '[Client name]',
      company: '[Company: Skif]',
    },
    {
      quote: `[Quote: "You don't have the word 'impossible' — if it's needed, it gets done."]`,
      author: '[Client name]',
      company: '[Company: Hidroshprits]',
    },
    {
      quote: `[Quote: "We work with you because you always adapt to our needs."]`,
      author: '[Client name]',
      company: '[Company: Autonomous Engineering]',
    },
  ];
}
