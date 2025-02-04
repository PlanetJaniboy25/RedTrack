import {Router, Request, Response} from 'express';
import {requiresAuth} from "../ApiServer";
import Pings from "../../models/Pings";
import Server from "../../models/Server";

const router = Router();

router.get('/all', requiresAuth, async (req: Request, res: Response) => {
    console.log("all")

    let allPings = [];

    //if no query.from and query.to, get all pings
    let inRange = req.query.from && req.query.to;

    if (!inRange) {
        allPings = await Pings.find();
    } else {
        allPings = await Pings.find({
            $and: [
                {
                    timestamp: {
                        $gte: parseInt(req.query.from as string)
                    }
                },
                {
                    timestamp: {
                        $lte: parseInt(req.query.to as string)
                    }
                }
            ]
        });
    }

    allPings = allPings.sort((a, b) => {
        //timestamp old to new
        return a.timestamp - b.timestamp;
    })

    //sort by serverId
    /*
    let sortedPings = allPings.sort((a, b) => {
        return a.server.localeCompare(b.server);
    });

    if (allPings.length === 0) {
        res.json({
            from: parseInt(req.query.from as string),
            to: parseInt(req.query.to as string),
            data: {}
        })
        return;
    }

    //from is earliest timestamp from all pings, to is latest timestamp from all pings
    let from = inRange ? parseInt(req.query.from as string) : allPings[0].timestamp;
    let to = inRange ? parseInt(req.query.to as string) : allPings[allPings.length - 1].timestamp;

    //serverColors as _id -> color
    let serverColors = await Server.find().then(servers => {
        let colors = {} as any;
        servers.forEach((server: any) => {
            colors[server._id.toString()] = server.color;
        });
        return colors;
    });

    let data = sortedPings.reduce((acc, ping) => {
        // @ts-ignore
        if (!acc[ping.server]) {
            // @ts-ignore
            acc[ping.server] = {pings: [], color: serverColors[ping.server]};
        }
        // @ts-ignore
        acc[ping.server].pings.push({
            timestamp: ping.timestamp,
            count: ping.playerCount
        });
        return acc;
    }, {})*/

    let from = inRange ? parseInt(req.query.from as string) : allPings[0].timestamp;
    let to = inRange ? parseInt(req.query.to as string) : allPings[allPings.length - 1].timestamp;

    let serverColors = await Server.find().then(servers => {
        let colors = {} as any;
        servers.forEach((server: any) => {
            colors[server._id.toString()] = server.color;
        });
        return colors;
    });

    let data = {} as any;

    for (let singlePing of allPings) {
        for (let serverId in singlePing.data) {
            if (!data[serverId]) {
                data[serverId] = {
                    pings: [],
                    color: serverColors[serverId]
                }
            }
            await data[serverId].pings.push({
                timestamp: singlePing.timestamp,
                count: singlePing.data[serverId]
            });
        }
    }

    res.json({
        from,
        to,
        data
    })
});

router.get('/latest', requiresAuth, async (req: Request, res: Response) => {
        /*const servers = await Server.find();

        const currentMillis = Date.now();

        const serversWithPings = await Promise.all(servers.map(async (server) => {
            const latestPings = await Pings.aggregate([
                {$match: {server: server._id.toString()}},   // Match the server ID
                {$sort: {timestamp: -1}},         // Sort by timestamp in descending order
                {$limit: 1}                         // Limit to the most recent ping
            ]);

            const latestPing = latestPings.length > 0 ? latestPings[0] : null

            const dailyPeak = await Pings.aggregate([
                {
                    $match: {
                        server: server._id.toString(),
                        timestamp: {$gte: currentMillis - 24 * 60 * 60 * 1000}
                    }
                },
                {
                    $group: {
                        _id: undefined,
                        playerCount: {$max: "$playerCount"},
                        timestamp: {$first: "$timestamp"}
                    }
                }
            ]);

            const record = await Pings.aggregate([
                {$match: {server: server._id.toString()}},
                {
                    $group: {
                        _id: undefined,
                        playerCount: {$max: "$playerCount"},
                        timestamp: {$first: "$timestamp"}
                    }
                }
            ]);

            const outdated = !latestPing || (currentMillis - latestPing.timestamp) > (parseInt(process.env.ping_rate as string) * 2)

            return {
                internalId: server._id.toString(),
                server: server.name,
                playerCount: latestPing ? latestPing.playerCount : 0,
                dailyPeak: dailyPeak.length ? dailyPeak[0].playerCount : 0,
                dailyPeakTimestamp: dailyPeak.length ? dailyPeak[0].timestamp : 0,
                record: record.length ? record[0].playerCount : 0,
                recordTimestamp: record.length ? record[0].timestamp : 0,
                invalidPings: !latestPing,
                outdated
            };
        }));


        res.json(serversWithPings);*/

        let serverNames = await Server.find().then(servers => {
            let names = {} as any;
            servers.forEach((server: any) => {
                names[server._id.toString()] = server.name;
            });
            return names;
        });

        const allPings = await Pings.find();
        const currentMillis = Date.now();
        const latestPings = allPings.filter(ping => {
            return (currentMillis - ping.timestamp) < (parseInt(process.env.ping_rate as string) * 2);
        }).sort((a, b) => {
            return b.timestamp - a.timestamp;
        });

        let data = {} as any;

        for (let singlePing of allPings) {
            for (let serverId in singlePing.data) {
                if (!data[serverId]) {
                    data[serverId] = {
                        dailyPeak: 0,
                        dailyPeakTimestamp: 0,
                        record: 0,
                        recordTimestamp: 0,
                        latestPing: 0,
                        name: serverNames[serverId] || serverId,
                    }
                }

                if (singlePing.data[serverId] > data[serverId].record) {
                    data[serverId].record = singlePing.data[serverId];
                    data[serverId].recordTimestamp = singlePing.timestamp;
                }

                if (singlePing.timestamp > currentMillis - 24 * 60 * 60 * 1000) {
                    if (singlePing.data[serverId] > data[serverId].dailyPeak) {
                        data[serverId].dailyPeak = singlePing.data[serverId];
                        data[serverId].dailyPeakTimestamp = singlePing.timestamp;
                    }
                }

                if (singlePing.timestamp > data[serverId].latestPing) {
                    data[serverId].latestPing = singlePing.data[serverId];
                }
            }
        }

        let finalData = [] as any;

        for (let serverId in data) {
            finalData.push({
                internalId: serverId,
                server: data[serverId].name,
                playerCount: data[serverId].latestPing,
                dailyPeak: data[serverId].dailyPeak,
                dailyPeakTimestamp: data[serverId].dailyPeakTimestamp,
                record: data[serverId].record,
                recordTimestamp: data[serverId].recordTimestamp,
                invalidPings: !data[serverId].latestPing,
                outdated: (currentMillis - data[serverId].latestPing.timestamp) > (parseInt(process.env.ping_rate as string) * 2)
            });
        }

        res.json(finalData);
    }
)
;

export default router;