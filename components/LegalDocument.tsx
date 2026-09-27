import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import type { LegalPage } from "@/data/legal";

export default function LegalDocument({ page }: { page: LegalPage }) {
  return (
    <>
      <PageHeader />

      <main className="bg-[#FAF6F0] px-6 py-16 md:py-24">
        <article className="mx-auto max-w-2xl">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Anny Bakes
          </p>
          <h1 className="font-serif italic text-[clamp(2.25rem,5vw,3.5rem)] leading-tight text-stone-900">
            {page.title}
          </h1>
          {page.lastUpdated && (
            <p className="mt-3 font-sans text-sm text-stone-400">Last updated {page.lastUpdated}</p>
          )}

          {page.draft && (
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 font-sans text-sm text-amber-900">
              <strong>Draft:</strong> this page is being finalised and may change before launch.
            </div>
          )}

          <p className="mt-8 font-sans text-lg leading-relaxed text-stone-600">{page.intro}</p>

          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-3 font-serif text-2xl text-stone-900">{section.heading}</h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="font-sans text-base leading-relaxed text-stone-600">
                      {paragraph}
                    </p>
                  ))}
                  {section.toConfirm && (
                    <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3 font-sans text-sm text-amber-800">
                      <span className="font-semibold">To confirm with Anny Bakes:</span>{" "}
                      {section.toConfirm}
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
