import TeamManager from '../src/TeamManager';
import Triggers from '../src/Triggers';

import { EventEmitter } from 'events';

class FakeClient {
  private emitter = new EventEmitter();
  Triggers = new Triggers({} as any);
  addEventListener(event: string, cb: any, _options?: any) {
    this.emitter.on(event, cb);
    return () => this.emitter.off(event, cb);
  }
  removeEventListener(event: string, cb: any) {
    this.emitter.off(event, cb);
  }
  sendEvent(type: string, detail?: any) {
    this.emitter.emit(type, { detail });
  }
}

describe('TeamManager', () => {
  let client: FakeClient;
  let manager: TeamManager;

  beforeEach(() => {
    client = new FakeClient();
    manager = new TeamManager((client as unknown) as any);
  });

  test('adds member from gmcp objects', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Pablo', living: true, team: true },
    });
    expect(manager.isInTeam('Pablo')).toBe(true);
  });

  test('removes member on leave message', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Vesper', living: true, team: true },
    });
    client.Triggers.parseLine('Vesper porzuca twoja druzyne.', '');
    expect(manager.isInTeam('Vesper')).toBe(false);
  });

  test('clears team on clear message', () => {
    client.sendEvent('gmcp.objects.data', {
      '1': { desc: 'Bob', living: true, team: true },
    });
    client.Triggers.parseLine('Nie jestes w zadnej druzynie.', '');
    expect(manager.getTeamMembers()).toEqual([]);
  });

  test('full sync message sets leader and members', () => {
    client.Triggers.parseLine('Druzyne prowadzi Vesper i oprocz ciebie sa w niej jeszcze: Pablo i Opeteh.', '');
    expect(manager.getLeader()).toBe('Vesper');
    const members = manager.getTeamMembers();
    expect(members).toEqual(expect.arrayContaining(['Vesper', 'Pablo', 'Opeteh']));
    expect(manager.isInTeam('Pablo')).toBe(true);
  });

  describe('Objects data accumulation', () => {
    test('accumulates objects data with timestamps', () => {
      const testData1 = {
        '1': { desc: 'Pablo', living: true, team: true },
        '2': { desc: 'Vesper', living: true, team: true, team_leader: true }
      };

      const testData2 = {
        '1': { desc: 'Pablo', living: true, team: true }
      };

      client.sendEvent('gmcp.objects.data', testData1);
      client.sendEvent('gmcp.objects.data', testData2);

      const accumulated = manager.getAccumulatedObjectsData();
      expect(accumulated).toHaveLength(2);
      expect(accumulated[0].data).toEqual(testData1);
      expect(accumulated[1].data).toEqual(testData2);
      expect(accumulated[0].timestamp).toBeLessThanOrEqual(accumulated[1].timestamp);
    });

    test('getLatestObjectsData returns most recent entry', () => {
      const testData = {
        '1': { desc: 'Pablo', living: true, team: true }
      };

      client.sendEvent('gmcp.objects.data', testData);

      const latest = manager.getLatestObjectsData();
      expect(latest).toBeDefined();
      expect(latest!.data).toEqual(testData);
      expect(latest!.objects).toHaveLength(1);
      expect(latest!.objects[0].desc).toBe('Pablo');
    });

    test('getObjectsDataSince filters by timestamp', () => {
      client.sendEvent('gmcp.objects.data', { '1': { desc: 'Pablo', living: true, team: true } });

      // Wait a bit to ensure different timestamp
      const filterTime = Date.now();

      client.sendEvent('gmcp.objects.data', { '2': { desc: 'Vesper', living: true, team: true } });

      const recentData = manager.getObjectsDataSince(filterTime);
      expect(recentData).toHaveLength(1);
      expect(recentData[0].objects[0].desc).toBe('Vesper');
    });

    test('getObjectsDataInRange filters by time range', () => {
      // Mock Date.now to control timestamps
      const originalDateNow = Date.now;
      let mockTime = 1000;
      Date.now = jest.fn(() => mockTime);

      client.sendEvent('gmcp.objects.data', { '1': { desc: 'Pablo', living: true, team: true } });

      mockTime = 2000;
      const midTime = mockTime;

      client.sendEvent('gmcp.objects.data', { '2': { desc: 'Vesper', living: true, team: true } });

      mockTime = 3000;
      const endTime = mockTime;

      client.sendEvent('gmcp.objects.data', { '3': { desc: 'Bob', living: true, team: true } });

      const rangeData = manager.getObjectsDataInRange(midTime, endTime);
      expect(rangeData).toHaveLength(1);
      expect(rangeData[0].objects[0].desc).toBe('Vesper');

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    test('clearAccumulatedData removes all accumulated data', () => {
      client.sendEvent('gmcp.objects.data', { '1': { desc: 'Pablo', living: true, team: true } });
      client.sendEvent('gmcp.objects.data', { '2': { desc: 'Vesper', living: true, team: true } });

      expect(manager.getAccumulatedDataCount()).toBe(2);

      manager.clearAccumulatedData();

      expect(manager.getAccumulatedDataCount()).toBe(0);
      expect(manager.getAccumulatedObjectsData()).toHaveLength(0);
    });

    test('clearOldAccumulatedData removes data older than timestamp', () => {
      // Mock Date.now to control timestamps
      const originalDateNow = Date.now;
      let mockTime = 1000;
      Date.now = jest.fn(() => mockTime);

      client.sendEvent('gmcp.objects.data', { '1': { desc: 'Pablo', living: true, team: true } });

      mockTime = 2000;
      const cutoffTime = mockTime;

      client.sendEvent('gmcp.objects.data', { '2': { desc: 'Vesper', living: true, team: true } });

      expect(manager.getAccumulatedDataCount()).toBe(2);

      manager.clearOldAccumulatedData(cutoffTime);

      expect(manager.getAccumulatedDataCount()).toBe(1);
      const remaining = manager.getAccumulatedObjectsData();
      expect(remaining[0].objects[0].desc).toBe('Vesper');

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    test('handles different data formats correctly', () => {
      // Test array format
      client.sendEvent('gmcp.objects.data', [
        { desc: 'Pablo', living: true, team: true }
      ]);

      // Test objects format with data property
      client.sendEvent('gmcp.objects.data', {
        data: {
          '1': { desc: 'Vesper', living: true, team: true }
        }
      });

      const accumulated = manager.getAccumulatedObjectsData();
      expect(accumulated).toHaveLength(2);
      expect(accumulated[0].objects[0].desc).toBe('Pablo');
      expect(accumulated[1].objects[0].desc).toBe('Vesper');
    });

    test('getAccumulatedDataCount returns correct count', () => {
      expect(manager.getAccumulatedDataCount()).toBe(0);

      client.sendEvent('gmcp.objects.data', { '1': { desc: 'Pablo', living: true, team: true } });
      expect(manager.getAccumulatedDataCount()).toBe(1);

      client.sendEvent('gmcp.objects.data', { '2': { desc: 'Vesper', living: true, team: true } });
      expect(manager.getAccumulatedDataCount()).toBe(2);
    });
  });
});
