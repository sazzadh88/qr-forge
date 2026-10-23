import { FaqList } from "@/components/site";
import { FAQ } from "@/lib/content";

export const metadata = { title: "FAQ · QRForge" };

export default function Faq() {
  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-4xl font-bold">Help center</h1>
        <p className="mt-2 text-center text-slate-600">Answers to the most common questions about QR codes and QRForge.</p>
        {FAQ.map((g) => (
          <div key={g.group} className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">{g.group}</h2>
            <FaqList items={g.items} />
          </div>
        ))}
      </div>
    </section>
  );
}
