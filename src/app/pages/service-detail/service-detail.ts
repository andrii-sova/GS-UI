import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-service-detail-page',
  imports: [RouterLink],
  templateUrl: './service-detail.html',
})
export class ServiceDetailPageComponent implements OnInit {
  slug = '';
  readonly lang = inject(LangService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') ?? '';
    });
  }
}
