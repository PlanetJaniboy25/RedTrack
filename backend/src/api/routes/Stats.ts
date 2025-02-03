import { Router, Request, Response } from 'express';
import Users from "../../models/Users";
import Sessions from "../../models/Sessions";
import {requiresAuth} from "../ApiServer";
import Pings from "../../models/Pings";

const router = Router();

router.get('/all', requiresAuth, async (req: Request, res: Response) => {
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

        //log from, to and data
        console.log(allPings, parseInt(req.query.from as string), parseInt(req.query.to as string));
    }

    allPings = allPings.sort((a, b) => {
        //timestamp old to new
        return a.timestamp - b.timestamp;
    })

    //sort by serverId
    let sortedPings = allPings.sort((a, b) => {
        return a.server.localeCompare(b.server);
    });

    if(allPings.length === 0) {
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

    res.json({
        from,
        to,
        data: {
            //serverId: [{timestamp, count}, ...],
            //...
            ...sortedPings.reduce((acc, ping) => {
                // @ts-ignore
                if (!acc[ping.server]) {
                    // @ts-ignore
                    acc[ping.server] = [];
                }
                // @ts-ignore
                acc[ping.server].push({
                    timestamp: ping.timestamp,
                    count: ping.playerCount
                });
                return acc;
            }, {})
        }
    })
});

export default router;