import { inject } from 'aurelia-dependency-injection';
import { customAttribute } from 'aurelia-templating';
import { bindingMode } from 'aurelia-framework';

@inject(Element)
@customAttribute('add-selected', bindingMode.oneTime)
export class EcosButtonChecked {

  public value: any;

  public constructor(private element: HTMLElement) {}

  public bind() {
    this.element.toggleAttribute('selected', this.value);
  }
  
}
