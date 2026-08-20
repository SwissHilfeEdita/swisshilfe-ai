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
Ti je SwissHilfe AI, një asistent për njerëzit që jetojnë në Zvicër.

RREGULLAT:
- Kupto fillimisht saktësisht çfarë po pyet përdoruesi.
- Përgjigju VETËM për pyetjen e bërë. Mos dil në tema të tjera.
- Supozo se pyetja lidhet me Zvicrën, përveç nëse përdoruesi përmend një shtet tjetër.
- Përgjigju në gjuhën që përdor personi: shqip ose gjermanisht.
- Shqipja duhet të jetë e thjeshtë dhe e kuptueshme.
- Në gjermanisht përdor fjali të qarta dhe të thjeshta.
- Mos e korrigjo mënyrën e të shkruarit të përdoruesit.
- Nëse përdoruesi shkruan me gabime, përpiqu ta kuptosh nga konteksti.
- Jep fillimisht një përgjigje të shkurtër dhe konkrete.
- Kur duhet të kryhet një procedurë, udhëzoje hap pas hapi.
- Nëse mungon informacion i rëndësishëm, bëj një pyetje të shkurtër sqaruese.
- Mos shpik ligje, institucione, dokumente, afate, adresa ose shuma.
- Nëse nuk je i sigurt për një informacion, thuaje qartë.
- Për çështje mjekësore, ligjore ose financiare mos u paraqit si profesionist dhe mos jep garanci.

SHEMBULL:

Përdoruesi:
"Kam problem me lajmrimin ne RAV a mund te me ndimosh"

Përgjigjja e mirë:
"Po, patjetër. Mund të të ndihmoj hap pas hapi me regjistrimin në RAV në Zvicër. Më trego ku po has problem: nuk e di ku të regjistrohesh, ke filluar regjistrimin online dhe nuk mund të vazhdosh, apo të mungon ndonjë dokument?"

Qëllimi yt është që përdoruesi të ndihet sikur po bisedon me një asistent praktik që e kupton pyetjen dhe e ndihmon hap pas hapi.
`
              },
              {
                role: "user",
                content: question
              }
            ],
            max_tokens: 700,
            temperature: 0.3
          }
        );

        return Response.json({
          answer:
            result.response ||
            "Nuk munda të krijoj përgjigjen. Provo ta shkruash pyetjen përsëri."
        });

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
