import { inject } from 'aurelia-dependency-injection';
import { customAttribute } from 'aurelia-templating';
import { bindingMode } from 'aurelia-framework';

@inject(Element)
@customAttribute('button-checked', bindingMode.twoWay)
export class EcosButtonChecked {

  public value: string | string[] = '';
  private isMultiple = false;

  public constructor(private element: HTMLElement) {

  }

  public bind() {
    this.valueChanged();
    this.element.addEventListener('ecos-button-value-changed', this);
    this.element.addEventListener('click', this);
  }
  
  public detached() {
    this.element.removeEventListener('ecos-button-value-changed', this);
    this.element.removeEventListener('click', this);
  }

  public handleEvent(event: CustomEvent) {
    if (event instanceof CustomEvent) {
      this.valueChanged();
    }
    if (event instanceof MouseEvent) {
      const value = (this.element as any).$ecosButtonValue || '';
      this.toggleValue(value);
      this.element.dispatchEvent(new CustomEvent('change', {bubbles: true}));
    }
  }

  public valueChanged() {
    this.setIsMultiple();
    const value = (this.element as any).$ecosButtonValue || '';
    if (this.isSelected(value)) {
      this.element.setAttribute('appearance', 'accent');
    } else {
      this.element.setAttribute('appearance', 'neutral');
    }
  }

  public setIsMultiple(): void {
    this.isMultiple = Array.isArray(this.value);
  }

  public isSelected(value: string): boolean {
    try {
      if (this.isMultiple) {
        return this.value.includes(value);
      } else {
        return this.value == value; // we use the == instead of === in order to accomodate for different types being treated as equal
      }
    } catch (error) {
      console.warn('Error in isSelected', error.message);
      return false;
    }
  }

  public toggleValue(value: string): void {
    try {
      if (this.isMultiple) {
        const index = (this.value as string[]).findIndex(v => v == value);
        if (index === -1) {
          (this.value as string[]).push(value);
        } else {
          (this.value as string[]).splice(index, 1);
        }
        this.valueChanged();
      } else {
        if (this.isSelected(value)) {
          this.value = '';
        } else {
          this.value = value;
        }
      }
    } catch (error) {
      console.warn('Error in toggleValue', error.message);
      return;
    }
  }

}

@inject(Element)
@customAttribute('button-value')
export class EcosButtonValue {

  public value = '';

  public constructor(private element: HTMLElement) {

  }

  public bind() {
    this.valueChanged();
  }

  public valueChanged() {
    (this.element as any).$ecosButtonValue = this.value;
    this.element.dispatchEvent(new CustomEvent('ecos-button-value-changed'));
  }

}
