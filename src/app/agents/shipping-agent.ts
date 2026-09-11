import { tool } from '@openrouter/agent';
import { z } from 'zod';
import { shippingCalc } from '../tool/shipping-calc';

export const shippingTool = tool({
  name: 'shipping_calculator',
  description: 'Calculate the shipping cost for a given destination city.',
inputSchema: z.object({
    location: z.string().describe('Destination city name (e.g. Chennai, Bangalore)'),
  }),
  execute: async ({ location }) => {
    const cost = shippingCalc(location);

    return { location, costInUSD: cost };
  },
});