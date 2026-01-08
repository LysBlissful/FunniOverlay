// @ts-ignore
import { ChangeDetectionStrategy, Component, signal,ElementRef } from '@angular/core';
import { animate, waapi, eases, spring, JSAnimation } from 'animejs';
import { ComponentType } from '..';

/**
 * Input for containing commands
 */
@Component({
    selector: "alert-component",
    templateUrl: "./alert.html",
    changeDetection: ChangeDetectionStrategy.OnPush, 
})
export class Alert {
    message = signal("Hello there");
    fade = signal(false);
	type = signal<ComponentType>("success");
    animation!: JSAnimation;

   	constructor(private host: ElementRef<HTMLElement>) { }
}
