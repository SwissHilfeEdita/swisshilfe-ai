export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/ask") {
      try {
        const body = await request.json();
        const question = (body.question || "").trim();

        if (!question) {
          return Response.json(
            { answer: "Shkruaj një pyetje." },
            { status: 400 }
          );
        }

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages: [
              {
                role: "system",
                content:
                  "Ti je SwissHilfe AI. Ndihmon njerëzit që jetojnë në Zvicër me punën, RAV, sigurimet, Krankenkasse, mjekun, taksat, IV, AHV, letra dhe formularë. Përgjigju në gjuhën e përdoruesit, shqip ose gjermanisht, me fjalë të thjeshta. Jep informacion orientues dhe mos shpik ligje ose afate."
              },
              {
                role: "user",
                content: question
              }
            ]
          }
        );

        return Response.json({
          answer: result.response || "Nuk munda të krijoj përgjigje."
        });

      } catch (error) {
        return Response.json(
          { answer: "Pati një problem me AI. Provo përsëri." },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
