import ClientScript from "../ClientScript.ts";
import { fakeClient } from "../fakeClient.ts";

export default new ClientScript(fakeClient)
    .reset()
    .fake("Baz uciekl ci.")
    .fake("Baz podaza na wschod.")
    .fake("Foo uciekl ci.")
    .fake("Foo w panice ucieka na polnoc.");
