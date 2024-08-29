import {Component, HostListener} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NavbarComponent} from "../../shared/components/navbar/navbar.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  isNavbarFixed = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isNavbarFixed = offset > 0;
  }
}
