import { describe, it, expect } from 'vitest';
import { allocateFairShare, satisfyDemands, calculateDynamicIncome, INCOME_PER_UNIT, MIN_PRICE_MULTIPLIER } from './production';

describe('production/consumption allocation', () => {
  describe('allocateFairShare', () => {
    it('splits supply equally when no caps bind', () => {
      const { allocations, used, unused } = allocateFairShare(1000, [
        { id: 'a', max: 1000 },
        { id: 'b', max: 1000 }
      ]);

      expect(allocations.get('a')).toBe(500);
      expect(allocations.get('b')).toBe(500);
      expect(used).toBe(1000);
      expect(unused).toBe(0);
    });

    it('redistributes leftover when a consumer caps out', () => {
      const { allocations } = allocateFairShare(1000, [
        { id: 'a', max: 250 },
        { id: 'b', max: 1000 }
      ]);

      expect(allocations.get('a')).toBe(250);
      expect(allocations.get('b')).toBe(750);
    });

    it('leaves unused supply when all consumers cap out', () => {
      const { allocations, unused } = allocateFairShare(1000, [
        { id: 'a', max: 100 },
        { id: 'b', max: 100 },
        { id: 'c', max: 100 }
      ]);

      expect(allocations.get('a')).toBe(100);
      expect(allocations.get('b')).toBe(100);
      expect(allocations.get('c')).toBe(100);
      expect(unused).toBe(700);
    });
  });

  describe('satisfyDemands', () => {
    it('satisfies demand from a single producer with fair-share splitting', () => {
      const result = satisfyDemands({
        producers: [{ id: 'p', supply: 1000 }],
        consumers: [
          { id: 'c1', demand: 1000 },
          { id: 'c2', demand: 1000 }
        ],
        links: [
          { producerId: 'p', consumerId: 'c1' },
          { producerId: 'p', consumerId: 'c2' }
        ]
      });

      expect(result.consumerReceived.get('c1')).toBe(500);
      expect(result.consumerReceived.get('c2')).toBe(500);
      expect(result.unmetDemand.get('c1')).toBe(500);
      expect(result.unmetDemand.get('c2')).toBe(500);

      expect(result.flows).toEqual([
        { producerId: 'p', consumerId: 'c1', amount: 500 },
        { producerId: 'p', consumerId: 'c2', amount: 500 }
      ]);
    });

    it('respects per-consumer demand caps and redistributes within a producer', () => {
      const result = satisfyDemands({
        producers: [{ id: 'p', supply: 1000 }],
        consumers: [
          { id: 'c1', demand: 250 },
          { id: 'c2', demand: 1000 }
        ],
        links: [
          { producerId: 'p', consumerId: 'c1' },
          { producerId: 'p', consumerId: 'c2' }
        ]
      });

      expect(result.consumerReceived.get('c1')).toBe(250);
      expect(result.consumerReceived.get('c2')).toBe(750);
      expect(result.unmetDemand.get('c1')).toBe(0);
      expect(result.unmetDemand.get('c2')).toBe(250);
      expect(result.unusedSupply.get('p')).toBe(0);
    });

    it('allows a consumer to be satisfied by many producers (without exceeding demand)', () => {
      const result = satisfyDemands({
        producers: [
          { id: 'p1', supply: 600 },
          { id: 'p2', supply: 600 }
        ],
        consumers: [{ id: 'c', demand: 1000 }],
        links: [
          { producerId: 'p1', consumerId: 'c' },
          { producerId: 'p2', consumerId: 'c' }
        ]
      });

      expect(result.consumerReceived.get('c')).toBe(1000);
      expect(result.unmetDemand.get('c')).toBe(0);
      expect(result.unusedSupply.get('p1')).toBe(0);
      expect(result.unusedSupply.get('p2')).toBe(200);
    });

    it('respects link bandwidth caps', () => {
      const result = satisfyDemands({
        producers: [{ id: 'p', supply: 1000 }],
        consumers: [
          { id: 'c1', demand: 1000 },
          { id: 'c2', demand: 1000 }
        ],
        links: [
          { producerId: 'p', consumerId: 'c1', bandwidth: 250 },
          { producerId: 'p', consumerId: 'c2', bandwidth: 1000 }
        ]
      });

      expect(result.consumerReceived.get('c1')).toBe(250);
      expect(result.consumerReceived.get('c2')).toBe(750);
    });
  });

  describe('dynamic pricing', () => {
    it('charges more when demand is less satisfied', () => {
      const consumers = [{ id: 'c', demand: 1000 }];

      const scarce = calculateDynamicIncome({
        consumers,
        flows: [{ producerId: 'p', consumerId: 'c', amount: 100 }],
        incomePerUnit: INCOME_PER_UNIT
      });

      const plentiful = calculateDynamicIncome({
        consumers,
        flows: [{ producerId: 'p', consumerId: 'c', amount: 900 }],
        incomePerUnit: INCOME_PER_UNIT
      });

      expect(scarce.consumerMultiplier.get('c')).toBeGreaterThan(plentiful.consumerMultiplier.get('c'));
      expect(scarce.totalIncome / 100).toBeGreaterThan(plentiful.totalIncome / 900);
    });

    it('hits the minimum multiplier at full satisfaction', () => {
      const result = calculateDynamicIncome({
        consumers: [{ id: 'c', demand: 1000 }],
        flows: [{ producerId: 'p', consumerId: 'c', amount: 1000 }],
        incomePerUnit: 2
      });

      expect(result.consumerMultiplier.get('c')).toBeCloseTo(MIN_PRICE_MULTIPLIER, 10);
      expect(result.totalIncome).toBeCloseTo(1000 * 2 * MIN_PRICE_MULTIPLIER, 10);
    });
  });
});
