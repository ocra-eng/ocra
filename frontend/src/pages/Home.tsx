import { Hero, RecognitionStrip } from "@/features/home"
import { useSeo } from "@/features/seo"

export const Home = () => {
  useSeo("home", "")

  return (
    <>
      <Hero />
      <RecognitionStrip />
    </>
  )
}
