import {parseContainer, categorizeItems, createRegexpFilter, formatTable} from '../src/scripts/prettyContainers';

describe('prettyContainers', () => {
  const input = 'Otwarty szary skorzany plecak zawiera zlocisty piryt, upiorny mglisty calun, skorzany buklak, gornicza lampe, oliwkowozielony serpentyn, zielonkawy awenturyn, zolty celestyn, bezbarwny gorski krysztal, mithrylowa monete, wiele zlotych monet, wiele srebrnych monet i wiele miedzianych monet.';
  const groups = [
    { name: 'ubrania', filter: createRegexpFilter(['calun']) },
    { name: 'kamienie', filter: createRegexpFilter(['piryt', 'serpentyn', 'awenturyn', 'celestyn', 'krysztal']) },
  ];

  test('parseContainer splits items', () => {
    const parsed = parseContainer(input)!;
    expect(parsed.container).toContain('plecak');
    expect(parsed.items.length).toBe(12);
    expect(parsed.items[0]).toEqual({count: 1, name: 'zlocisty piryt'});
    expect(parsed.items[10]).toEqual({count: 'wie', name: 'srebrnych monet'});
  });

  test('categorizeItems groups by filters', () => {
    const parsed = parseContainer(input)!;
    const cat = categorizeItems(parsed.items, groups);
    expect(cat.ubrania.map(i => i.name)).toContain('upiorny mglisty calun');
    expect(cat.kamienie.map(i => i.name)).toContain('zlocisty piryt');
    expect(cat.inne.map(i => i.name)).toContain('skorzany buklak');
    expect(Object.keys(cat).slice(-1)[0]).toBe('inne');
  });

  test('formatTable prints table', () => {
    const parsed = parseContainer(input)!;
    const cat = categorizeItems(parsed.items, groups);
    const table = formatTable('POJEMNIK', cat, 1);
    expect(table).toMatch(/kamienie/);
    expect(table).toMatch(/upiorny mglisty calun/);
  });

  test('formatTable supports multiple columns', () => {
    const parsed = parseContainer(input)!;
    const cat = categorizeItems(parsed.items, groups);
    const table = formatTable('POJEMNIK', cat, 2);
    // Should have two counts in one line when columns=2
    expect(table.split('\n').some(line => line.split('|').length > 4)).toBe(true);
  });
});
