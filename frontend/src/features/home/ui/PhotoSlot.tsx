import { TriskeleMark } from "@/components/brand/TriskeleMark"

export const PhotoSlot = () => {
  return (
    <div className="relative min-h-[min(340px,60vw)] flex-1 basis-[380px] overflow-hidden bg-[linear-gradient(160deg,#12362A_0%,#0A1F16_100%)]">
      <TriskeleMark className="absolute -bottom-[18%] -right-[14%] w-[82%] text-[#1E4433] opacity-35" />
    </div>
  )
}
