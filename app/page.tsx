import { CopyBlock } from "@/components/copy-block";
import { GithubLink } from "@/components/github-link";
import { LightWave } from "@/components/light-wave";
import { InfoTabs } from "@/components/info-tabs";
import { Wordmark } from "@/components/wordmark";
import { collections } from "@/lib/collections";
import { prompts } from "@/lib/prompts";
import { SITE, asset } from "@/lib/site-config";

function jsonLd() {
  const publisher = { "@type": "Organization", name: SITE.publisher.name, url: SITE.publisher.url };
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE.name,
      description: SITE.description,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Windows, macOS, Linux",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: `${SITE.domain}/`,
      image: `${SITE.domain}/og-image.jpg`,
      author: publisher,
      codeRepository: SITE.github,
      downloadUrl: SITE.npmUrl,
    },
    { "@context": "https://schema.org", ...publisher },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: `${SITE.domain}/`,
      publisher,
    },
  ];
  // Escape "<" so the JSON can never close the script tag early.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

// The painting behind the page. The CSS reads these so the URLs include the base path.
const BACKGROUND = {
  "--bg-webp": `url("${asset("/backgroundImages/discussion.webp")}")`,
  "--bg-png": `url("${asset("/backgroundImages/discussion.png")}")`,
} as React.CSSProperties;

// The prompt cards sit beside the text on wide screens and below it on narrow ones.
const WHERE = (
  <>
    <span className="lg:hidden">below</span>
    <span className="hidden lg:inline">on the right</span>
  </>
);

const STEPS = [
  <>Runs on Claude Code, ChatGPT desktop, or Antigravity.</>,
  <>To set up Dialogues MCP, copy the prompt {WHERE} and paste it into your AI app.</>,
  <>
    Once the install is complete, restart your desktop AI app, then send your first message,
    like the one {WHERE}.
  </>,
];

const documents = (
  <div className="flex flex-col gap-3 pt-4">
    <ul className="doc-list">
      {collections.map((collection) => (
        <li key={collection.id} className="doc-item">
          <span className="text-sm font-medium text-white">
            {collection.title}
            {collection.downloadable ? null : (
              <span className="font-normal text-ink-muted"> (listed, not downloadable)</span>
            )}
          </span>
          <span className="text-xs leading-relaxed text-ink-muted">
            {collection.sources.map((source, i) => (
              <span key={source.name}>
                {i > 0 ? " · " : null}
                <ExternalLink href={source.url} className="doc-source">
                  {source.name}
                </ExternalLink>
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const moreInfo = (
  <div className="pt-4">
    <ol className="flex flex-col gap-2.5 text-base leading-snug text-ink-soft">
      {STEPS.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="w-3 shrink-0 font-semibold text-accent tabular-nums">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
    <p className="mt-4 text-sm leading-relaxed text-ink-muted">
      Dialogues MCP runs completely on your computer. The diaries and letters are downloaded to
      your computer and stay there.
    </p>
  </div>
);

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <div aria-hidden="true" className="bg-layer" style={BACKGROUND} />
      <div aria-hidden="true" className="bg-overlay" />
      <LightWave />

      <div className="flex min-h-dvh flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-5 sm:px-8 lg:pt-6 short:pt-4">
          <Wordmark />
          <GithubLink href={SITE.github} />
        </header>

        <main className="mx-auto grid w-full max-w-6xl flex-1 content-center items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 lg:py-6 short:py-4">
          <div className="flex flex-col items-start gap-5 short:gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-ink-soft backdrop-blur-sm sm:text-xs">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              Free · Open source · Runs on your computer
            </span>
            <h1 className="text-3xl font-semibold leading-[1.12] tracking-tight text-balance text-white sm:text-4xl xl:text-[2.5rem] short:text-3xl">
              Talk with historical diaries and letters.
            </h1>
            <p className="max-w-xl text-base leading-snug text-ink-soft text-pretty">
              Dialogues MCP lets your AI app read from a document collection stored on your
              computer. Ask a question and get answers that quote and cite the original diaries
              and letters.
            </p>

            <InfoTabs
              tabs={[
                { label: "Documents", content: documents },
                { label: "More info", content: moreInfo },
              ]}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4 short:gap-3">
            <CopyBlock title="Send this to your AI to install" text={prompts.install_prompt} />
            <CopyBlock title="Send your first message" variant="message" text={prompts.first_message} />
          </div>
        </main>

        <footer className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 px-5 pb-5 pt-2 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>MIT License</p>
          <p>
            Made by{" "}
            <ExternalLink
              href={SITE.publisher.url}
              className="text-ink-soft underline decoration-ink-muted hover:text-white"
            >
              {SITE.publisher.name}
            </ExternalLink>
          </p>
        </footer>
      </div>
    </>
  );
}
