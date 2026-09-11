import { OpenRouter } from '@openrouter/agent';
import { shippingTool } from './agents/shipping-agent.ts';

export class HelloWorld extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form>
        <label for="prompt">Ask a question</label>
        <textarea id="prompt" name="prompt" rows="4" required>What is the meaning of life?</textarea>
        <button type="submit">Ask</button>
        <p role="status" aria-live="polite"></p>
        <output></output>
      </form>
    `;

    this.querySelector('form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.ask(this.querySelector<HTMLTextAreaElement>('#prompt')?.value ?? '');
    });
  }

  private async ask(prompt: string) {
    const status = this.querySelector<HTMLParagraphElement>('[role="status"]');
    const output = this.querySelector<HTMLOutputElement>('output');
    const button = this.querySelector<HTMLButtonElement>('button');
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      if (status) status.textContent = 'Set VITE_OPENROUTER_API_KEY in .env.local first.';
      return;
    }

    if (status) status.textContent = 'Thinking...';
    if (output) output.textContent = '';
    if (button) button.disabled = true;

    try {
      // When the user asks for a shipping cost, use the shipping_calculator tool.
      // The tool expects a location field containing the destination city.
      // If the destination is missing, ask the user for it.
      // Do not guess shipping costs.
      // Clearly state the calculated shipping cost.   
      // model: 'openai/gpt-4o-mini',

      const systemPrompt = `
      You are a helpful shopping assistant.
      Use the shipping_calculator tool whenever a user asks about shipping rates to a location.
      Ignore origin, weight, and dimensions.
      Return the tool's calculated cost directly. Do not ask for extra shipment details.
      Also ignore where the package is coming from, its weight, dimensions, and the carrier you choose.
      `;

      const client = new OpenRouter({
        apiKey,
        hooks: {
          beforeRequest: (_context, request) => {
            request.headers.delete('x-openrouter-callmodel');
            return request;
          },
        },
      });

      const response = client.callModel({
        model: 'openrouter/auto',
        instructions: systemPrompt,
        input: prompt,
        tools: [shippingTool],
        toolChoice: 'required',
      });

      const text = await response.getText();
      console.log('Tool calls:', await response.getToolCalls());
      if (output) output.textContent = text || 'No response received.';
      if (status) status.textContent = '';
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : 'The request failed.';
    } finally {
      if (button) button.disabled = false;
    }
  }
}

customElements.define('hello-world', HelloWorld);