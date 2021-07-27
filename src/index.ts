import { FrameworkConfiguration, PLATFORM } from 'aurelia-framework';;
import { Aurelia1FASTAdapter } from './aurelia1-fast-adapter';

export function configure(config: FrameworkConfiguration, suffix?: string) {
  config.container.get(Aurelia1FASTAdapter).registerAll(suffix);
  config.globalResources([
    PLATFORM.moduleName('./ecos-button-checked-value')
  ]);
}
