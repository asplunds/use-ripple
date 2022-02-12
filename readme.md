# useRipple - Material UI ripple effect
Fully customizable, lightweight React hook for implementing Google's Material UI style ripple effect


![useRipple showcase GIF](https://i.imgur.com/P844g7d.gif "useRipple showcase")

[![Edit great-nash-zhyfm](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/great-nash-zhyfm?fontsize=14&hidenavigation=1&theme=dark)

## Installation
```
npm install use-ripple-hook
```
or
```
yarn add use-ripple-hook
```

## Usage
```tsx
import React from "react";
import useRipple from "use-ripple-hook";

function Button() {
    const [ripple, event] = useRipple();

    return (
        <button ref={ripple} onMouseDown={event}>
            Default Ripple
        </button>
    );
}
```

## Options
### Default options
```ts
useRipple({
    duration: 450,
    color: "rgba(255, 255, 255, .3)",
    cancelAutomatically: false,
    timingFunction: "cubic-bezier(.42,.36,.28,.88)",
    disabled: false,
    ref: internalRef,
    onSpawn: undefined,
});
```
### Options reference
| Property              | Description                                                        | Type                               | Default                         | Optional |
| --------------------- | ------------------------------------------------------------------ | ---------------------------------- | ------------------------------- | -------- |
| `duration`            | Duration in milliseconds of the ripple effect                      | `number`                           | `450`                           | ✔️        |
| `color`               | Color of the ripple effect                                         | `string`                           | `rgba(255, 255, 255, .3)`       | ✔️        |
| `cancelAutomatically` | If true, the ripple will begin to cancel after 40% of the duration | `boolean`                          | `false`                         | ✔️        |
| `timingFunction`      | Transition timing function of the transform animation              | `string`                           | `cubic-bezier(.42,.36,.28,.88)` | ✔️        |
| `disabled`            | If true, no ripple will be spawned                                 | `boolean`                          | `false`                         | ✔️        |
| `ref`                 | Optional outside ref, if unset, internal ref will be used          | `React.RefObject<T>`               | `undefined`                     | ✔️        |
| `onSpawn`             | A callback which is triggered when a ripple is spawned             | [options.onspawn](#optionsonspawn) | `undefined`                     | ✔️        |

### `options.onSpawn`
**Type**
```ts
type OnSpawnCB = (ctx: {
    /** the ripple element */
    readonly ripple: HTMLDivElement;

    /** cancels the current ripple animation */
    readonly cancelRipple: () => void;

    /** the ref to the ripple host element */
    readonly ref: React.RefObject<T>;
    
    /** the event that triggered the ripple (ts: casting required) */
    readonly event: unknown;
}) => void;
```
**Example**
```js
useRipple({
    /* ... */
    onSpawn: ({
      ripple, ref, event  
    }) => {
        console.table({ ripple, ref, event });
    }
});
```

## Perfect circle
As demonstrated in the below GIF, useRipple adjusts the circle size according to always fir the host element's box.
![useRipple showcase GIF](https://i.imgur.com/OU9YJAh.gif "image Title")

## Examples
For examples of useRipple usage please click [here](https://codesandbox.io/s/great-nash-zhyfm?file=/src/App.tsx).

## Contributing
Contributions of any form are appreciated, opening issues on the Github as well as creating pull requests are both welcome for anyone.