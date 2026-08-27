declare module "remark-definition-list" {
  import type { Plugin } from "unified"
  const remarkDefinitionList: Plugin
  export const defListHastHandlers: Record<string, unknown>
  export default remarkDefinitionList
}
