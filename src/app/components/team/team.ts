import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-team',
  imports: [RouterLink],
  templateUrl: './team.html',
})
export class TeamComponent {
  stats = [
    { value: '20+', label: '[Label: Years of experience]' },
    { value: '200+', label: '[Label: Specialists on the team]' },
    { value: '2000+', label: '[Label: Regular clients]' },
  ];

  members = [
    { name: '[Name: Founder]', role: '[Role: Founder]', photo: '[photo of Founder]' },
    { name: '[Name: CEO]', role: '[Role: Owner & CEO]', photo: '[photo of CEO]' },
    { name: '[Name: COO]', role: '[Role: Operations Director, Head of Production & Engineering]', photo: '[photo of COO]' },
    { name: '[Name: Operations Manager]', role: '[Role: Operations Manager, Head of Production Processes]', photo: '[photo of Operations Manager]' },
    { name: '[Name: CNC Head]', role: '[Role: Head of CNC Engineering & Production]', photo: '[photo of CNC Head]' },
    { name: '[Name: Site Manager]', role: '[Role: Operations Manager, Second Production Site]', photo: '[photo of Site Manager]' },
    { name: '[Name: R&D Head]', role: '[Role: Head of R&D & Innovation]', photo: '[photo of R&D Head]' },
    { name: '[Name: Finance & Import Head]', role: '[Role: Head of Import, Financial Coordination & Retail Sales]', photo: '[photo of Finance Head]' },
    { name: '[Name: International Sales Head]', role: '[Role: Head of International Projects & Sales]', photo: '[photo of International Sales Head]' },
    { name: '[Name: Retail & Brand Head]', role: '[Role: Head of Retail, Welding Production & Krafter Brand]', photo: '[photo of Retail Head]' },
    { name: '[Name: Legal Head]', role: '[Role: Head of Legal & Compliance]', photo: '[photo of Legal Head]' },
    { name: '[Name: Engraving Division Head]', role: '[Role: Head of Laser Engraving & Souvenir Production]', photo: '[photo of Engraving Head]' },
  ];
}
