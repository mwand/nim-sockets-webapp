import Client from "./Client";
import { Move } from "../shared/types";
import { BoardState } from "../shared/types";

import { alwaysPlay1, greedy, illegal } from './strategies';

/// const client1 = new Client("adrian", alwaysPlay1);
// const client2 = new Client("blair", greedy);
const client3 = new Client("client3", illegal);
client3.start();
