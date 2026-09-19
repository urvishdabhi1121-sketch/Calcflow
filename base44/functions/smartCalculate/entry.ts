import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const body = await req.json();
    const query = body?.query;
    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Please describe what you want to calculate.' }, { status: 400 });
    }
    if (query.length > 500) {
      return Response.json({ error: 'Please keep your request under 500 characters.' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const prompt = `You are CalcFlow, a smart calculation assistant. Interpret the user's natural-language calculation request and produce a precise, structured result.

User request: "${query}"

Return JSON with exactly this structure. Never invent numbers — if information is missing, set "understood" to false and ask a focused clarification question.

Rules:
- Show the FULL step-by-step breakdown. Never hide a calculation step.
- Round all monetary values to 2 decimal places.
- For currency results, set result_is_currency to true.
- If the request involves a unit conversion, set result_is_currency to false and include the unit in result_label.
- If you cannot confidently interpret the request, set understood=false and provide a clarification question.
- Be mathematically precise. Double-check every calculation.`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          understood: { type: 'boolean' },
          clarification: { type: ['string', 'null'] },
          result_label: { type: 'string' },
          result_value: { type: 'number' },
          result_is_currency: { type: 'boolean' },
          breakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'number' },
              },
              required: ['label', 'value'],
            },
          },
          assumptions: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' },
        },
        required: ['understood', 'result_label', 'result_value', 'result_is_currency', 'breakdown'],
      },
    });

    return Response.json(llmResponse);
  } catch (error) {
    return Response.json({ error: 'Could not process that calculation right now. Please try again.' }, { status: 500 });
  }
}