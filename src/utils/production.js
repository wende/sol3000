/**
 * Simple production/consumption allocation utilities.
 *
 * Core rules:
 * - A producer has a finite `supply`.
 * - A producer may serve many consumers.
 * - Producer throughput is split equally across its active consumers.
 * - Each consumer is capped (remaining demand) and each connection may be capped (bandwidth).
 * - When some consumers cap out, the leftover is redistributed equally among the rest.
 */

const EPSILON = 1e-9;

// Pricing constants (tune as needed)
export const INCOME_PER_UNIT = 1;
export const MIN_PRICE_MULTIPLIER = 0.2;
export const PRICE_SATURATION_POWER = 1;

function clampNonNegative(value) {
  if (value === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Convert a demand satisfaction ratio (0..1) to a price multiplier.
 * - Ratio 0 (no demand met): highest price (1.0)
 * - Ratio 1 (fully met): lowest price (`MIN_PRICE_MULTIPLIER`)
 *
 * @param {number} satisfactionRatio
 * @returns {number}
 */
export function priceMultiplierForSatisfaction(satisfactionRatio) {
  const ratio = clamp01(satisfactionRatio);
  const shaped = Math.pow(ratio, PRICE_SATURATION_POWER);
  return 1 - (1 - MIN_PRICE_MULTIPLIER) * shaped;
}

/**
 * Split supply across consumers using fair-share with redistribution (water-filling).
 *
 * @template {string|number} TId
 * @param {number} supply
 * @param {Array<{ id: TId, max: number }>} consumers
 * @returns {{ allocations: Map<TId, number>, used: number, unused: number }}
 */
export function allocateFairShare(supply, consumers) {
  const allocations = new Map();
  let remainingSupply = clampNonNegative(supply);

  /** @type {Array<{ id: any, cap: number }>} */
  let active = consumers
    .map(({ id, max }) => ({ id, cap: clampNonNegative(max) }))
    .filter(c => c.cap > EPSILON);

  while (remainingSupply > EPSILON && active.length > 0) {
    const share = remainingSupply / active.length;

    let roundTotal = 0;
    const roundAmounts = active.map(({ cap }) => {
      const amount = Math.min(share, cap);
      roundTotal += amount;
      return amount;
    });

    remainingSupply = Math.max(0, remainingSupply - roundTotal);

    /** @type {Array<{ id: any, cap: number }>} */
    const nextActive = [];
    for (let i = 0; i < active.length; i++) {
      const { id, cap } = active[i];
      const amount = roundAmounts[i];
      allocations.set(id, (allocations.get(id) || 0) + amount);
      const remainingCap = cap - amount;
      if (remainingCap > EPSILON) nextActive.push({ id, cap: remainingCap });
    }

    active = nextActive;
  }

  const used = clampNonNegative(supply) - remainingSupply;
  return { allocations, used, unused: remainingSupply };
}

/**
 * @typedef {string|number} Id
 *
 * @typedef {{ id: Id, supply: number }} Producer
 * @typedef {{ id: Id, demand: number }} Consumer
 * @typedef {{ producerId: Id, consumerId: Id, bandwidth?: number }} Link
 *
 * @typedef {{
 *  flows: Array<{ producerId: Id, consumerId: Id, amount: number }>,
 *  producerSent: Map<Id, number>,
 *  consumerReceived: Map<Id, number>,
 *  unmetDemand: Map<Id, number>,
 *  unusedSupply: Map<Id, number>
 * }} SatisfactionResult
 */

/**
 * Satisfy consumer demand (partially) from one or many producers.
 *
 * Allocation rule per producer: fair-share with redistribution among its outgoing links,
 * capped by each link's bandwidth and each consumer's remaining demand.
 *
 * @param {{
 *  producers: Producer[],
 *  consumers: Consumer[],
 *  links: Link[]
 * }} input
 * @returns {SatisfactionResult}
 */
export function satisfyDemands({ producers, consumers, links }) {
  const remainingDemand = new Map(consumers.map(c => [c.id, clampNonNegative(c.demand)]));
  const unusedSupply = new Map();
  const producerSent = new Map();
  const consumerReceived = new Map(consumers.map(c => [c.id, 0]));

  /** @type {Map<string, number>} */
  const edgeFlow = new Map();

  for (const producer of producers) {
    let producerSupply = clampNonNegative(producer.supply);

    const outgoing = links.filter(l => l.producerId === producer.id);
    if (producerSupply <= EPSILON || outgoing.length === 0) {
      unusedSupply.set(producer.id, producerSupply);
      producerSent.set(producer.id, 0);
      continue;
    }

    const caps = outgoing.map(l => {
      const bandwidth = l.bandwidth == null ? Number.POSITIVE_INFINITY : clampNonNegative(l.bandwidth);
      const demandLeft = remainingDemand.get(l.consumerId) || 0;
      return {
        id: l.consumerId,
        max: Math.min(bandwidth, demandLeft)
      };
    });

    const { allocations, used, unused } = allocateFairShare(producerSupply, caps);
    unusedSupply.set(producer.id, unused);
    producerSent.set(producer.id, used);

    for (const link of outgoing) {
      const amount = allocations.get(link.consumerId) || 0;
      if (amount <= EPSILON) continue;

      const key = `${String(link.producerId)}->${String(link.consumerId)}`;
      edgeFlow.set(key, (edgeFlow.get(key) || 0) + amount);

      remainingDemand.set(link.consumerId, Math.max(0, (remainingDemand.get(link.consumerId) || 0) - amount));
      consumerReceived.set(link.consumerId, (consumerReceived.get(link.consumerId) || 0) + amount);
    }
  }

  const unmetDemand = new Map();
  for (const consumer of consumers) {
    unmetDemand.set(consumer.id, remainingDemand.get(consumer.id) || 0);
  }

  const flows = links.map(l => {
    const key = `${String(l.producerId)}->${String(l.consumerId)}`;
    return { producerId: l.producerId, consumerId: l.consumerId, amount: edgeFlow.get(key) || 0 };
  });

  return { flows, producerSent, consumerReceived, unmetDemand, unusedSupply };
}

/**
 * Calculate dynamic income from allocated flows.
 *
 * Pricing is based on each consumer's satisfaction ratio (received / demand).
 * Each delivered unit generates `incomePerUnit`, scaled by the consumer multiplier.
 *
 * @param {{
 *  consumers: Consumer[],
 *  flows: Array<{ producerId: Id, consumerId: Id, amount: number }>,
 *  incomePerUnit?: number
 * }} input
 * @returns {{
 *  totalIncome: number,
 *  producerIncome: Map<Id, number>,
 *  consumerMultiplier: Map<Id, number>
 * }}
 */
export function calculateDynamicIncome({ consumers, flows, incomePerUnit = INCOME_PER_UNIT }) {
  const demands = new Map(consumers.map(c => [c.id, clampNonNegative(c.demand)]));
  const received = new Map(consumers.map(c => [c.id, 0]));

  for (const flow of flows) {
    if (!flow || !Number.isFinite(flow.amount) || flow.amount <= 0) continue;
    received.set(flow.consumerId, (received.get(flow.consumerId) || 0) + flow.amount);
  }

  const consumerMultiplier = new Map();
  for (const consumer of consumers) {
    const demand = demands.get(consumer.id) || 0;
    const got = received.get(consumer.id) || 0;
    const ratio = demand > EPSILON ? got / demand : 0;
    consumerMultiplier.set(consumer.id, priceMultiplierForSatisfaction(ratio));
  }

  const producerIncome = new Map();
  let totalIncome = 0;

  for (const flow of flows) {
    const amount = clampNonNegative(flow.amount);
    if (amount <= EPSILON) continue;

    const multiplier = consumerMultiplier.get(flow.consumerId) ?? 1;
    const income = amount * clampNonNegative(incomePerUnit) * multiplier;

    totalIncome += income;
    producerIncome.set(flow.producerId, (producerIncome.get(flow.producerId) || 0) + income);
  }

  return { totalIncome, producerIncome, consumerMultiplier };
}
