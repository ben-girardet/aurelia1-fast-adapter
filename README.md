# Aurelia FAST Adapter

Helps you build Aurelia 1 applications using FAST web-components

* Enable two-way binding on FAST web-components
* button-checked custom attribute

## Install

```shell
npm install aurelia1-fast-adapter
```

## Enable two-way binding

Simply register the `FASTAdapter` in your `main.ts`

```ts
// main.ts

aurelia.use
    .plugin(PLATFORM.moduleName('aurelia1-fast-adapter'))
```

Now your Aurelia 1 application knows how to handle two-way bindings with all FAST components.

### Change FAST prefix

FAST web-components use the `fast-` prefix by default, but this can be changed for any implementation. You can reflect this prefix by configuring the registration as such:

```ts
// main.ts

aurelia.use
    .plugin(PLATFORM.moduleName('aurelia1-fast-adapter'), 'ecos')
// now FASTAdapter knows that your components use a different prefix, `ecos-` here
```

### Register custom components

Before to register the `FASTAdapter` one can extends the public static `tags` property in order to add more components. For exemple:

```
import { Aurelia1FASTAdapter } from "aurelia1-fast-adapter";
Aurelia1FASTAdapter.tags['DATE-FIELD'] = ['value'];
```

## Use the button-checked custom attribute

Documentation in progress