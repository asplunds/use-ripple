import useRipple, { customRipple } from "use-ripple-hook";

const useGreenRipple = customRipple({
  color: "rgba(72, 187, 120, 0.5)",
  duration: 700,
});

export default function App() {
  const [defaultRef, defaultEvent] = useRipple<HTMLButtonElement>();
  const [redRef, redEvent] = useRipple<HTMLButtonElement>({
    color: "rgba(239, 68, 68, 0.45)",
    duration: 600,
  });
  const [greenRef, greenEvent] = useGreenRipple();

  return (
    <main>
      <h1>use-ripple-hook · Vite</h1>
      <p>Click the buttons to trigger ripples.</p>
      <div className="row">
        <button ref={defaultRef} onPointerDown={defaultEvent}>
          Default ripple
        </button>
        <button ref={redRef} onPointerDown={redEvent} className="red">
          Red ripple (per-call options)
        </button>
        <button ref={greenRef} onPointerDown={greenEvent} className="green">
          customRipple (green)
        </button>
      </div>
    </main>
  );
}
