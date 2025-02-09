import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import style from "./styles/recentNotes.scss"
import { Date, getDate } from "./Date"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import { ComponentIds } from "./types"

interface Options {
  title?: string
  // must match the folder name to render
  path?: string
  limit: number
  showDates?: boolean
  linkToMore: SimpleSlug | false
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 3,
  linkToMore: false,
  showDates: false,
  filter: () => true,
  sort: byDateAndAlphabetical(cfg),
})

// const renderIfValid = (path: string | null, slug: string) => {
//   // check if folder is found in the slug
//   if (path === "root" && !slug) {
//     return false;
//   }

//   // only render for root folder if path is empty
//   if (path === "" && slug.includes("/")) {
//     return false;
//   }

//   // only render for specific folder
//   if (path !== "root" && !slug?.startsWith(path)) {
//     return false;
//   }
//   return true;
// }

export default ((userOpts?: Partial<Options>) => {
  const RecentNotes: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {

    //only render for root page
    if (userOpts?.path === "root" && !(fileData.slug === "index" || fileData.slug === "/")) {
      return null;
    }

    // only render for root folder if path is empty
    else if (userOpts?.path === "" && !fileData.slug?.includes("/")) {
      return null;
    }

    // only render for specific folder
    else if (userOpts?.path && userOpts?.path !== "root" && !fileData.slug?.startsWith(userOpts.path)) {
      return null;
    }

    const opts = { ...defaultOptions(cfg), ...userOpts }
    const pages = allFiles.filter(opts.filter).sort(opts.sort)
    const remaining = Math.max(0, pages.length - opts.limit)

    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h3 className="component-title">{opts.title ?? i18n(cfg.locale).components.recentNotes.title}</h3>
        <ul class="recent-ul">
          {pages.slice(0, opts.limit).map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const topics = page.frontmatter?.topic ?? []

            return (
              <li class="recent-li">
                <div class="section">
                  <div class="desc">
                    <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal no-background">
                      {title}
                    </a>
                  </div>
                  {userOpts?.showDates && page.dates && (
                    <i class="meta">
                      <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </i>
                  )}
                  {/* Show related categories of a writing */}
                  {/* <ul class="tags">
                    {topics.map((topic) => (
                      <li>
                        <a
                          class="internal link"
                          href={resolveRelative(fileData.slug!, `maps/${topic}` as FullSlug)}
                        >
                          {topic}
                        </a>
                      </li>
                    ))}
                  </ul> */}
                </div>
              </li>
            )
          })}
        </ul>
        {opts.linkToMore && remaining > 0 && (
          <p>
            <a href={resolveRelative(fileData.slug!, opts.linkToMore)}>
              {i18n(cfg.locale).components.recentNotes.seeRemainingMore({ remaining })}
            </a>
          </p>
        )}
      </div>
    )
  }

  RecentNotes.id = ComponentIds.RecentNotes
  RecentNotes.css = style
  return RecentNotes
}) satisfies QuartzComponentConstructor
