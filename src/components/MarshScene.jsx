export default function MarshScene() {
  return (
    <div className="scene-fallback" aria-hidden="true">
      <div className="scene-fallback__glow" />
      <div className="scene-fallback__terrain" />
      <div className="scene-fallback__ring scene-fallback__ring--one" />
      <div className="scene-fallback__ring scene-fallback__ring--two" />
      <div className="scene-fallback__ring scene-fallback__ring--three" />
      {Array.from({ length: 18 }, (_, index) => (
        <span
          key={index}
          className="scene-fallback__particle"
          style={{
            left: `${10 + ((index * 37) % 80)}%`,
            top: `${12 + ((index * 29) % 72)}%`,
            animationDelay: `${(index % 7) * -0.7}s`,
          }}
        />
      ))}
    </div>
  )
}
