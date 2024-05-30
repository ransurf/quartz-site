import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FooterNewsletter } from "./FooterNewsletter";
import style from "./styles/callToAction.scss"

const actions: Record<string, any> = {
  default: {
    defaultTitle: "Start Linking Your Thinking!",
    defaultSubtitle: `Get our email course "The Ultimate Primer to Linking Your Thinking" to start creating an ideaverse that can support and power a lifetime of memories & ideas.`,
    defaultButton: "Get the Ultimate Primer",
    formId: "6589197"
  }
};

const CallToAction: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const ctaTitle = fileData.frontmatter?.ctaTitle;
  const ctaSubtitle = fileData.frontmatter?.ctaSubtitle;
  const ctaButton = fileData.frontmatter?.ctaButton;
  const ctaType = fileData.frontmatter?.ctaType as string;
  const ctaFormId = fileData.frontmatter?.ctaFormId as string;

  if (ctaType) {
    //get the cta object
    const cta = actions[ctaType];
    const shouldRender = (cta || (ctaTitle && ctaButton && ctaFormId))
    return shouldRender && (
      <div class={classNames(displayClass, "cta")}>
        {ctaTitle && <h1 className="cta-title">{ctaTitle || cta.defaultTitle}</h1>}
        {ctaSubtitle && <p className="cta-subtitle">{ctaSubtitle || cta.defaultSubtitle}</p>}
        <FooterNewsletter buttonText={ctaButton || cta.defaultButton as string} formId={ctaFormId || cta.formId as string}/>
      </div>
    )
  } else {
    return null
  }
}

CallToAction.css = style

export default (() => CallToAction) satisfies QuartzComponentConstructor
