# useRipple - Material UI ripple effect
Fully customizable, lightweight React hook for implementing Google's Material UI style ripple effect


![useRipple showcase GIF](https://i.imgur.com/8yu6uaR.gif "useRipple showcase")

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
    className: "__useRipple--ripple",
    containerClassName: "__useRipple--ripple-container",
    timingFunction: "cubic-bezier(.42,.36,.28,.88)",
    disabled: false,
    ref: internalRef,
    onSpawn: undefined,
});
```
### Options reference
| Property              | Description                                                                                   | Type                               | Default                         | Optional |
| --------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------- | -------- |
| `duration`            | Duration in milliseconds                                                                      | `number`                           | `450`                           | ✔️        |
| `color`               | Color of the ripple effect                                                                    | `string`                           | `rgba(255, 255, 255, .3)`       | ✔️        |
| `cancelAutomatically` | If `true`, the ripple will begin to cancel after 40% of the duration                            | `boolean`                          | `false`                         | ✔️        |
| `className`           | The ripple element's class name                                                               | `string`                           | `__useRipple--ripple`           | ✔️        |
| `containerClassName`  | The container element for the ripples                                                         | `string`                           | `__useRipple--ripple-container` | ✔️        |
| `ignoreNonLeftClick`  | If `false`, non left click events such as right click and middle click will also trigger ripple | `boolean`                          | `true`                          | ✔️        |
| `timingFunction`      | Transition timing function of the transform animation                                         | `string`                           | `cubic-bezier(.42,.36,.28,.88)` | ✔️        |
| `disabled`            | If `true`, no ripple will be spawned                                                            | `boolean`                          | `false`                         | ✔️        |
| `ref`                 | Optional outside ref, if unset, internal ref will be used                                     | `React.RefObject<T>`               | `undefined`                     | ✔️        |
| `onSpawn`             | A callback which is triggered when a ripple is spawned                                        | [options.onspawn](#optionsonspawn) | `undefined`                     | ✔️        |

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

    /** the ripple container element */
    readonly container: HTMLDivElement;
}) => void;
```
**Example**
```js
useRipple({
  /* ... */
  onSpawn: ({
    ripple, ref, event, container
  }) => {
    console.table({ ripple, ref, event, container });
  }
});
```

## Perfect circle
As demonstrated in the below GIF, useRipple adjusts the circle size according to always for the host element's box.

![useRipple showcase GIF](https://i.imgur.com/OU9YJAh.gif "image Title")

## Higher order function (HOF)

If you want to memoize a configuration for your ripple you can use the built in `customRipple()` function.

You can override the options you memoized for your custom ripple hook. The two options will be merged.
### Usage
```tsx
import { customRipple } from "use-ripple-hook";

const useMyRipple = customRipple({
    color: "rgb(144, 238, 144, .7)",
    duration: 700,
});

function Button() {
    const [ripple, event] = useMyRipple({}); // Optionally override previous config

    return (
        <button ref={ripple} onMouseDown={event}>
            Memoized Ripple
        </button>
    );
}
```

This is useful if you want to avoid repetition in your code or if you want multiple different ripple effects for different components.

## Examples
For examples of useRipple usage please click <a target="_blank" href="https://codesandbox.io/s/great-nash-zhyfm?file=/src/App.tsx">here</a>.

## Dos and don'ts
### ✔ Do this:
Using components 👍
```jsx
import React from "react";
import useRipple from "use-ripple-hook";

function App() {
    return (
        <>
            <Button color="red" />
            <Button color="yellow" />
        </>
    )
}

function Button({ color }) {
    const [ripple, event] = useRipple({ color });

    return (
        <button ref={ripple} onMouseDown={event}>
            Button
        </button>
    );
}
```

### ❌ Don't do this:
Sharing references 👎
```jsx
import React from "react";
import useRipple from "use-ripple-hook";

function App() {
    const [ripple, event] = useRipple();

    /* This will NOT work! Do not do this */
    return (
        <>
            <button color="red" ref={ripple} onMouseDown={even}>
                Button
            </button>
            <button color="yellow" ref={ripple} onMouseDown={even}>
                Button
            </button>
        </>
    )
}
```
## Motivation

I was motivated to create this React hook due to the unfortunate lack of customizable alternatives. The other implementations which I don't wish to disparage lacked key features which I felt were important for this effect.

What I was looking for:
- Clean unopinionated API
- Fully customizable
- Implementation controlled trigger (events)
- Ripple to linger before fading away (hold down) which can be opted out of

I therefore created this simple yet powerful hook which can be reused, memoized and customized to fit any element and use case.

The philosophy behind this library hinges on the idea that libraries should not unnecessarily limit the user, but merely to provide the means to implement what the user wants. Obviously this is impossible to follow faithfully. However, I've done my best to follow this principle hence the rich options. If that isn't enough, I've provided a callback where you can gain full control over each individual ripple as it spawns.

## Contributing
Contributions of any form are appreciated, opening issues on the Github repository as well as creating pull requests are both welcomed for anyone to do.