import { Card } from "@/components/ui/card"

const ScoringSettingsForm = () => {
  return (
    <Card className="w-full p-4 bg-white/80 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-4">Scoring Settings</h2>
      {/* Add form elements here */}
      <div>
        {/* Example input field */}
        <label htmlFor="exampleInput" className="block text-sm font-medium text-gray-700">
          Example Input
        </label>
        <input
          type="text"
          name="exampleInput"
          id="exampleInput"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </Card>
  )
}

export default ScoringSettingsForm
