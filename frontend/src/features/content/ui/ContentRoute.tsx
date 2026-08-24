import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router"

import type { PageContent } from "@/content"
import { loadContent } from "@/content"
import { useLocalizedPath } from "@/features/language"
import { ContentPage } from "./ContentPage"

interface ContentRouteProps {
  section: string
  /** Fixed slug for single-page routes (e.g. /coaching); otherwise from :slug. */
  slug?: string
}

export const ContentRoute = ({ section, slug }: ContentRouteProps) => {
  const params = useParams()
  const resolvedSlug = slug ?? params.slug ?? "index"
  const loader = loadContent(section, resolvedSlug)
  const localize = useLocalizedPath()
  const [content, setContent] = useState<PageContent | null>(null)

  useEffect(() => {
    setContent(null)
    if (!loader) return
    let cancelled = false
    void loader().then((mod) => {
      if (!cancelled) setContent(mod.content)
    })
    return () => {
      cancelled = true
    }
  }, [loader])

  if (!loader) return <Navigate to={localize("/")} replace />
  if (!content) return null

  return <ContentPage content={content} />
}
