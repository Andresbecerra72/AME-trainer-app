import { AircraftLoadingAnimation } from "@/components/aircraft-loading"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <AircraftLoadingAnimation 
        title="Calculating results"
        description="Analyzing your performance and scores..."
      />
    </div>
  )
}
