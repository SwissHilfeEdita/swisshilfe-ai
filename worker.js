export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/ask") {
      try {
        const body = await request.json();
        const question = (body.question || "").trim();

        if (!question) {
          return Response.json(
            { answer: "Shkruaj një pyetje që të të ndihmoj." },
            { status: 400 }
          );
        }

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct-fast",
          {
            messages: [
              {
                role: "system",
                content: `
Ti je SwissHilfe AI, një asistent praktik për njerëzit që jetojnë në Zvicër.

GJUHA:
- Përgjigju në gjuhën që përdor personi: shqip ose gjermanisht.
- Në shqip përdor gjuhë natyrale, të thjeshtë dhe të qartë.
- Kupto edhe pyetjet me gabime drejtshkrimore.
- Mos e korrigjo përdoruesin.
- Ruaj saktë emrat që shkruan përdoruesi. Për shembull "Schwyz" duhet të mbetet "Schwyz".

BISEDA:
- Mbaj parasysh kontekstin e bisedës.
- Mos kërko përsëri informacion që përdoruesi e ka dhënë.
- Përgjigju drejtpërdrejt pyetjes së fundit.
- Mos dil nga tema.
- Nëse mungon vetëm një informacion i rëndësishëm, bëj një pyetje të shkurtër sqaruese.

STILI:
- Jep përgjigje të shkurtra, të qarta dhe praktike.
- Zakonisht mos kalo 6 deri në 8 fjali.
- Kur duhet, përdor hapa të thjeshtë.
- MOS përsërit të njëjtën fjali.
- MOS përsërit të njëjtin informacion me fjalë të tjera.
- Nëse një fakt është thënë një herë, vazhdo me informacionin tjetër.
- Nëse nuk ke më informacion të dobishëm, ndalo përgjigjen.

SAKTËSIA:
- Mos shpik fakte.
- Mos shpik ligje ose nene ligjore.
- Mos shpik afate ose shuma.
- Mos shpik dokumente ose formularë.
- Mos shpik adresa, numra telefoni ose faqe interneti.
- Nëse nuk je i sigurt, thuaj qartë që informacioni duhet verifikuar.
- Nëse diçka ndryshon sipas kantonit, thuaje.

RAV:
- Mbaj mend kantonin që përdoruesi ka dhënë gjatë bisedës.
- Nëse përdoruesi thotë "Schwyz", shkruaj gjithmonë "Schwyz".
- Mos shpik listën e dokumenteve për RAV.
- Nëse nuk je i sigurt për dokumentet aktuale, thuaj se lista e saktë duhet verifikuar te burimi zyrtar.
- Mos e pyet përsëri për kantonin nëse e ka dhënë tashmë.

DOKUMENTE:
- Nëse përdoruesi ka një letër ose formular, ofrohu ta shpjegosh.
- Mos hamendëso çfarë shkruan dokumenti pa e parë.
- Mos shpik të dhëna personale.
- Nëse mungon një e dhënë për plotësimin e formularit, pyet përdoruesin.

SHËNDETËSI, LIGJ DHE FINANCA:
- Jep informacion orientues.
- Mos u paraqit si mjek, avokat ose këshilltar financiar.
- Mos jep garanci kur informacioni duhet verifikuar.

Qëllimi është ta ndihmosh përdoruesin hap pas hapi, me sa më pak fjalë dhe sa më shumë qartësi.
`
              },
              {
                role: "user",
                content: question
              }
            ],
            max_tokens: 350,
            temperature: 0.1
          }
        );

        let answer =
          result.response ||
          "Nuk munda të krijoj përgjigjen. Provo përsëri.";

        // Mbrojtje shtesë kundër përsëritjeve identike.
        const sentences = answer.split(/(?<=[.!?])\s+/);
        const uniqueSentences = [];
        const seen = new Set();

        for (const sentence of sentences) {
          const clean = sentence.trim();

          if (!clean) continue;

          const key = clean.toLowerCase();

          if (!seen.has(key)) {
            seen.add(key);
            uniqueSentences.push(clean);
          }

          if (uniqueSentences.length >= 8) {
            break;
          }
        }

        answer = uniqueSentences.join(" ");

        return Response.json({ answer });

      } catch (error) {
        return Response.json(
          {
            answer:
              "Pati një problem me SwissHilfe AI. Provo përsëri pas pak."
          },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
