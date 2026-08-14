import { TriskeleMark } from "@/components/brand/TriskeleMark"

const BRAND_BASE = `${import.meta.env.BASE_URL}brand/`
const LOGO_SIZE = 571

export const PhotoSlot = () => {
  return (
    <div className="relative flex min-h-[min(340px,60vw)] flex-1 basis-[380px] items-center justify-center overflow-hidden bg-[image:var(--photo-bg)] p-8">
      <TriskeleMark className="absolute -bottom-[18%] -right-[14%] w-[82%] text-[color:var(--photo-mark)] opacity-35" />
      <img
        src={`${BRAND_BASE}logo_color.svg`}
        alt=""
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        className="relative h-auto w-[min(62%,320px)]"
      />
    </div>
  )
}
