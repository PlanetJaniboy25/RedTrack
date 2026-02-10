import { ping as pingBedrock } from "bedrock-protocol";
import { ServerData } from "../../../types/ServerData";
import Server from '../models/Server';
import Pings from "../models/Pings";

async function pingServer(data: ServerData, isBedrockServer: boolean): Promise<number | null> {
    if (isBedrockServer) {
        try {
            let pingData = await pingBedrock({
                host: data.ip.valueOf(),
                port: data.port.valueOf()
            })

            return typeof pingData?.playersOnline === "number" ? pingData.playersOnline : null;
        } catch (e) {
            return null;
        }
    }

    try {
        const { status } = require("minecraft-server-util");
        const response = await status(data.ip.valueOf(), data.port.valueOf(), {
            timeout: 5000,
            enableSRV: true,
        });
        return typeof response?.players?.online === "number" ? response.players.online : null;
    } catch (e) {
        return null;
    }
}

async function pingAll() {
    let data = {} as Record<string, number>;
    const servers = await Server.find();

    for (const srv of servers) {
        try {
            const isBedrockServer = srv.bedrock !== false;
            const playerCount = await pingServer({ ip: srv.ip, port: srv.port, name: srv.name, serverId: srv._id } as any as ServerData, isBedrockServer);
            if (playerCount === null) continue;
            data[srv._id.toString()] = playerCount;
        } catch (e) { }
    }

    await new Pings({
        timestamp: Date.now(),
        data: data
    }).save();
}

export { pingServer, pingAll }
