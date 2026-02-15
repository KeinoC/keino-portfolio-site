import { DarkPaperBackground } from '@/components/ui/DarkPaperBackground';

export default function PaperDemoPage() {
  return (
    <div className="relative min-h-screen">
      <DarkPaperBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-6xl font-bold text-white">
            Dark Paper Texture
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed">
            This background uses SVG feTurbulence filters to create an authentic
            dark paper grain effect. The texture mimics premium black card stock
            with subtle noise, warm undertones, and a gentle vignette.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                Pure CSS/SVG
              </h3>
              <p className="text-sm text-gray-400">
                No external images required. Lightweight and customizable.
              </p>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                Perlin Noise
              </h3>
              <p className="text-sm text-gray-400">
                Authentic texture using feTurbulence filter primitive.
              </p>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                Warm Undertone
              </h3>
              <p className="text-sm text-gray-400">
                Subtle color variation prevents flat appearance.
              </p>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                Edge Vignette
              </h3>
              <p className="text-sm text-gray-400">
                Radial gradient adds depth and dimension.
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-black/30 backdrop-blur-md rounded-lg border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Technical Details
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>baseFrequency:</strong> 0.65 for fine grain detail
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>numOctaves:</strong> 4 for balanced performance
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>Mix blend mode:</strong> overlay for natural integration
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>
                  <strong>Browser support:</strong> All modern browsers
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
