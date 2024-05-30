import Client from "./Client";
import { Move } from "../shared/types";
import { BoardState } from "../shared/types";

import { alwaysPlay1, greedy } from './strategies';

const client1 = new Client("client1", alwaysPlay1);
// const client2 = new Client("client2", greedy);
// const client3 = new Client("client3", greedy);
client1.start();
