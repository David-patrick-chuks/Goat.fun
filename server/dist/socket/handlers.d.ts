import { Server, Socket } from "socket.io";
import type { ClientEvents, ServerEvents } from "../types/socket";
export declare function registerSocketHandlers(io: Server<ClientEvents, ServerEvents>, socket: Socket<ClientEvents, ServerEvents>): void;
//# sourceMappingURL=handlers.d.ts.map