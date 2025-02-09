import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import style from "./styles/aboutAuthor.scss"
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

export default ((userOpts?: Partial<Options>) => {
  const AboutAuthor: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }
    const pages = allFiles.filter(opts.filter).sort(opts.sort)
    const remaining = Math.max(0, pages.length - opts.limit)

    return (
      <div class={classNames(displayClass, "about-author")}>
        <h3 className="component-title">{i18n(cfg.locale).components.aboutAuthor.title}</h3>
        <p className="about-author-text">{i18n(cfg.locale).components.aboutAuthor.description}</p>
        {/* {opts.linkToMore && remaining > 0 && (
          <p>
            <a href={resolveRelative(fileData.slug!, opts.linkToMore)}>
              {i18n(cfg.locale).components.aboutAuthor.seeRemainingMore({ remaining })}
            </a>
          </p>
        )} */}
      </div>
    )
  }

  AboutAuthor.id = ComponentIds.AboutAuthor
  AboutAuthor.css = style
  return AboutAuthor
}) satisfies QuartzComponentConstructor
