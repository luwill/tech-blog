export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-lg text-gray-600">
          If you can see this, the basic Next.js setup is working!
        </p>
        <div className="mt-8">
          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800">✅ Working Components:</h2>
            <ul className="text-green-700 mt-2">
              <li>• Next.js App Router</li>
              <li>• Tailwind CSS Styling</li>
              <li>• TypeScript Compilation</li>
              <li>• Basic Routing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}