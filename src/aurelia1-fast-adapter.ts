import { inject } from 'aurelia-dependency-injection';
import {
  bindingMode,
  ObserverLocator,
  InternalPropertyObserver
} from 'aurelia-framework';
import { ValueAttributeObserver, EventSubscriber } from 'aurelia-binding';
import { SyntaxInterpreter } from 'aurelia-templating-binding';

export type GetElementObserver = (
  obj: Element,
  propertyName: string,
  observerLocator: ObserverLocator,
  descriptor?: PropertyDescriptor | null) => InternalPropertyObserver | null;

export interface FASTElementObserverAdapter {
  tagName: string;
  properties: Record<string, FASTElementPropertyObserver>;
}

export interface FASTElementPropertyObserver {
  defaultBindingMode: bindingMode;
  getObserver: GetElementObserver;
}

@inject(ObserverLocator)
export class Aurelia1FASTAdapter {

  public static tags: {[key: string]: string[]} = {
    'CHECKBOX': ['checked'],
    'MENU-ITEM': ['checked'],
    'RADIO': ['checked'],
    'RADIO-GROUP': ['checked'],
    'SELECT': ['value'],
    'SLIDER': ['value'],
    'SWITCH': ['checked'],
    'TABS': ['activeid'],
    'TEXT-FIELD': ['value'],
    'TEXT-AREA': ['value'],
  }

  private adapterCreated: boolean = false;
  private adapters: Record<string, FASTElementObserverAdapter> = {};
  private bindingModeIntercepted: boolean;

  constructor(
    private observerLocator: ObserverLocator
  ) {}

  private createAdapter() {
    this.observerLocator.addAdapter({
      getObserver: (obj: Element, propertyName: string, descriptor: PropertyDescriptor) => {
        if (obj instanceof Element) {
          const tagName = obj.getAttribute('as-element') || obj.tagName;
          const elAdapters = this.adapters[tagName];
          if (!elAdapters) {
            return null;
          }
          const propertyAdapter = elAdapters.properties[propertyName];
          if (propertyAdapter) {
            const observer = propertyAdapter.getObserver(obj, propertyName, this.observerLocator, descriptor);
            if (observer) {
              return observer;
            }
          }
        }
        return null as any;
      }
    });
  }

  private getOrCreateFASTElementAdapters(tagName: string): FASTElementObserverAdapter {
    if (!this.adapterCreated) {
      this.createAdapter();
      this.adapterCreated = true;
    }
    const adapters = this.adapters;
    let elementAdapters = adapters[tagName] || adapters[tagName.toLowerCase()];
    if (!elementAdapters) {
      elementAdapters = adapters[tagName] = adapters[tagName.toLowerCase()] = { tagName, properties: {} };
    }
    return elementAdapters;
  }

  private interceptDetermineDefaultBindingMode(): void {
    // tslint:disable-next-line
    const fastAdapter = this;
    const originalFn = SyntaxInterpreter.prototype.determineDefaultBindingMode;

    SyntaxInterpreter.prototype.determineDefaultBindingMode = function(
      this: SyntaxInterpreter,
      element: Element,
      attrName: string,
      context?: any
    ) {
      const tagName = element.getAttribute('as-element') || element.tagName;
      const elAdapters = fastAdapter.adapters[tagName];
      if (elAdapters) {
        const propertyAdapter = elAdapters.properties[attrName];
        if (propertyAdapter) {
          return propertyAdapter.defaultBindingMode;
        }
      }
      return originalFn.call(this, element, attrName, context);
    };
  }

  public addFASTElementObserverAdapter(tagName: string, properties: Record<string, FASTElementPropertyObserver>): void {
    if (!this.adapterCreated) {
      this.createAdapter();
      this.adapterCreated = true;
    }
    const elementAdapters = this.getOrCreateFASTElementAdapters(tagName);
    Object.assign(elementAdapters.properties, properties);
  }

  public registerFASTElementConfig(observerAdapter: FASTElementObserverAdapter) {
    if (!this.bindingModeIntercepted) {
      this.interceptDetermineDefaultBindingMode();
      this.bindingModeIntercepted = true;
    }
    this.addFASTElementObserverAdapter(observerAdapter.tagName.toUpperCase(), observerAdapter.properties);
  }

  public registerAll(suffix?: string) {
    suffix = (typeof suffix === 'string' ? suffix : 'fast').toUpperCase();
    for (const tag in Aurelia1FASTAdapter.tags) {
      for (const property of Aurelia1FASTAdapter.tags[tag]) {
        this.registerFASTElementConfig({tagName: `${suffix}-${tag}`, properties: observedProperty(property)});
      }
    }
  }
}

function observedProperty(name: string): Record<string, FASTElementPropertyObserver> {
  const property: Record<string, FASTElementPropertyObserver> = {};
  property[name] = {
    defaultBindingMode: bindingMode.twoWay,
    getObserver(element: Element) {
      return new ValueAttributeObserver(element, name, new EventSubscriber(['change', 'input']));
    }
  };
  return property;
}
