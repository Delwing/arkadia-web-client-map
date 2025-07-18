import initTransportStops from '../src/scripts/transportStops';
import Triggers from '../src/Triggers';
import Bjorn from '../src/scripts/ships/Bjorn.json';

class FakeClient {
  Triggers = new Triggers({} as unknown as any);
  Map = { setMapRoomById: jest.fn() } as any;
}

describe('transport stop triggers', () => {
  let client: FakeClient;
  let parse: (line: string) => string;

  beforeEach(() => {
    client = new FakeClient();
    initTransportStops(client as unknown as any);
    parse = (line: string) => Triggers.prototype.parseLine.call(client.Triggers, line, '');
    jest.clearAllMocks();
  });

  test('stop pattern sets map location', () => {
    const stop = Bjorn.stops[0];
    const line = 'Bjorn krzyczy: Doplynelismy do przystani na wyspie Mekan! Mozna wysiadac!';
    parse(line);
    expect(client.Map.setMapRoomById).toHaveBeenCalledWith(stop.destination);
  });
});
