export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDFBF7] z-50 selection:bg-transparent">
      <div className="flex flex-col items-center justify-center space-y-8">
        <h1
          className="text-2xl md:text-3xl font-thin tracking-[0.2em] text-[#1A1A1A] uppercase ml-[0.5em]"
          style={{
            fontFamily: '"Cormorant Garamond", "EB Garamond", Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", serif',
            animation: 'gentlePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          Atelier
        </h1>

        <div className="w-16 h-[1px] bg-black/10 overflow-hidden relative">
          <div
            className="absolute top-0 left-0 w-full h-full bg-[#1A1A1A]"
            style={{
              animation: 'slideRight 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes gentlePulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            @keyframes slideRight {
              0% { transform: translateX(-101%); }
              50% { transform: translateX(0); }
              100% { transform: translateX(101%); }
            }
          `,
        }}
      />
    </div>
  )
}
