import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import breadcrumbsStyle from "./styles/breadcrumbs.scss"
import {
  FullSlug,
  SimpleSlug,
  joinSegments,
  resolveRelative,
  transformLink,
  TransformOptions,
} from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { classNames } from "../util/lang"
import { ComponentIds } from "./types"
import { Orbit } from "lucide-preact"
import { JSX } from "preact/jsx-runtime"
// import config from "../../quartz.config"

type CrumbData = {
  displayName: string
  path: string
}

function createLinkedElement(fileData: any, opts: any, value: string) {
  // if there is an alias in the link like [[alias|link]] then we need to remove the alias
  let cleanedValue;
  if (value.includes("|")) {
    cleanedValue = value.split("|")[1]
  } else {
    cleanedValue = value
  }
  cleanedValue = cleanedValue.replace(/['"\[\]]+/g, "")

  let href = transformLink(fileData.slug!, cleanedValue, opts)

  // split cleanedValue to last part of the path
  let splitValue = cleanedValue.split("/")[cleanedValue.split("/").length - 1]

  return (
    <a href={href} className="internal no-background">
      {splitValue}
    </a>
  )
}

interface BreadcrumbOptions {
  /**
   * Symbol between crumbs
   */
  spacerSymbol: string
  /**
   * Whether to look up frontmatter title for folders (could cause performance problems with big vaults)
   */
  resolveFrontmatterTitle: boolean
  /**
   * Whether to display breadcrumbs on root `index.md`
   */
  hideOnRoot: boolean
}

const defaultOptions: BreadcrumbOptions = {
  spacerSymbol: "•",
  resolveFrontmatterTitle: true,
  hideOnRoot: true,
}

function formatName(name: string, isFolderPath: boolean): string {
  // capitalize if it is not last part of crumb
  if (isFolderPath) {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return name
}

function formatCrumb(
  displayName: string,
  baseSlug: FullSlug,
  currentSlug: SimpleSlug,
  isFolderPath: boolean,
): CrumbData {
  return {
    displayName: formatName(displayName?.replaceAll("-", " "), isFolderPath),
    path: resolveRelative(baseSlug, currentSlug)
  }
}

export default ((opts?: Partial<BreadcrumbOptions>) => {
  // Merge options with defaults
  const options: BreadcrumbOptions = { ...defaultOptions, ...opts }

  // computed index of folder name to its associated file data
  let folderIndex: Map<string, QuartzPluginData> | undefined

  const Breadcrumbs: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    // Hide crumbs on root if enabled
    if (options.hideOnRoot && fileData.slug === "index") {
      return <></>
    }

    // Format entry for root element
    const crumbs: CrumbData[] = []

    if (!folderIndex && options.resolveFrontmatterTitle) {
      folderIndex = new Map()
      // construct the index for the first time
      for (const file of allFiles) {
        const folderParts = file.slug?.split("/")
        if (folderParts?.at(-1) === "index") {
          folderIndex.set(folderParts.slice(0, -1).join("/"), file)
        }
      }
    }

    // Split slug into hierarchy/parts
    const slugParts = fileData.slug?.split("/")
    if (slugParts) {
      // is tag breadcrumb?
      const isTagPath = slugParts[0] === "tags"

      // full path until current part
      let currentPath = ""

      for (let i = 0; i < slugParts.length - 1; i++) {
        let curPathSegment = slugParts[i]

        // Try to resolve frontmatter folder title
        const currentFile = folderIndex?.get(slugParts.slice(0, i + 1).join("/"))
        if (currentFile) {
          const title = currentFile.frontmatter!.title
          if (title !== "index") {
            curPathSegment = title
          }
        }

        // Add current slug to full path
        currentPath = joinSegments(currentPath, slugParts[i])
        const includeTrailingSlash = !isTagPath || i < 1

        // Format and add current crumb
        const crumb = formatCrumb(
          curPathSegment,
          fileData.slug!,
          (currentPath + (includeTrailingSlash ? "/" : "")) as SimpleSlug,
          i !== slugParts.length - 1,
        )
        crumbs.push(crumb)
      }
    }

    const opts: TransformOptions = {
      strategy: "shortest",
      allSlugs: allFiles.map((fp) => fp.slug as FullSlug),
    }

    var propertiesElements = []
    // var priorityPropertiesElements = []

    // const darkGrayColor = config.configuration.theme.colors.darkMode.darkgray;

    const noteState = fileData.frontmatter?.state as string

    return (
      <nav class={classNames(displayClass, "breadcrumb-container")} aria-label="breadcrumbs">
        {crumbs.map((crumb, index) => (
          <div className="breadcrumb-element">
            <a className="internal no-background" href={crumb.path}>
              {crumb.displayName}
            </a>
          </div>
        ))}
        <Orbit className="breadcrumb-spacer" size={16} />
        {noteState && <div class="breadcrumb-element">{noteState}</div>}
      </nav>
    )
  }
  Breadcrumbs.id = ComponentIds.Breadcrumbs
  Breadcrumbs.css = breadcrumbsStyle

  return Breadcrumbs
}) satisfies QuartzComponentConstructor
