import { Component, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-minecraft-tooltip',
  templateUrl: './minecraft-tooltip.component.html',
  styleUrls: ['./minecraft-tooltip.component.css']
})
export class MinecraftTooltipComponent {
  text = '';
  posX = 0;
  posY = 0;
  visible = false;

  show(text: string, x: number, y: number) {
    this.text = text;
    this.posX = x;
    this.posY = y;
    this.visible = true;
  }

  move(x: number, y: number) {
    this.posX = x;
    this.posY = y;
  }

  hide() {
    this.visible = false;
  }
}
