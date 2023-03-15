import { useCallback, useRef } from "react";

export type Options<T extends HTMLElement = any> = {
    duration: number;
    color: string;
    timingFunction: string;
    disabled?: boolean;
    className: string;
    containerClassName: string;
    ignoreNonLeftClick: boolean;
    onSpawn?: (ctx: {
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
    cancelAutomatically: boolean;
    ref: React.RefObject<T>;
};

export type MinimalEvent = {
    clientX: number;
    clientY: number;
    nativeEvent?: {
        which?: number;
        type?: string;
    };
};

const self = () => document;
const completedFactor = 0.4;
const className = "__useRipple--ripple";
const containerClassName = "__useRipple--ripple-container";

/**
 * useRipple - Material UI style ripple effect React hook
 * @author Jonathan Asplund <jonathan@asplund.net>
 * @param inputOptions Ripple options
 * @returns Tuple `[ref, event]`. See https://github.com/asplunds/use-ripple for usage
 */
export default function useRipple<T extends HTMLElement = any>(
    inputOptions?: Partial<Options<T>>
) {
    const internalRef = useRef<T>(null);
    const { ref, ...options }: Options = {
        duration: 450,
        color: "rgba(255, 255, 255, .3)",
        cancelAutomatically: false,
        timingFunction: "cubic-bezier(.42,.36,.28,.88)",
        disabled: false,
        className,
        containerClassName,
        ignoreNonLeftClick: true,
        ref: internalRef,
        ...(inputOptions ?? {}),
    };

    const event = useCallback(
        (event: MinimalEvent) => {
            if (
                !ref.current ||
                options.disabled ||
                (options.ignoreNonLeftClick &&
                    event.nativeEvent?.which !== 1 &&
                    event.nativeEvent?.type === "mousedown")
            )
                return;
            const target = ref.current;
            if (window.getComputedStyle(target).position === "static")
                void applyStyles([["position", "relative"]], target);

            if (!target) return;

            const existingContainer = target.querySelector(
                `:scope > .${options.containerClassName}`
            );

            const container =
                existingContainer ??
                createRippleContainer(options.containerClassName);

            if (!existingContainer) target.appendChild(container);

            // Used to ensure overflow: hidden is registered properly on IOS Safari before ripple is shown
            void requestAnimationFrame(() => {
                const begun = Date.now();
                const ripple = centerElementToPointer(
                    event,
                    target,
                    createRipple(target, event, options)
                );
                const events = ["mouseup", "touchend"] as const;
                const cancelRipple = () => {
                    const now = Date.now();
                    const diff = now - begun;
                    // Ensure the transform animation is complete before cancellation
                    void setTimeout(
                        () => {
                            void cancelRippleAnimation(ripple, options);
                        },
                        diff > 0.4 * options.duration
                            ? 0
                            : completedFactor * options.duration - diff
                    );
                    for (const event of events)
                        void self().removeEventListener(event, cancelRipple);
                };
                if (!options.cancelAutomatically && !isTouchDevice())
                    for (const event of events)
                        void self().addEventListener(event, cancelRipple);
                else
                    setTimeout(
                        () => void cancelRippleAnimation(ripple, options),
                        options.duration * completedFactor
                    );

                void container.appendChild(ripple);
                void options.onSpawn?.({
                    ripple,
                    cancelRipple,
                    event,
                    ref,
                    container,
                });
            });
        },
        [ref, options]
    );

    return [ref, event] as const;
}

/**
 * HOF useRipple - Generate a custom ripple hook with predefined options
 *
 * After generating a HOF useRipple you can then override some or all predefined options by passing a new option object.
 * @author Jonathan Asplund <jonathan@asplund.net>
 * @param inputOptions ripple options
 * @returns Custom HOC useRipple hook
 */
export function customRipple<T extends HTMLElement = any>(
    inputOptions?: Partial<Omit<Options<T>, "ref">>
) {
    return (overrideOptions?: Partial<Options<T>>) =>
        useRipple({
            ...inputOptions,
            ...overrideOptions,
        });
}

function centerElementToPointer<T extends HTMLElement>(
    event: MinimalEvent,
    ref: HTMLElement,
    element: T
): T {
    const { top, left } = ref.getBoundingClientRect();
    void element.style.setProperty("top", px(event.clientY - top));
    void element.style.setProperty("left", px(event.clientX - left));
    return element;
}

function px(arg: string | number) {
    return `${arg}px`;
}

function createRipple<T extends HTMLElement>(
    ref: T,
    event: MinimalEvent,
    { duration, color, timingFunction, className }: Omit<Options, "ref">,
    ctx = document
): HTMLDivElement {
    const element = ctx.createElement("div");
    const { clientX, clientY } = event;
    const { height, width, top, left } = ref.getBoundingClientRect();
    const maxHeight = Math.max(clientY - top, height - clientY + top);
    const maxWidth = Math.max(clientX - left, width - clientX + left);
    // @ts-ignore
    const size = px(Math.hypot(maxHeight, maxWidth) * 2);
    const styles = [
        ["position", "absolute"],
        ["height", size],
        ["width", size],
        ["transform", "translate(-50%, -50%) scale(0)"],
        ["pointer-events", "none"],
        ["border-radius", "50%"],
        ["opacity", ".6"],
        ["background", color],
        [
            "transition",
            `transform ${
                duration * 0.6
            }ms ${timingFunction}, opacity ${Math.max(
                duration * 0.05,
                140
            )}ms ease-out`,
        ],
    ];

    void element.classList.add(className);

    void window.requestAnimationFrame(() => {
        void applyStyles(
            [["transform", "translate(-50%, -50%) scale(1)"]],
            element
        );
    });

    return applyStyles(styles, element);
}

function applyStyles<T extends HTMLElement>(styles: string[][], target: T): T {
    if (!target) return target;

    for (const [property, value] of styles) {
        void target.style.setProperty(property, value);
    }
    return target;
}

function cancelRippleAnimation<T extends HTMLElement>(
    element: T,
    options: Omit<
        Options<T>,
        "color" | "ref" | "onSpawn" | "cancelAutomatically"
    >
) {
    const { duration, timingFunction } = options;
    void applyStyles(
        [
            ["opacity", "0"],
            [
                "transition",
                `transform ${duration * 0.6}ms ${timingFunction}, opacity ${
                    duration * 0.65
                }ms ease-in-out ${duration * 0.13}ms`,
            ],
        ],
        element
    );
    void window.requestAnimationFrame(() => {
        void element.addEventListener("transitionend", (e) => {
            if (e.propertyName === "opacity") void element.remove();
        });
    });
}

function createRippleContainer(className: string) {
    const container = self().createElement("div");
    void container.classList.add(className);

    return applyStyles(
        [
            ["position", "absolute"],
            ["height", "100%"],
            ["width", "100%"],
            ["border-radius", "inherit"],
            ["top", "0"],
            ["left", "0"],
            ["pointer-events", "none"],
            ["overflow", "hidden"],
        ],
        container
    );
}

/** taken from https://stackoverflow.com/a/4819886/13188385 */
function isTouchDevice(): boolean {
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        ((navigator as any)?.msMaxTouchPoints ?? 0 > 0)
    );
}
